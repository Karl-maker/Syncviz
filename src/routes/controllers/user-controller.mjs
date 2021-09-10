import express from "express";
import rateLimit from "express-rate-limit";
import service from "../services/index.mjs";
import config from "../../config/config.mjs";
import { protect } from "../../middleware/authorization.mjs";
const router = express.Router();
const userService = service.user;

//............ROUTES............................................

//---------PROTECTED-------------------
//query: {page_size, page_number, q, order}
router.get("/users", protect, getUsers);
router.get("/user", protect, getCurrent);
//body: {password}
router.delete("/user", protect, deleteUser);
//params: username
router.get("/user/:username", protect, getUser);
//---------FUNCTIONS-----------------

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
