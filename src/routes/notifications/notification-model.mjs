import mongoose from "mongoose";

//--------------------------------------------------

const NotificationSchema = new mongoose.Schema({
  info: {
    message: { type: String },
    route: { type: String },
  },
  owner: { type: String },
  is_seen: { type: Boolean, default: 0 },
  is_notified: { type: Boolean, default: 0 },
  created_date: { type: Date, default: Date.now() },
});

const Notification = mongoose.model("Notifications", NotificationSchema);
export default Notification;
