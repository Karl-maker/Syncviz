import express from "express";
import { db } from "../../helpers/db.mjs";
import { jsonParser } from "../../middleware/body-parser.mjs";
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

router.post("/user", jsonParser, async (req, res, next) => {
  try {
    let new_user = new db.user({
      last_name: req.body.last_name,
      first_name: req.body.first_name,
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });
    await new_user.save().catch((err) => {
      res.status(500).json({ message: err.err.message });
    });
    res.status(200).json(new_user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;
