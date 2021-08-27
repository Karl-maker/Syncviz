import express from "express";
const router = express.Router();

router.get("/notification", (req, res, next) => {
  res.send("GET Notification");
  next();
});

export default router;
