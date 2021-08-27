/*

All routes meet here..

*/

import user from "./users/user-controller.mjs";
import scene from "./scenes/scene-controller.mjs";
import share from "./shares/share-controller.mjs";
import notification from "./notifications/notification-controller.mjs";
import express from "express";
const router = express.Router();

router.use(user, scene, notification, share);

export default router;
