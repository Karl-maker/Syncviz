"use strict";

import { db } from "../../helpers/db.mjs";
import config from "../../config/config.mjs";
import logger from "../../log/server-logger.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

//To retrieve certain fields https://www.codegrepper.com/code-examples/javascript/mongoose+select+fields

export default {
  create,
  _delete,
  getByUsername,
  getOneByUsername,
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
    { password: 1, is_confirmed: 1 }
  );

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw { name: "UnauthorizedError", message: "User is unauthorized" };
  }

  if (!user.is_confirmed) {
    throw { name: "NotConfirmed", message: "Email Not Confirmed" };
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
      expiresIn: config.jwt.ACCESS_TOKEN_LIFE,
      algorithm: config.jwt.ALGORITHM,
    });

    const refresh_token = jwt.sign(payload, REFRESH_TOKEN_PRIVATE_KEY, {
      issuer: config.jwt.ISSUER,
      subject: username,
      audience: [origin],
      expiresIn: config.jwt.REFRESH_TOKEN_LIFE,
      algorithm: config.jwt.ALGORITHM,
    });

    return {
      access_token: access_token,
      refresh_token: refresh_token,
    };
  } catch (err) {
    throw { name: "UnexpectedError", message: err.message };
  }
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

  return;
  // Our register logic ends here
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

async function _delete(credentials) {}

//----------Utilites--------------
