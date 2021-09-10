import express from "express";
import service from "../services/index.mjs";
import { protect } from "../../middleware/authorization.mjs";
const router = express.Router();
const notificationService = service.notification;

//params: id
router.delete("/notification/:id", protect, deleteNotification);
//params: id
router.get("/notification/:id", protect, getNotification);
//query: {page_size, page_number, order}
router.get("/notifications", protect, getNotifications);

//--------FUNCTION--------------------------------------

function getNotification(req, res, next) {
  notificationService
    .getById(req)
    .then((notification) => {
      res.status(200).json({ notification: notification });
    })
    .catch((err) => {
      next(err);
    });
}

function getNotifications(req, res, next) {
  notificationService
    .getAll(req)
    .then((notifications) => {
      res.status(200).json({ notifications: notifications });
    })
    .catch((err) => {
      next(err);
    });
}

function deleteNotification(req, res, next) {
  notificationService
    ._delete(req)
    .then(() => {
      res.status(200).json({ message: "Notification Deleted" });
    })
    .catch((err) => {
      next(err);
    });
}
export default router;
