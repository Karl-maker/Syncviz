import { db } from "../../helpers/db.mjs";
import logger from "../../log/server-logger.mjs";
import bcrypt from "bcrypt";

//To retrieve certain fields https://www.codegrepper.com/code-examples/javascript/mongoose+select+fields

export default {
  create,
  _delete,
  getByUsername,
  getOneByUsername,
};

//.....Service Functions

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
      users = await db.user
        .find({ is_confirmed: true })
        .skip(page_size * page)
        .limit(page_size)
        .sort(get_order); // get all;
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
