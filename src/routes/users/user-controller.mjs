import express from "express";
import userService from "./user-service.mjs";
import config from "../../config/config.mjs";
import { protect } from "../../middleware/authorization.mjs";
import rateLimit from "express-rate-limit";
const router = express.Router();

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
