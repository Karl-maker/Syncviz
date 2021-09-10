import mongoose from "mongoose";

//--------------------------------------------------

const LoginSchema = new mongoose.Schema({
  refresh_token: { type: String },
  user_id: { type: String },
  expire_date: { type: Date },
  created_date: { type: Date, default: Date.now() },
});

const Login = mongoose.model("Logins", LoginSchema);
export default Login;
