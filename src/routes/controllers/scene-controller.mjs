import express from "express";
import multer from "multer";
import fs from "fs";
import rateLimit from "express-rate-limit";
import service from "../services/index.mjs";
import config from "../../config/config.mjs";
import { protect } from "../../middleware/authorization.mjs";
import logger from "../../log/server-logger.mjs";
const sceneService = service.scene;
const router = express.Router();

//.................ROUTES.................................
router.get("/scene/request/:id", requestScene);
router.get("/scene/:id", getScene);
//body: {title, view_type, description, category, is_private, passcode, (object_link)}, resource: {thumbnail_link, object_link, default_skybox_link*}
router.post("/scene", protect, devPlaceholder, createScene);
//body: scene_id - Scene
router.delete("/scene", protect, deleteScene);
//query: q, c, order, page_size, page_number, s
router.get("/scenes", protect, getCurrentUserScenes);
//--------FUNCTION--------------------

function devPlaceholder(req, res, next) {
  req.resource = {
    thumbnail_link: "placeholder",
    object_size: 5,
    object_link: "placeholder",
    default_skybox_link: "placeholder",
  };

  next();
}

function getScene(req, res, next) {
  sceneService
    .getById(req)
    .then((scene) => {
      res.status(200).json(scene);
    })
    .catch((err) => {
      next(err);
    });
}

function requestScene(req, res, next) {
  sceneService
    .request(req)
    .then((result) => {
      switch (true) {
        case result.request === "Passcode":
          return res.status(200).json({ message: "Password Required" });

        case result.request === "Loggin":
          return res.status(200).json({ message: "Loggin To Get Access" });

        case result.request === "Unauthorized":
          return res.status(200).json({ message: "Access Not Granted" });

        case result.request === "Authorized":
          return res.status(200).json({ message: "Access Granted" });

        default:
          return res.status(200).json({ message: "No Access" });
      }
    })
    .catch((err) => {
      next(err);
    });
}

function createScene(req, res, next) {
  sceneService
    .create(req)
    .then((scene) => {
      res
        .status(200)
        .json({ scene: scene, message: "Scene Successfully Created" });
    })
    .catch((err) => {
      next(err);
    });
}

function getCurrentUserScenes(req, res, next) {
  sceneService
    .getMine(req)
    .then((scenes) => {
      res.status(200).json({ scene: scenes });
    })
    .catch((err) => {
      next(err);
    });
}

function deleteScene(req, res, next) {
  sceneService
    ._delete(req)
    .then(() => {
      res.status(200).json({ message: "Scene Successfully Deleted" });
    })
    .catch((err) => {
      next(err);
    });
}

//-----------UPLOADS----------------------------------------

export default router;
