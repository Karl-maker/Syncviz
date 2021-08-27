import express from "express";
const router = express.Router();

router.get("/scene", (req, res, next) => {
  res.send("GET Scene");
  next();
});

export default router;
