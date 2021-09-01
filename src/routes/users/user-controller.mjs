import express from "express";
import { db } from "../../helpers/db.mjs";
import userService from "./user-service.mjs";
const router = express.Router();

//............ROUTES............................................

router.get("/users", getUsers);
router.get("/user/:username", getUser);
router.delete("/user", deleteUser); //Use Auth to return user first
router.post("/user/registration", register);

//---------FUNCTIONS-----------------

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
