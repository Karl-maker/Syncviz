import db from "../../helpers/db.mjs";
import config from "../../config/config.mjs";
import logger from "../../log/server-logger.mjs";
import bcrypt from "bcrypt";

export default {
  create,
  _delete,
  getById,
  getAll,
  getMine,
  request,
};

async function create(req) {
  const user = req.user;
  const resource = req.resource;
  const passcode = req.body.passcode;
  const title = req.body.title;
  const view_type = req.body.view_type.toLowerCase();
  const description = req.body.description;
  const category = req.body.category.toLowerCase();
  const is_private = req.body.is_private;

  //Check if user is premium

  await isAllowedCreate(user);

  var encrypted_passcode;

  if (passcode) {
    encrypted_passcode = await bcrypt.hash(passcode, 10);
  }

  const scene = await db.scene.create({
    title: title,
    view_type: view_type,
    description: description,
    thumbnail_link: resource.thumbnail_link,
    category: category,
    owner: user.username,
    is_private: is_private,
    passcode: encrypted_passcode,
    content: {
      object_size: resource.object_size,
      object_link: resource.object_link || req.body.object_link, //User can use their own link
      default_skybox_link: resource.default_skybox_link,
    },
  });

  return scene;
}

async function _delete(req) {
  const user = req.user;
  const scene_id = req.body.scene_id;

  try {
    await db.scene.findOneAndDelete({
      _id: scene_id,
      owner: user.username,
    });
  } catch (err) {
    throw { name: "UnexpectedError" };
  }

  return;
}

async function getById(req) {
  /*

  For security purposes no caching will be implemented in the situation if a user changes privacy details
  in a emergency. 

  */
  const user = req.user;
  var id;
  var passcode;
  var scene;

  try {
    id = req.params.id || req.query.id;
    passcode = req.body.passcode || req.query.passcode;
  } catch (err) {
    id = req.query.id;
    passcode = req.query.passcode;
  }

  scene = await db.scene.findOne(
    { _id: id },
    {
      passcode: 1,
      title: 1,
      view_type: 1,
      description: 1,
      category: 1,
      owner: 1,
      content: 1,
    }
  );

  if (!scene) {
    throw { name: "Unauthorized", message: "Unauthorized" };
  }
  if (!(await isAllowedView(user.username, id))) {
    //Check for password

    if (!passcode) {
      //throw that shit
      throw { name: "Unauthorized", message: "Unauthorized" };
    } else {
      //compare

      if (!(await bcrypt.compare(passcode, scene.passcode))) {
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
  const q = req.query.q.toLowerCase(); //title
  const c = req.query.c.toLowerCase(); //category
  const s = req.query.s; //is_shared?
  const order = req.query.order;
  const getCacheAsync = promisify(client.get).bind(client);
  const setCacheAsync = promisify(client.setex).bind(client);

  var meta_data = {
    source: "database",
  };
  var scenes;

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
    const shares = await db.share.find({ to: user.username }, { _id: 1 });
    query._id = { $in: shares._id };
  }

  scenes = await db.user
    .find(query)
    .limit(page_size)
    .skip(page_size * page)
    .sort(order); // get all

  return { scenes, meta_data };
}

async function getMine(req) {
  const page_size = parseInt(req.query.page_size, 10);
  const page_number = req.query.page_number;
  const q = req.query.q.toLowerCase(); //title
  const order = req.query.order || "asc";
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

  const scenes = await db.scene
    .find({
      $or: [
        { title: query.title },
        { description: query.title },
        { category: query.title },
      ],
    })
    .limit(page_size)
    .skip(page_size * page)
    .sort(order); // get all

  return scenes;
}

async function request(req) {
  const user = req.user;
  const id = req.params.id;
  var result = {};

  const scene = await db.scene.findOne({ _id: id });

  if (!scene) {
    throw { name: "NotFound", message: "Scene Not Found" };
  }

  if (!scene.is_private) {
    //if private AND their is no user data ask them to loggin

    //ERROR
    if (!user) {
      //Tell them to loggin
      result.request = "Loggin";
    } else {
      logger.info({ message: "Has data within User variable " });
      //check if user has access
      if (await isAllowedView(user.username, id)) {
        result.request = "Authorized";
        return result;
      } else {
        result.request = "Unauthorized";
      }
    }
  }
  if (scene.passcode) {
    result.request = "Passcode";
  }

  return result;
}

//---------Utilites-----------

async function isAllowedCreate(user) {
  if (
    await db.user.exists({
      _id: user.id,
      membership_info: { is_premium: true },
    })
  ) {
    return true;
  }
  throw { name: "NotAllowed", message: "Not Premium User" }; // Depending on the premium terms //--- Server || Backends checking expiration dates ---
}

async function isAllowedView(username, scene_id) {
  if (
    await db.scene.exists({
      _id: scene_id,
      owner: username,
    })
  ) {
    return true;
  } else {
    return false;
  }
}
