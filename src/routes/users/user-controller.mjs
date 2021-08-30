import express from "express";
import User from "./user-model.mjs";
import { jsonParser } from "../../middleware/body-parser.mjs";
const router = express.Router();

//............ROUTES............................................

router.get("/user", async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users: users });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/user", jsonParser, async (req, res, next) => {
  try {
    let new_user = new User({ name: req.body.name, age: req.body.age });
    await new_user.save();
    res.status(200).json(new_user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;
