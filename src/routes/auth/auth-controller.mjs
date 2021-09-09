import express from "express";
import userService from "../users/user-service.mjs";
import config from "../../config/config.mjs";
import rateLimit from "express-rate-limit";
import { authorize, protect } from "../../middleware/authorization.mjs";
const router = express.Router();

router.post(
  //cookie: refresh_token, body: {username, origin}
  "/authorize",
  rateLimit({
    windowMs: config.jwt.ACCESS_TOKEN_LIFE * 60 * 1000,
    max: 5,
  }),
  getAccessToken
);

router.post(
  //body: {first_name, last_name, email, username, password, confirmed_password}
  "/register",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  register
);

router.post(
  //body: {password, origin, username || email}
  "/login",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  login
);

router.post(
  //body: {code, username || email}
  "/confirm-email",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  confirmUserEmail
);

router.get(
  //body: {username || email}
  "/reset-password",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2,
  }),
  resetPasswordEmail
);

router.post(
  //body: {code, username || email, new_password, confirm_password}
  "/reset-password",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  resetPassword
);

//---------PROTECTED---------------------------------------------------

router.patch(
  //body: {current_password, new_password, confirm_password}
  "/password",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  authorize,
  protect,
  updatePassword
);
router.delete(
  //cookie: refresh_token, body: {username, origin}
  "/logout",
  rateLimit({
    windowMs: config.jwt.ACCESS_TOKEN_LIFE * 60 * 1000,
    max: 5,
  }),
  authorize,
  protect,
  deleteRefreshToken
);
//---------------------------------------------------------------------

function deleteRefreshToken(req, res, next) {
  userService
    .deleteRefreshToken(req)
    .then(() => {
      res.status(200).json({
        message: "User logged out",
      });
    })
    .catch((err) => {
      next(err);
    });
}

function updatePassword(req, res, next) {
  userService
    .setUserPassword(req)
    .then(() => {
      res.status(200).json({ message: "Password Updated" });
    })
    .catch((err) => {
      next(err);
    });
}

function getAccessToken(req, res, next) {
  userService
    .getAccessToken(req)
    .then((results) => {
      res.status(200).json({
        access_token: {
          token: results.access_token.token,
          expires: results.access_token.expires,
        },
        message: "Token Received",
      });
    })
    .catch((err) => {
      next(err);
    });
}

function register(req, res, next) {
  userService
    .create(req)
    .then((user) => {
      res.status(201).json({ message: "Registration Successful" });
    })
    .catch((err) => {
      next(err); //Error Handler
    });
}

function login(req, res, next) {
  userService
    .login(req)
    .then((results) => {
      res
        .cookie("refresh_token", results.refresh_token.token, {
          secure: config.jwt.IS_HTTPS,
          httpOnly: true,
          //sameSite: true,
          expires: results.refresh_token.expires,
          path: "/api",
        })
        .status(200)
        .json({
          access_token: {
            token: results.access_token.token,
            expires: results.access_token.expires,
          },
          message: "Login Successful",
        });
    })
    .catch((err) => {
      next(err);
    });
}

function confirmUserEmail(req, res, next) {
  userService
    .confirmUserEmail(req)
    .then(() =>
      res.status(200).json({
        message: `Email Confirmed`,
      })
    )
    .catch((err) => {
      next(err);
    });
}

function resetPasswordEmail(req, res, next) {
  userService
    .getResetPasswordLink(req)
    .then(() => {
      res.status(200).json({ message: "Check Email" });
    })
    .catch((err) => {
      next(err);
    });
}

function resetPassword(req, res, next) {
  userService
    .resetPassword(req)
    .then(() => {
      res.status(200).json({ message: "Password Updated" });
    })
    .catch((err) => {
      next(err);
    });
}

export default router;
