import { db } from "../../helpers/db.mjs";
import config from "../../config/config.mjs";
import logger from "../../log/server-logger.mjs";
import bcrypt from "bcrypt";

export default {
  create,
  _delete,
  getById,
  getAll,
  getMine,
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
      object_size: resource.object_size || null,
      object_link: resource.object_link || req.body.object_link, //User can use their own link
      default_skybox_link: resource.default_skybox_link || null,
    },
  });

  return scene;
}

async function _delete(req) {
  const user = req.user;

  try {
    await db.scene.findOneAndDelete({
      _id: req.body.id,
      owner: user.username,
    });
  } catch (err) {
    throw { name: "UnexpectedError" };
  }

  return;
}

async function getById(req) {
  const user = req.user;
  const id = req.params.id;

  var scene;

  if (!(await isAllowedView(user.id, req.params.id))) {
    //Check for password

    if (!req.body.password) {
      //throw that shit
      throw { name: "Unauthorized", message: "Unauthorized" };
    } else {
      //compare
      scene = await db.scene.findOne({ _id: id });

      if (!(await bcrypt.compare(req.body.password, compare_data.passcode))) {
        throw { name: "Unauthorized", message: "Unauthorized" };
      }
    }
  }

  scene.passcode = null;

  return scene;
}

async function getAll(req) {
  const page_size = parseInt(req.query.page_size, 10);
  const page_number = req.query.page_number;
  const q = req.query.q; //title
  const c = req.query.c; //category
  const s = req.query.s; //is_shared?
  const order = req.query.order;

  //-------------------------------------

  const user = req.user;

  //------Pagenation Helpers-------------

  const page = Math.max(0, page_number);

  //------Order Helpers------------------

  var query = {
    is_private: false,
  };

  if (q) {
    query.title = { $regex: `${q}`, $options: `i` };
  }
  if (c) {
    query.category = { $regex: `${c}`, $options: `i` };
  }

  if (s) {
    const shares = await db.share.findAll({ to: user.username }, { _id: 1 });
    query._id = { $in: shares._id };
  }

  const scenes = await db.user
    .findAll(query)
    .limit(page_size)
    .skip(page_size * page)
    .sort(order); // get all

  return scenes;
}

async function getMine(req) {
  const page_size = parseInt(req.query.page_size, 10);
  const page_number = req.query.page_number;
  const q = req.query.q; //title
  const c = req.query.c; //category
  const order = req.query.order;
  const user = req.user;

  //------Pagenation Helpers-------------

  const page = Math.max(0, page_number);

  //------Order Helpers------------------

  var query = {
    owner: user._id,
  };

  //----------Add Filters----------

  if (q) {
    query.title = { $regex: `${q}`, $options: `i` };
  }
  if (c) {
    query.category = { $regex: `${c}`, $options: `i` };
  }

  const scenes = await db.user
    .findAll(query)
    .limit(page_size)
    .skip(page_size * page)
    .sort(order); // get all

  return scenes;
}

async function request(req) {
  const user = req.user;
  const id = req.params.id;
  var result;

  const scene = await db.scene.findOne({ _id: req.params.id });

  var result;

  if (!scene) {
    throw { name: "NotFound", message: "Scene Not Found" };
  }

  if (scene.is_private) {
    //if private AND their is no user data ask them to loggin

    if (!user) {
      //Tell them to loggin
      result = "Loggin";
    } else {
      //check if user has access
      if (await isAllowedView(user.id, id)) {
        result = "Authorized";
        return result;
      } else {
        result = "Unauthorized";
      }
    }
  }
  if (scene.passcode) {
    result = "Passcode";
  }

  return result;
}

//---------Utilites-----------

async function isAllowedCreate(user) {
  throw { name: "NotAllowed", message: "Not Premium User" }; //Depending on the premium terms

  // Server || Backends checking expiration dates
}

async function isAllowedView(user_id, scene_id) {
  return false;
}
