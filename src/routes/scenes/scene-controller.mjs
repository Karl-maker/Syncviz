import express from "express";
import sceneService from "./scene-service.mjs";
import config from "../../config/config.mjs";
import authorize from "../../middleware/authorization.mjs";
import rateLimit from "express-rate-limit";
const router = express.Router();

//.................ROUTES.................................

//body: {title, view_type, description, category, is_private, passcode}, resource: {thumbnail_link, object_link, default_skybox_link*}
router.post("/scene", authorize, createScene);

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

export default router;
