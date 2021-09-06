import { db } from "../../helpers/db.mjs";
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

  const shared = await db.share.findOneAndUpdate(
    { scene_id: req.body.scene_id, to: req.body.to, owner: user },
    { permission_level: req.body.permission_level }
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
    .findAll(query)
    .limit(page_size)
    .skip(page_size * page)
    .sort(order); // get all

  return shares;
}

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
