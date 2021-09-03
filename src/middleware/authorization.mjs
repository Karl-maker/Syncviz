import config from "../config/config.mjs";
import { db } from "../helpers/db.mjs";
import jwt from "jsonwebtoken";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const authorize = async (req, res, next) => {
  // Header names in Express are auto-converted to lowercase
  let access_token =
    req.headers["x-access-token"] || req.headers["authorization"];

  // Remove Bearer from string
  access_token = access_token.replace(/^Bearer\s+/, "");

  try {
    //Get Key
    const ACCESS_TOKEN_PUBLIC_KEY = config.jwt.ACCESS_TOKEN_PUBLIC_KEY;

    const payload = jwt.verify(access_token, ACCESS_TOKEN_PUBLIC_KEY, {
      issuer: config.jwt.ISSUER,
      subject: req.body.username,
      audience: req.body.origin,
      expiresIn: `${config.jwt.ACCESS_TOKEN_LIFE * 60}s`,
      algorithm: [config.jwt.ALGORITHM],
    });

    req.user = await db.user.findOne({ _id: payload.id });
    next();
  } catch (err) {
    next({ name: "UnauthorizedError" });
  }
};

export default authorize;
