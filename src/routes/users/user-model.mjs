import mongoose from "mongoose";

//--------CONSTANTS--------------
const MIN_USERNAME = 6;
const MAX_USERNAME = 12;
const MIN_NAME = 1;
const MAX_NAME = 255;
const MAX_PASSWORD = 50;
const MIN_PASSWORD = 8;

//--------------------------------------------------------------------------------

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "A first name is required."],
    trim: true,
    min: [MIN_NAME, `Name cannot be less than ${MIN_NAME} characters`],
    max: [MAX_NAME, `Name cannot be more than ${MAX_NAME} characters`],
  },
  last_name: {
    type: String,
    required: [true, "A last name is required."],
    trim: true,
    min: [MIN_NAME, `Name cannot be less than ${MIN_NAME} characters`],
    max: [MAX_NAME, `Name cannot be more than ${MAX_NAME} characters`],
  },
  username: {
    type: String,
    required: [true, "A username is required."],
    min: [
      MIN_USERNAME,
      `Username cannot be less than ${MIN_USERNAME} characters`,
    ],
    max: [
      MAX_USERNAME,
      `Username cannot be more than ${MIN_USERNAME} characters`,
    ],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "A E-mail is required."],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "A password is required."],
    min: [
      MIN_PASSWORD,
      `Password cannot be less than ${MIN_PASSWORD} characters`,
    ],
    max: [
      MAX_PASSWORD,
      `Password cannot be more than ${MAX_PASSWORD} characters`,
    ],
  },
  profile_picture: { space: String, link: String, file_name: String },
  login_info: {
    last_login: {
      ip_address: String,
      refresh_token: String,
      expire_date: Date,
      created_date: Date,
    },
    logins: [
      //Limited Number
      {
        ip_address: String,
        refresh_token: String,
        expire_date: Date,
        created_date: Date,
      },
    ],
  },
  membership_info: {
    is_premium: Boolean,
    expire_date: Date,
  },
  is_confirmed: { type: Boolean, default: 0 },
  registered_at: { type: Date, default: Date.now() },
});

const User = mongoose.model("User", UserSchema);
export default User;
