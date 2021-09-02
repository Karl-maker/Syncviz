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

router.get("/users", authorize, getUsers);
router.get("/user/:username", getUser);
router.post("/user/register", register);
router.post("/user/login", login);

//---------FUNCTIONS-----------------

function login(req, res, next) {
  userService
    .login(req.body)
    .then((results) => {
      res
        .cookie("jwt", results.refresh_token, {
          secure: config.jwt.IS_HTTPS,
          httpOnly: true,
        })
        .status(200)
        .json({
          access_token: results.access_token,
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
