import { db } from "../../helpers/db.mjs";
import logger from "../../log/server-logger.mjs";
import bcrypt from "bcrypt";

export default {
  create,
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
