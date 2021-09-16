"use strict";

import db from "../../helpers/db.mjs";
import config from "../../config/config.mjs";
import logger from "../../log/server-logger.mjs";
import transporter from "../../helpers/email.mjs";
import { client } from "../../helpers/redis.mjs";
import bcrypt from "bcrypt";
import axios from "axios";
import jwt from "jsonwebtoken";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";
const __dirname = dirname(fileURLToPath(import.meta.url));

//To retrieve certain fields https://www.codegrepper.com/code-examples/javascript/mongoose+select+fields

export default {
  create,
  _delete,
  getByUsername,
  getOneByUsername,
  getAccessToken,
  deleteRefreshToken,
  getResetPasswordLink,
  confirmUserEmail,
  setUserPassword,
  resetPassword,
  login,
};

//.....Service Functions: ONLY req

async function login(req) {
  const username = req.body.username.toLowerCase() || null;
  const password = req.body.password || null;
  const origin = req.body.origin.toLowerCase() || null;
  const email = req.body.email.toLowerCase() || null;

  if ((!username && !email) || !password) {
    throw { name: "UnauthorizedError", message: "Fill In Fields" };
  }

  if (!origin) {
    throw { name: "UnauthorizedError", message: "Unexpected Error" };
  }

  var user;
  var query = {};

  //Email OR Username OR OTHER

  if (username) {
    query.username = username;
  }

  if (email) {
    query.email = email;
  }

  user = await db.user.findOne(query, {
    password: 1,
    is_confirmed: 1,
    email: 1,
    username: 1,
    first_name: 1,
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw { name: "UnauthorizedError", message: "User is unauthorized" };
  }

  if (!user.is_confirmed) {
    try {
      await getConfirmationEmail(user);
    } catch (err) {
      throw { name: "UnexpectedError", message: err.message };
    }
    throw { name: "NotConfirmed", message: "Check Email To Confirm User" };
  }

  // If they got this far their password is correct... return jwt access_token & save refresh_token

  try {
    const payload = {
      id: user._id,
    };

    const ACCESS_TOKEN_PRIVATE_KEY = config.jwt.ACCESS_TOKEN_PRIVATE_KEY;
    const REFRESH_TOKEN_PRIVATE_KEY = config.jwt.REFRESH_TOKEN_PRIVATE_KEY;

    const access_token = await jwt.sign(payload, ACCESS_TOKEN_PRIVATE_KEY, {
      issuer: config.jwt.ISSUER,
      subject: user.username,
      audience: [origin],
      expiresIn: `${config.jwt.ACCESS_TOKEN_LIFE * 60}s`,
      algorithm: config.jwt.ALGORITHM,
    });

    const refresh_token = await jwt.sign(payload, REFRESH_TOKEN_PRIVATE_KEY, {
      issuer: config.jwt.ISSUER,
      subject: user.username,
      audience: [origin],
      expiresIn: `${config.jwt.REFRESH_TOKEN_LIFE}d`,
      algorithm: config.jwt.ALGORITHM,
    });

    const refresh_expire = new Date(
      Date.now() + config.jwt.REFRESH_TOKEN_LIFE * 24 * 60 * 60 * 1000
    ); //first digit for days
    const access_expire = config.jwt.ACCESS_TOKEN_LIFE;

    //Delete latest login if they're 4 and save this one

    const login_amount = await db.login.count({ user_id: user._id });

    if (login_amount > 4) {
      await db.login.findOneAndDelete({ user_id: user._id });
    }

    await db.login.create({
      refresh_token: refresh_token,
      user_id: user._id,
      expire_date: refresh_expire,
    });

    return {
      access_token: { token: access_token, expires: access_expire },
      refresh_token: { token: refresh_token, expires: refresh_expire },
    };
  } catch (err) {
    throw { name: "UnexpectedError", message: err.message };
  }
}

async function deleteRefreshToken(req) {
  const user = req.user;
  const username = req.body.username.toLowerCase();
  const origin = req.body.origin.toLowerCase();
  const cookie_token = req.cookies["refresh_token"];

  //Get Key
  const REFRESH_TOKEN_PUBLIC_KEY = config.jwt.REFRESH_TOKEN_PUBLIC_KEY;

  const payload = await jwt.verify(cookie_token, REFRESH_TOKEN_PUBLIC_KEY, {
    issuer: config.jwt.ISSUER,
    subject: username, //Stored In Local Storage
    audience: origin, //Stored In Local Storage
    expiresIn: `${config.jwt.REFRESH_TOKEN_LIFE}d`,
    algorithm: [config.jwt.ALGORITHM],
  });

  if (!payload) {
    throw { name: "UnauthorizedError" };
  }

  try {
    await db.login.findOneAndDelete({
      user_id: payload.id,
      refresh_token: cookie_token,
    });
  } catch (err) {
    throw { name: "UnexpectedError" };
  }

  return;
}

async function confirmUserEmail(req) {
  const PIN = req.body.code;
  const username = req.body.username.toLowerCase() || null;
  const email = req.body.email.toLowerCase() || null;
  var user;
  var select = {
    token_code: req.body.code,
  };

  //Email OR Username OR OTHER

  if (username) {
    select.username = username.toLowerCase();
  }

  if (email) {
    select.email = email.toLowerCase();
  }

  user = await db.user.findOne(select);

  if (new Date(user.token_expiration).valueOf() > new Date().valueOf()) {
    throw { name: "UnexpectedError", message: err.message };
  }

  select.token_code = PIN;

  try {
    user = await db.user.findOneAndUpdate(select, {
      is_confirmed: true,
      token_code: null,
      token_expiration: null,
    });
  } catch (err) {
    throw { name: "UnexpectedError", message: err.message };
  }

  return;
}

async function resetPassword(req) {
  const PIN = req.body.code;
  const username = req.body.username.toLowerCase();
  const email = req.body.email.toLowerCase();
  const new_password = req.body.new_password;
  const confirm_password = req.body.confirm_password;

  var select = {};

  if (!username && !email) {
    throw { name: "UnauthorizedError", message: "Fill In Fields" };
  }

  if (confirm_password !== new_password) {
    throw {
      name: "ValidationError",
      message: {
        prompt: "Validation Error",
        field: { confirmed_password: "Passwords must match" },
      },
    };
  }
  var user;

  if (username) {
    select.username = username;
  }

  if (email) {
    select.email = email;
  }

  user = await db.user.findOne(select, {
    password: 1,
    email: 1,
    token_expiration: 1,
    username: 1,
  });
  if (new Date(user.token_expiration).valueOf() > new Date().valueOf()) {
    throw { name: "UnexpectedError", message: err.message };
  }

  try {
    await db.user.findOneAndUpdate(
      { username: user.username, token_code: PIN },
      {
        password: await bcrypt.hash(new_password, 10),
        token_code: null,
        token_expiration: null,
      }
    );
  } catch (err) {
    throw { name: "UnexpectedError", message: err.message };
  }

  return;
}

async function create(req) {
  // Get user input
  const { first_name, last_name, password, confirmed_password } = req.body;
  const username = req.body.username.toLowerCase();
  const email = req.body.email.toLowerCase();

  //Check Password
  if (confirmed_password !== password) {
    throw {
      name: "ValidationError",
      message: {
        prompt: "Validation Error",
        field: { confirmed_password: "Passwords must match" },
      },
    };
  }

  // check if user already exist--------------

  // Validate if user exist in our database
  if (await db.user.findOne({ email: email.toLowerCase() })) {
    throw {
      name: "AlreadyExist",
      message: {
        prompt: "Already Exist",
        field: { email: "Email already in use" },
      },
    };
  }
  if (await db.user.findOne({ username: username.toLowerCase() })) {
    throw {
      name: "AlreadyExist",
      message: {
        prompt: "Already Exist",
        field: { username: "Username already taken" },
      },
    };
  }

  //Encrypt user password
  const encryptedPassword = await bcrypt.hash(password, 10);

  // Create user in our database
  const new_user = await db.user.create({
    first_name,
    last_name,
    username: username.toLowerCase(), //sanitize
    email: email.toLowerCase(), //sanitize
    password: encryptedPassword,
  });

  //--------------------------------Send Email To Confirm User-----------------------------------

  try {
    await getConfirmationEmail(new_user);
  } catch (err) {
    throw { name: "UnexpectedError", message: err.message };
  }

  return;
  // Our register logic ends here
}

async function getAccessToken(req) {
  const username = req.body.username.toLowerCase();
  const origin = req.body.origin.toLowerCase();
  const cookie_token = req.cookies["refresh_token"];
  //Verify Token

  try {
    //Get Key
    const REFRESH_TOKEN_PUBLIC_KEY = config.jwt.REFRESH_TOKEN_PUBLIC_KEY;
    const ACCESS_TOKEN_PRIVATE_KEY = config.jwt.ACCESS_TOKEN_PRIVATE_KEY;

    const payload = jwt.verify(cookie_token, REFRESH_TOKEN_PUBLIC_KEY, {
      issuer: config.jwt.ISSUER,
      subject: username, //Stored In Local Storage
      audience: origin, //Stored In Local Storage
      expiresIn: `${config.jwt.REFRESH_TOKEN_LIFE}d`,
      algorithm: [config.jwt.ALGORITHM],
    });

    if (!payload) {
      throw { name: "UnauthorizedError" };
    }

    const login_info = await db.login.findOne({
      user_id: payload.id,
      refresh_token: cookie_token,
    });

    //Check if login expire

    if (new Date(login_info.expire_date).valueOf() < new Date().valueOf()) {
      await db.login.findOneAndDelete({
        user_id: payload.id,
        refresh_token: cookie_token,
      });
      throw { name: "UnauthorizedError" };
    }

    //Get New Token

    const access_token = jwt.sign(
      { id: payload.id },
      ACCESS_TOKEN_PRIVATE_KEY,
      {
        issuer: config.jwt.ISSUER,
        subject: username,
        audience: [origin],
        expiresIn: `${config.jwt.ACCESS_TOKEN_LIFE * 60}s`,
        algorithm: config.jwt.ALGORITHM,
      }
    );

    const access_expire = config.jwt.ACCESS_TOKEN_LIFE;

    return {
      access_token: { token: access_token, expires: access_expire },
    };
  } catch (err) {
    throw { message: err.message };
  }
}

async function getByUsername(req) {
  //parameters = req
  const page_size = parseInt(req.query.page_size, 10);
  const page_number = parseInt(req.query.page_number, 10);
  const q = req.query.q.toLowerCase();
  const order = "asc";
  const user = req.user;
  const cacheKey = `users?q=${q}`;
  const getCacheAsync = promisify(client.get).bind(client);
  const setCacheAsync = promisify(client.setex).bind(client);

  //Check cache for first 10 users if user is searching like a crazy person

  var users = [{}];
  var meta_data = { source: "database" };

  //------Pagenation Helpers-------------

  const page = Math.max(0, page_number);

  //------Order Helpers------------------

  var get_order;

  //default
  if (!order) {
    get_order = {
      username: "asc",
    };
  } else {
    get_order = {
      username: order,
    };
  }

  var query = {
    is_confirmed: true,
  };

  if (q) {
    query.username = { $regex: `${q}`, $options: `i` };
  } else {
    /*
  ------------------------------------------CACHE SECTION START------------------------------------------------------

  1. Code containing Redis Caching
  2. Checking cache before database

  ------------------------------------------CACHE SECTION START------------------------------------------------------
  */

    try {
      users = await getCacheAsync(`users?u=${user.username}`).then(
        (results) => {
          if (results) {
            meta_data.source = "cache";
            return JSON.parse(results);
          }
        }
      );
    } catch (err) {
      logger.error({
        message: err.message,
        timestamp: `${new Date().toString()}`,
      });
    }

    /*
  ------------------------------------------CACHE SECTION END------------------------------------------------------

  1. Code containing Redis Caching
  2. Checking cache before database

  ------------------------------------------CACHE SECTION END------------------------------------------------------
  */

    if (!users) throw { name: "NotFound", message: "No Users" };

    return { users, meta_data };
  }

  /*
  ------------------------------------------CACHE SECTION START------------------------------------------------------

  1. Code containing Redis Caching
  2. Checking cache before database

  ------------------------------------------CACHE SECTION START------------------------------------------------------
  */
  if (page_number === 0) {
    try {
      return await getCacheAsync(cacheKey).then((results) => {
        if (results) {
          meta_data.source = "cache";
          users = JSON.parse(results);
          return { users, meta_data };
        }
      });
    } catch (err) {
      logger.error({
        message: err.message,
        timestamp: `${new Date().toString()}`,
      });
    }
  }
  /*
  ------------------------------------------CACHE SECTION END------------------------------------------------------

  1. Code containing Redis Caching
  2. Checking cache before database

  ------------------------------------------CACHE SECTION END------------------------------------------------------
  */

  //----------Add Filters----------

  try {
    users = await db.user
      .find(query, {
        is_confirmed: 0,
        use_email_notification: 0,
        token_code: 0,
        token_expiration: 0,
        registered_date: 0,
        membership_info: 0,
        email: 0,
        __v: 0,
      })
      .limit(page_size)
      .skip(page_size * page)
      .sort(get_order); // get all
  } catch (e) {
    throw { name: "UnexpectedError", message: e.message };
  }

  /*
  ------------------------------------------CACHE SECTION START------------------------------------------------------

  1. Code containing Redis Caching
  2. Storing results in cache for next time

  ------------------------------------------CACHE SECTION START------------------------------------------------------
  */

  try {
    await setCacheAsync(cacheKey, 120, JSON.stringify(users));
  } catch (err) {
    logger.error({
      message: err.message,
      timestamp: `${new Date().toString()}`,
    });
  }

  /*
  ------------------------------------------CACHE SECTION END------------------------------------------------------

  1. Code containing Redis Caching
  2. Storing results in cache for next time

  ------------------------------------------CACHE SECTION END------------------------------------------------------
  */

  return { users, meta_data };
}

async function getOneByUsername(req) {
  const username = req.params.username.toLowerCase();
  const cacheKey = `user/${username}`;
  const user_source = req.user.username;
  const getCacheAsync = promisify(client.get).bind(client);
  const setCacheAsync = promisify(client.setex).bind(client);
  var user;
  var meta_data;

  /*
  ------------------------------------------CACHE SECTION START------------------------------------------------------

  1. Code containing Redis Caching
  2. Checking cache before database

  ------------------------------------------CACHE SECTION START------------------------------------------------------
  */

  try {
    user = await getCacheAsync(cacheKey)
      .then((result) => {
        if (result) {
          meta_data = {
            source: "cache",
          };
          return JSON.parse(result);
        }
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    logger.error({
      message: err.message,
      timestamp: `${new Date().toString()}`,
    });
  }

  /*
  ------------------------------------------CACHE SECTION END------------------------------------------------------

  1. Code containing Redis Caching
  2. Checking cache before database

  ------------------------------------------CACHE SECTION END------------------------------------------------------
  */

  //... Check in db if not found

  if (!user) {
    try {
      user = await db.user.findOne(
        { username: username },
        {
          is_confirmed: 0,
          use_email_notification: 0,
          token_code: 0,
          token_expiration: 0,
          registered_date: 0,
          membership_info: 0,
          email: 0,
          __v: 0,
        }
      );
    } catch (err) {
      throw { message: err.messgae };
    }

    meta_data = {
      source: "database",
    };
  }

  /*
  ------------------------------------------CACHE SECTION START------------------------------------------------------

  1. Code containing Redis Caching
  2. Storing in cache for next time
  3. Storing query history

  ------------------------------------------CACHE SECTION START------------------------------------------------------
  */

  try {
    if (user) {
      //30 Days incase user is deleted it will disappear overtime since it doesn't update
      await setCacheAsync(cacheKey, 86400 * 30, JSON.stringify(user));

      //get cache and add to list

      var cache_list;

      if (
        await getCacheAsync(`users?u=${user_source}`).then((result) => {
          if (result) {
            cache_list = result;
            return true;
          } else {
            return false;
          }
        })
      ) {
        cache_list = JSON.parse(cache_list);

        //Compare

        var shouldUpdate = true;

        for (var i = 0; i < cache_list.length; i++) {
          if (cache_list[i].username === user.username) {
            shouldUpdate = false;
            i = cache_list.length + 1;
          }
        }
        if (shouldUpdate) {
          cache_list = [user].concat(cache_list);
          if (cache_list.length > 5) {
            cache_list.pop(); //Keep list at 5 elements
          }
        }

        await setCacheAsync(
          `users?u=${user_source}`,
          86400 * 30,
          JSON.stringify(cache_list)
        );
      } else {
        //Cache miss
        await setCacheAsync(
          `users?u=${user_source}`,
          86400 * 30,
          JSON.stringify([user])
        );
      }
    }
  } catch (err) {
    logger.error({
      message: err.message,
      timestamp: `${new Date().toString()}`,
    });
  }

  /*
  ------------------------------------------CACHE SECTION END------------------------------------------------------

  1. Code containing Redis Caching
  2. Storing in cache for next time
  3. Storing query history

  ------------------------------------------CACHE SECTION END------------------------------------------------------
  */

  if (!user) {
    throw {
      name: "NotFound",
      message: `${username} Not Found`,
    };
  }

  return { user, meta_data };
}

async function setUserPassword(req) {
  var current;
  const username = req.user.username.toLowerCase();
  const current_password = req.body.current_password;
  const new_password = req.body.new_password;
  const confirm_password = req.body.confirm_password;
  try {
    current = await db.user.findOne({ username: username }, { password: 1 });
  } catch (err) {
    throw { message: "Unexpected Error With Database Retrieval" };
  }

  if (!(await bcrypt.compare(current_password, current.password))) {
    throw { name: "UnauthorizedError", message: "Password is incorrect" };
  }

  if (new_password !== confirm_password) {
    throw { name: "UnauthorizedError", message: "Passwords must match" };
  }

  await setPassword(new_password, req.user._id);

  return;
}

async function getResetPasswordLink(req) {
  const username = req.body.username.toLowerCase() || null;
  const email = req.body.email.toLowerCase() || null;

  if (!username && !email) {
    throw { name: "UnauthorizedError", message: "Fill In Fields" };
  }

  var search = {};

  if (email) {
    search.email = email;
  }
  if (username) {
    search.username = username;
  }

  //Email OR Username
  const user = await db.user.findOne(search, {
    is_confirmed: 1,
    email: 1,
    username: 1,
    first_name: 1,
  });

  if (!user.email) {
    throw { name: "UnauthorizedError" };
  }

  //Create PIN

  const PIN = (Math.random() + 1).toString(36).substring(5);

  await db.user.findOneAndUpdate(
    { username: user.username },
    { token_code: PIN, token_expiration: new Date(Date.now() + 1 * 60 * 1000) }
  );

  await sendEmail({
    subject: "Reset Password",
    message: `Click Link to Reset Password: ${config.client.PROTOCOL}://${config.client.HOST}:${config.client.PORT}/reset-password/${PIN}`,
    email: user.email,
  });

  return;
}

async function _delete(req) {
  const password = req.body.password;
  const username = req.body.username.toLowerCase();

  //Compare Passwords

  const user = await db.user.findOne({ username: username }, { password: 1 });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw { name: "UnauthorizedError", message: "User is unauthorized" };
  }

  await db.user.findOneAndDelete({ username: username });

  return;
}

//------Utilites----------

async function sendEmail({ subject, message, email }) {
  transporter.sendMail({
    from: config.email.SENDER_MAIL_ADDRESS,
    to: email,
    subject: subject,
    html: message,
  });
}

async function setPassword(password, id) {
  return await db.user.findOneAndUpdate(
    { _id: id },
    { password: await bcrypt.hash(password, 10) }
  );
}

async function getConfirmationEmail(user) {
  /*
  1. Get username
  2. Find user 
  3. Get Email
  4. Generate PIN
  - Store PIN against user in DB
  5. Send Email
  6. Return Email in a STRING
  */

  const PIN = await (Math.random() + 1).toString(36).substring(5);

  //Handlebars

  try {
    await db.user.findOneAndUpdate(
      { username: user.username },
      {
        token_code: PIN,
        token_expiration: new Date(Date.now() + 1 * 60 * 1000),
      }
    );
  } catch (err) {
    throw { name: "UnexpectedError", message: err.message };
  }

  try {
    await sendEmail({
      subject: "Confirm Email",
      message: `Hi ${
        user.first_name || user.username
      }, your confirmation code is ${PIN}`,
      email: user.email,
      html: "emailHTML",
    });
  } catch (err) {
    throw { name: "UnexpectedError", message: err.message };
  }

  return `Hi ${
    user.first_name || user.username
  }, your confirmation code has been sent to your Email`;
}
