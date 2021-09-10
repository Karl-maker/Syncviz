import db from "../../helpers/db.mjs";
import config from "../../config/config.mjs";
import logger from "../../log/server-logger.mjs";

export default {
  getAllShares,
  setPremissionLevel,
  create,
  _delete,
};

async function setPremissionLevel(req) {
  const user = req.user;
  const to = req.body.to.toLowerCase();
  const scene_id = req.body.scene_id;
  const permission_level = req.body.permission_level.toLowerCase();

  const shared = await db.share.findOneAndUpdate(
    { scene_id: scene_id, to: to, owner: user.username },
    { permission_level: permission_level }
  );

  return shared;
}

async function getAllShares(req) {
  const page_size = parseInt(req.query.page_size, 10);
  const page_number = req.query.page_number;
  const q = req.query.q; //title
  const v = req.query.v; //scene_id
  const c = req.query.c; //category
  const order = req.query.order;
  const user = req.user;

  //------Pagenation Helpers-------------

  const page = Math.max(0, page_number);

  //------Order Helpers------------------

  var query = {
    scene_id: v,
    owner: user.id,
  };

  if (q) {
    query.title = { $regex: `${q}`, $options: `i` };
  }
  if (c) {
    query.category = { $regex: `${c}`, $options: `i` };
  }

  const shares = await db.share
    .find(query)
    .limit(page_size)
    .skip(page_size * page)
    .sort(order); // get all

  return shares;
}

async function create(req) {
  const user = req.user;
  const scene_id = req.body.scene_id;
  const to = req.body.to.toLowerCase();
  const share_id = req.body.share_id;
  const permission_level = req.body.permission_level.toLowerCase();

  try {
    if (!(await db.scene.exists({ _id: scene_id, owner: user.username }))) {
      throw { name: "Unauthorize" };
    }

    await db.share.findOneAndDelete({
      owner: user.id,
      to: to,
      scene_id: scene_id,
    });

    const share = await db.share.create({
      by: user.username,
      to: to,
      permission_level: permission_level,
      scene_id: scene_id,
    });

    await db.notification.create({
      info: {
        message: `${user.username} has shared a scene with you`,
        route: `/scene/${scene_id}`,
      },
      owner: to,
    });

    return share;
  } catch (err) {
    throw { message: err.message };
  }
}

async function _delete(req) {
  const user = req.user;
  const share_id = req.body.share_id;

  try {
    await db.share.findOneAndDelete({ _id: share_id, owner: user.id });
  } catch (err) {
    throw { name: "UnexpectedError" };
  }

  return;
}
