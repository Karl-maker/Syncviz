/*

All routes meet here..

*/

import user from "./user/user-controller.mjs";
import scene from "./scene/scene-controller.mjs";
import express from "express";
const router = express.Router();

router.use(user, scene);

export default router;
