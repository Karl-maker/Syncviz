import { db } from "../../helpers/db.mjs";
import config from "../../config/config.mjs";
import logger from "../../log/server-logger.mjs";

export default {};

async function create(req) {
  const user = req.user;

  if (
    !(await db.scene.findOne({ _id: req.body.scene_id, owner: user.username }))
  ) {
    throw { name: "Unauthorize" };
  }

  await db.share.findAllAndDelete({
    owner: user.id,
    to: req.body.to,
    scene_id: req.body.scene_id,
  });

  const share = await db.share.create({
    by: user.username,
    to: req.body.to,
    permission_level: req.body.permission_level,
    scene_id: req.body.scene_id,
  });

  await db.notification.create({
    info: {
      message: `${user.username} has shared a scene with you`,
      route: `/scene/${share._id}`,
    },
    owner: user.username,
  });

  return share;
}

async function _delete(req) {
  const user = req.user;

  try {
    await db.share.findOneAndDelete({ _id: req.body.share_id, owner: user.id });
  } catch (err) {
    throw { name: "UnexpectedError" };
  }

  return;
}
