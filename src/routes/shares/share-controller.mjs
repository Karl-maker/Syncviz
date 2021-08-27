import express from "express";
const router = express.Router();

router.get("/share", (req, res, next) => {
  res.send("GET Share");
  next();
});

export default router;
