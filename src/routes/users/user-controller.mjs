import express from "express";
import userService from "./user-service.mjs";
import config from "../../config/config.mjs";
import { authorize } from "../../middleware/authorization.mjs";
import rateLimit from "express-rate-limit";
const router = express.Router();

//............ROUTES............................................

router.get(
  //cookie: refresh_token, body: {username, origin}
  "/user/authorize",
  rateLimit({
    windowMs: config.jwt.ACCESS_TOKEN_LIFE * 60 * 1000,
    max: 5,
  }),
  getAccessToken
);

router.post(
  //body: {first_name, last_name, email, username, password, confirmed_password}
  "/user/register",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  register
);

router.post(
  //body: {password, origin, username || email}
  "/user/authenticate",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  login
);

router.post(
  //body: {code, username || email}
  "/user/confirm-email",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  confirmUserEmail
);

router.get(
  //body: {username || email}
  "/user/reset-password",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2,
  }),
  resetPasswordEmail
);

router.post(
  //body: {code, username || email, new_password, confirm_password}
  "/user/reset-password",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  resetPassword
);

//---------PROTECTED-------------------
//query: {page_size, page_number, q, order}
router.get("/users", getUsers);
router.get("/user", authorize, getCurrent);
//body: {password}
router.delete("/user", authorize, deleteUser);
//params: username
router.get("/user/:username", authorize, getUser);
router.patch(
  //body: {current_password, new_password, confirm_password}
  "/user/password",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  authorize,
  updatePassword
);

//---------FUNCTIONS-----------------

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

function deleteUser(req, res, next) {
  userService
    ._delete(req)
    .then(() => {
      res.status(204).json({ message: "Account Deleted Successfully" });
    })
    .catch((err) => {
      next(err); //Error Handler
    });
}

function getCurrent(req, res, next) {
  res.status(200).json({ user: req.user });
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

function getUser(req, res, next) {
  userService
    .getOneByUsername(req)
    .then((user) => {
      res.status(200).json({ user: user });
    })
    .catch((err) => {
      next(err);
    });
}

function getUsers(req, res, next) {
  userService
    .getByUsername(req)
    .then((users) => {
      res.status(200).json({ users: users, amount: users.length });
    })
    .catch((err) => {
      next(err);
    });
}

//https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/getting-started-nodejs.html

export default router;
