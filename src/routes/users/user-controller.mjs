import express from "express";
import userService from "./user-service.mjs";
import config from "../../config/config.mjs";
import authorize from "../../middleware/authorization.mjs";
import rateLimit from "express-rate-limit";
const router = express.Router();

//............ROUTES............................................

/*
activeAuthentication //throws Error
passiveAuthentication //allows Pass Without User Info
*/

router.get(
  "/user/authorize",
  rateLimit({
    windowMs: config.jwt.ACCESS_TOKEN_LIFE * 60 * 1000,
    max: 5, //No Constant Refreshes
  }),
  getAccessToken
);
router.post(
  "/user/register",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  register
);
router.post(
  "/user/authenticate",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  login
);
router.post(
  "/user/confirm-email",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
  }),
  confirmUserEmail
);
//---------PROTECTED-------------------
router.delete("/user", authorize, deleteUser);
router.get("/user", authorize, getCurrent);
router.get("/users", authorize, getUsers);
router.get("/user/:username", authorize, getUser);
//---------FUNCTIONS-----------------

function login(req, res, next) {
  userService
    .login(req.body)
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
    .create(req.body)
    .then((user) => {
      res.status(201).json({ message: "Registration Sucessful" });
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
    .confirmUserEmail(req.body)
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
    .getOneByUsername(req.params.username)
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

export default router;
