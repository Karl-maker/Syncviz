import { db } from "../../helpers/db.mjs";
import config from "../../config/config.mjs";
import logger from "../../log/server-logger.mjs";
import bcrypt from "bcrypt";

export default {
  create,
  _delete,
  getSceneById,
};

async function create(req) {
  const user = req.user;
  const resource = req.resource;

  //Check if user is premium

  await isAllowedCreate(user);

  const scene = await db.scene.create({
    title: req.body.title,
    view_type: req.body.view_type,
    description: req.body.description,
    thumbnail_link: resource.thumbnail_link,
    category: req.body.category,
    owner: user.username,
    is_private: req.body.is_private,
    passcode: await bcrypt.hash(req.body.passcode, 10),
    content: {
      object_link: resource.object_link,
      default_skybox_link: resource.default_skybox_link,
    },
  });

  return scene;
}

async function _delete(req) {
  const user = req.user;

  try {
    await db.scene.findOneAndDelete({
      _id: req.body._id,
      owner: user.username,
    });
  } catch (err) {
    throw { name: "UnexpectedError" };
  }

  return;
}

async function getSceneById(req) {
  const user = req.user;

  await isAllowedView(user);

  const scene = await db.scene.findOne({ _id: req.params.id });

  return scene;
}

async function getMyScenes(req) {
  const page_size = parseInt(req.query.page_size, 10);
  const page_number = req.query.page_number;
  const q = req.query.q; //title
  const c = req.query.c; //category
  const order = req.query.order;
}

//---------Utilites-----------

async function isAllowedCreate(user) {
  throw { name: "NotAllowed", message: "Not Premium User" }; //Depending on the premium terms

  // Server || Backends checking expiration dates
}

async function isAllowedView(user) {}
