import express from "express";
import { db } from "../../helpers/db.mjs";
import userService from "./user-service.mjs";
import config from "../../config/config.mjs";
import authorize from "../../middleware/authorization.mjs";
const router = express.Router();

//............ROUTES............................................

/*
activeAuthentication //throws Error
passiveAuthentication //allows Pass Without User Info
*/

router.get("/users", getUsers);
router.get("/user/:username", getUser);
router.delete("/user", deleteUser); //Use Auth to return user first
router.post("/user/registration", register);
router.post("/user/login", login);
router.get("/user", authorize, getCurrentUser);
router.get("/user/access-token", authorize, getRefreshToken);

//---------FUNCTIONS-----------------

function getRefreshToken(req, res, next) {
  userService
    .getRefreshToken(req.user)
    .then((access_token) => {
      res
        .cookie("jwt", access_token, {
          secure: config.jwt.IS_HTTPS,
          httpOnly: true,
        })
        .status(200)
        .json({ message: "Access Token Recieved" });
    })
    .catch((err) => {
      next(err);
    });
}

function getCurrentUser(req, res, next) {
  res.status(200).json(req.user);
}

function login(req, res, next) {
  userService
    .login(req.body)
    .then((access_token) => {
      res
        .cookie("jwt", access_token, {
          secure: config.jwt.IS_HTTPS,
          httpOnly: true,
        })
        .status(200)
        .json({ message: "Login Sucessful" });
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
    .then((results) => {
      res.status(204).json({ message: "Account Deleted Successfully" });
    })
    .catch((err) => {
      next(err); //Error Handler
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
