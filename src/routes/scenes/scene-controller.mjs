import express from "express";
import sceneService from "./scene-service.mjs";
import config from "../../config/config.mjs";
import {
  authorize,
  authorizePassively,
} from "../../middleware/authorization.mjs";
import rateLimit from "express-rate-limit";
import multer from "multer";
import fs from "fs";
const router = express.Router();

//.................ROUTES.................................
router.get("/scene/:id", authorizePassively, getScene);
router.get("/scene/request/:id", authorizePassively, requestScene);
//body: {title, view_type, description, category, is_private, passcode, (object_link)}, resource: {thumbnail_link, object_link, default_skybox_link*}
router.post("/scene", authorize, createScene);
//body: id - Scene
router.delete("/scene", authorize, deleteScene);
//query: q, c, order, page_size, page_number
router.get("/scene", authorize, getCurrentUserScenes);
//--------FUNCTION--------------------

function getScene(req, res, next) {
  sceneService
    .request(req)
    .then((result) => {
      switch (result) {
        case result === "Passcode":
          res.status(200).json({ message: "Password Required" });
          break;
        case result === "Loggin":
          res.status(200).json({ message: "Loggin To Get Access" });
          break;
        case result === "Unauthorized":
          res.status(200).json({ message: "Access Not Granted" });
          break;
        case result === "Authorized":
          res.status(200).json({ message: "Access Granted" });
          break;
        default:
          res.status(200).json({ message: "No Access" });
          break;
      }
    })
    .catch((err) => {
      next(err);
    });
}

function requestScene(req, res, next) {
  sceneService
    .request(req)
    .then((result) => {
      switch (result) {
        case result === "Passcode":
          res.status(200).json({ message: "Password Required" });
          break;
        case result === "Loggin":
          res.status(200).json({ message: "Loggin To Get Access" });
          break;
        case result === "Unauthorized":
          res.status(200).json({ message: "Access Not Granted" });
          break;
        case result === "Authorized":
          res.status(200).json({ message: "Access Granted" });
          break;
        default:
          res.status(200).json({ message: "No Access" });
          break;
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
      res.status(200).json({ scene: scene });
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
