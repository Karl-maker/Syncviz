/*

All routes meet here..

*/

import auth from "./auth-controller.mjs";
import user from "./user-controller.mjs";
import scene from "./scene-controller.mjs";
import share from "./share-controller.mjs";
import notification from "./notification-controller.mjs";
import express from "express";
const router = express.Router();

router.use(auth, user, scene, notification, share);

export default router;
