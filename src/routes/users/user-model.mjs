import mongoose from "mongoose";

//const

const MIN_NAME = 1;
const MAX_NAME = 100;
const MIN_USERNAME = 6;
const MAX_USERNAME = 20;
const MIN_PASSWORD = 6;
const MAX_PASSWORD = 255;
const MIN_EMAIL = 3;
const MAX_EMAIL = 400;

//--------------------------------------------------------------------------------

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "First name is required"],
    trim: true,
    minLength: [
      MIN_NAME,
      `First name must have more than ${MIN_NAME} characters`,
    ],
    maxlength: [
      MAX_NAME,
      `First name must have less than ${MAX_NAME} characters`,
    ],
  },
  last_name: {
    type: String,
    required: [true, "Last name is required"],
    trim: true,
    minLength: [
      MIN_NAME,
      `First name must have more than ${MIN_NAME} characters`,
    ],
    maxlength: [
      MAX_NAME,
      `Last name must have less than ${MAX_NAME} characters`,
    ],
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [
      MIN_USERNAME,
      `Username must have more than ${MIN_USERNAME} characters`,
    ],
    maxlength: [
      MAX_USERNAME,
      `Username must have less than ${MIN_USERNAME} characters`,
    ],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please use a valid email address",
    ],
    trim: true,
    minLength: [MIN_EMAIL, `Please use a valid email address`],
    maxLength: [MAX_EMAIL, `Please use a valid email address`],
    select: false,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [
      MIN_PASSWORD,
      `Password must have more than ${MIN_PASSWORD} characters`,
    ],
    maxLength: [
      MAX_PASSWORD,
      `Password must have more than ${MAX_PASSWORD} characters`,
    ],
    select: false,
  },
  profile_picture: { space: String, link: String, file_name: String },
  membership_info: {
    is_premium: { type: Boolean, default: false },
    expire_date: Date,
    select: false,
  },
  is_confirmed: { type: Boolean, default: 0 },
  use_email_notification: { type: Boolean, default: 1 },
  token_code: { type: String },
  token_expiration: { type: Date },
  registered_date: { type: Date, default: Date.now() },
});

const User = mongoose.model("Users", UserSchema);
export default User;
