import express from "express";
import { db } from "../../helpers/db.mjs";
import userService from "./user-service.mjs";
const router = express.Router();

//............ROUTES............................................

router.get("/users", getUsers);

router.post("/user", register);

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
