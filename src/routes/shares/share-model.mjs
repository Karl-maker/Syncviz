import mongoose from "mongoose";

//---------------------------------------------------------------------

const ShareSchema = new mongoose.Schema({
  by: {
    type: String,
    required: [true, "Sender is required"],
  },
  to: {
    type: String,
    required: [true, "No user entered to send scene to"],
  },
  permission_level: {
    type: String,
    required: [true, "Permission Level is required"],
  },
  scene_id: {
    type: String,
    required: [true, "A scene must be chosen"],
  },
  shared_date: {
    type: Date,
    default: Date.now(),
    required: [true, "A scene must be chosen"],
  },
});

const Share = mongoose.model("Shares", ShareSchema);
export default Share;
