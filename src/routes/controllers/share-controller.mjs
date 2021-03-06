import express from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../../middleware/authorization.mjs";
import service from "../services/index.mjs";
const router = express.Router();
const shareService = service.share;

//-------ROUTES----------------------------
//bod: {to, scene_id, permission_level}
router.post("/share", protect, shareScene);
//body: share_id
router.delete("/share", protect, deleteShare);
//query: page_size, page_number, q, v, c, order
router.get("/shares", protect, getAllSharesOfScene);
//body: {to, scene_id, permission_level}
router.patch("/share", protect, setSharePremissionLevel);
//---------FUNCTIONS---------------------------

function setSharePremissionLevel(req, res, next) {
  shareService
    .setPremissionLevel(req)
    .then((shared) => {
      res
        .json(200)
        .json({ message: "Scene Successfully Updated", share: shared });
    })
    .catch((err) => {
      next(err);
    });
}

function deleteShare(req, res, next) {
  shareService
    ._delete(req)
    .then(() => {
      res.status(200).json({ message: "Scene Isn't Shared Anymore" });
    })
    .catch((err) => {
      next(err);
    });
}

function shareScene(req, res, next) {
  shareService
    .create(req)
    .then((share) => {
      res
        .status(200)
        .json({ message: "Scene Successfully Shared", share: share });
    })
    .catch((err) => {
      next(err);
    });
}

function getAllSharesOfScene(req, res, next) {
  shareService
    .getAllShares(req)
    .then((sharedTo) => {
      res.status(200).json({ sharedTo });
    })
    .catch((err) => {
      next(err);
    });
}

export default router;
