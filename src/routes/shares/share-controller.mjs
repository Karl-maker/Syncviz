import express from "express";
import shareService from "./share-service.mjs";
import { authorize } from "../../middleware/authorization.mjs";
import rateLimit from "express-rate-limit";
const router = express.Router();

router.get("/share", authorize, shareScene);

//---------FUNCTIONS---------------------------

function shareScene(req, res, next) {
  shareService
    .create(req)
    .then((share) => {
      res
        .json(200)
        .json({ message: "Scene Successfully Shared", share: share });
    })
    .catch((err) => {
      next(err);
    });
}

export default router;
