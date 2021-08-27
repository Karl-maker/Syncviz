import express from "express";
const router = express.Router();

router.get("/user", (req, res, next) => {
  res.send("GET User");
  next();
});

export default router;
