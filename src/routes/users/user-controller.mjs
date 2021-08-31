import express from "express";
import { db } from "../../helpers/db.mjs";
import userService from "./user-service.mjs";
const router = express.Router();

//............ROUTES............................................

router.get("/user", async (req, res, next) => {
  try {
    const users = await db.user.find({});
    res.status(200).json({ users: users });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

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

export default router;
