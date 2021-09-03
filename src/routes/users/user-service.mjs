"use strict";

import { db } from "../../helpers/db.mjs";
import config from "../../config/config.mjs";
import logger from "../../log/server-logger.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import transporter from "../../helpers/email.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

//To retrieve certain fields https://www.codegrepper.com/code-examples/javascript/mongoose+select+fields

export default {
  create,
  _delete,
  getByUsername,
  getOneByUsername,
  getAccessToken,
  getConfirmationEmail,
  confirmUserEmail,
  login,
};

//.....Service Functions

async function login(input) {
  const username = input.username;
  const password = input.password;
  const origin = input.origin;

  if (!username || !password) {
    throw { name: "UnauthorizedError", message: "Fill In Fields" };
  }

  const user = await db.user.findOne(
    { username: username },
    { password: 1, is_confirmed: 1, email: 1, username: 1, first_name: 1 }
  );

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

    const ACCESS_TOKEN_PRIVATE_KEY = fs.readFileSync(
      path.resolve(__dirname, `../../..${config.jwt.ACCESS_TOKEN_PRIVATE_KEY}`),
      "utf8"
    );

    const REFRESH_TOKEN_PRIVATE_KEY = fs.readFileSync(
      path.resolve(
        __dirname,
        `../../..${config.jwt.REFRESH_TOKEN_PRIVATE_KEY}`
      ),
      "utf8"
    );

    const access_token = jwt.sign(payload, ACCESS_TOKEN_PRIVATE_KEY, {
      issuer: config.jwt.ISSUER,
      subject: username,
      audience: [origin],
      expiresIn: `${config.jwt.ACCESS_TOKEN_LIFE * 60}s`,
      algorithm: config.jwt.ALGORITHM,
    });

    const refresh_token = jwt.sign(payload, REFRESH_TOKEN_PRIVATE_KEY, {
      issuer: config.jwt.ISSUER,
      subject: username,
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

async function confirmUserEmail(data) {
  const PIN = data.code;
  const username = data.username;

  const user = db.user.findOne({ username: username });

  if (new Date(user.confirmation_expiration).valueOf() > new Date().valueOf()) {
    throw { name: "UnexpectedError", message: err.message };
  }

  try {
    await db.user.findOneAndUpdate(
      { username: username, confirmation_pin: PIN },
      {
        is_confirmed: true,
        confirmation_pin: null,
        confirmation_expiration: null,
      }
    );
  } catch (err) {
    throw { name: "UnexpectedError", message: err.message };
  }

  return;
}

async function create(credentials) {
  // Get user input
  const {
    first_name,
    last_name,
    email,
    password,
    confirmed_password,
    username,
  } = credentials;

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
  if (await db.user.findOne({ email: email })) {
    throw {
      name: "AlreadyExist",
      message: {
        prompt: "Already Exist",
        field: { email: "Username already taken" },
      },
    };
  }
  if (await db.user.findOne({ username: username })) {
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
  //Verify Token

  try {
    //Get Key
    const REFRESH_TOKEN_PUBLIC_KEY = fs.readFileSync(
      path.resolve(
        __dirname,
        `../../../${config.jwt.REFRESH_TOKEN_PUBLIC_KEY}`
      ),
      "utf8"
    );

    const ACCESS_TOKEN_PRIVATE_KEY = fs.readFileSync(
      path.resolve(
        __dirname,
        `../../../${config.jwt.ACCESS_TOKEN_PRIVATE_KEY}`
      ),
      "utf8"
    );

    const payload = jwt.verify(
      req.cookies["refresh_token"],
      REFRESH_TOKEN_PUBLIC_KEY,
      {
        issuer: config.jwt.ISSUER,
        subject: req.body.username, //Stored In Local Storage
        audience: req.body.origin, //Stored In Local Storage
        expiresIn: `${config.jwt.REFRESH_TOKEN_LIFE}d`,
        algorithm: [config.jwt.ALGORITHM],
      }
    );

    if (!payload) {
      throw { name: "UnauthorizedError" };
    }

    const login_info = await db.login.findOne({
      user_id: payload.id,
      refresh_token: req.cookies["refresh_token"],
    });

    //Check if login expire

    if (new Date(login_info.expire_date).valueOf() < new Date().valueOf()) {
      await db.login.findOneAndDelete({
        user_id: payload.id,
        refresh_token: req.cookies["refresh_token"],
      });
      throw { name: "UnauthorizedError" };
    }

    //Get New Token

    const access_token = jwt.sign(
      { id: payload.id },
      ACCESS_TOKEN_PRIVATE_KEY,
      {
        issuer: config.jwt.ISSUER,
        subject: req.body.username,
        audience: [req.body.origin],
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

  //Check In Database
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

  const PIN = await Math.floor(100000 + Math.random() * 900000); //Generate PIN

  try {
    await db.user.findOneAndUpdate(
      { username: user.username },
      {
        confirmation_pin: PIN,
        confirmation_expiration: new Date(Date.now() + 1 * 60 * 1000),
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
    });
  } catch (err) {
    throw { name: "UnexpectedError", message: err.message };
  }

  return `Hi ${
    user.first_name || user.username
  }, your confirmation code has been sent to your Email`;
}

async function getByUsername(parameters) {
  try {
    //parameters = req
    const page_size = parseInt(parameters.query.page_size, 10);
    const page_number = parameters.query.page_number;
    const q = parameters.query.q;
    const order = parameters.query.order;

    var users = [{}];

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

    if (!q) {
      // users = await db.user
      //   .find({ is_confirmed: true })
      //   .skip(page_size * page)
      //   .limit(page_size)
      //   .sort(get_order); // get all;
      return {};
    } else {
      users = await db.user
        .find({
          username: { $regex: `${q}`, $options: "i" },
          is_confirmed: true,
        })
        .limit(page_size)
        .skip(page_size * page)
        .sort(get_order); // get all
    }
  } catch (e) {
    throw { name: "UnexpectedError", message: e.message };
  }

  return users;
}

async function getOneByUsername(username) {
  const user = await db.user.findOne({ username: username });

  if (!user) {
    throw { name: "NotFound", message: `${username} Not Found` };
  }

  return user;
}

async function _delete(req) {
  const password = req.body.password;

  //Compare Passwords

  const user = await db.user.findOne(
    { username: req.user.username },
    { password: 1 }
  );

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw { name: "UnauthorizedError", message: "User is unauthorized" };
  }

  await db.user.findOneAndDelete({ username: req.user.username });

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
