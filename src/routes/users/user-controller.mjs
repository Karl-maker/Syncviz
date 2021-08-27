import express from "express";
const router = express.Router();

router.get("/user", (req, res, next) => {
  var user = "GET User";
  res.send(user.repeat(1000));
  next();
});

export default router;
