import mongoose from "mongoose";

//--------------------------------------------------------------------------------

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "A first name is required."],
    trim: true,
  },
  last_name: {
    type: String,
    required: [true, "A last name is required."],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "A username is required."],

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
