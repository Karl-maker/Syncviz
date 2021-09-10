import { db } from "../../helpers/db.mjs";

export default {
  getById,
  _delete,
  getAll,
};

async function getById(req) {
  //Check if this user should get access also

  const user = req.user;
  const id = req.params.id;
  const notification = await db.notification.findOne({
    _id: id,
    owner: user.id,
  });

  if (!notification) {
    throw { name: "NotFound", message: "No notification found" };
  }

  return notification;
}

async function getAll(req) {
  const page_size = parseInt(req.query.page_size, 10);
  const page_number = req.query.page_number;
  const order = req.query.order;
  const user = req.user;

  //------Pagenation Helpers-------------

  const page = Math.max(0, page_number);

  //------Order Helpers------------------

  var query = {
    owner: user.id,
  };

  const scenes = await db.user
    .find(query)
    .limit(page_size)
    .skip(page_size * page)
    .sort(order); // get all

  return scenes;
}

async function _delete(req) {
  const user = req.user;
  const id = req.params.id;
  const notification = await db.notification.findOneAndDelete({
    _id: id,
    owner: user.id,
  });

  if (!notification) {
    throw { name: "NotFound", message: "No notification found" };
  }

  return;
}
