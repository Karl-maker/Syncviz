import jwt from "json-web-token";
import config from "../config/config.mjs";
import { db } from "../helpers/db.mjs";

const authorize = async (req, res, next) => {
  let access_token = req.cookies.jwt;

  if (!access_token) {
    next({ name: "NoToken", message: "Unauthorized" });
  }

  let payload;

  try {
    payload = jwt.verify(access_token, config.jwt.ACCESS_TOKEN_SECRET);
    req.user = await db.user.findOne({ username: payload.username });
    next();
  } catch (err) {
    next({ name: "UnauthorizedError" });
  }
};

export default authorize;
