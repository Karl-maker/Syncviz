import express from "express";
import sceneService from "./scene-service.mjs";
import config from "../../config/config.mjs";
import authorize from "../../middleware/authorization.mjs";
import rateLimit from "express-rate-limit";
const router = express.Router();

//.................ROUTES.................................

//body: {title, view_type, description, category, is_private, passcode}, resource: {thumbnail_link, object_link, default_skybox_link*}
router.post("/scene", authorize, createScene);
//body: id - Scene
router.delete("/scene", authorize, deleteScene);
//query: q, c, order, page_size, page_number
router.get("/scene", authorize, getCurrentUserScenes);

//--------FUNCTION--------------------

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
    .getMyScenes(req)
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

export default router;
