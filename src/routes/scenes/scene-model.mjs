import mongoose from "mongoose";

//--------------------------------------

const SceneSchema = new mongoose.Schema({
  title: {
    required: [true, "Scene requires a title"],
    type: String,
    trim: true,
  },
  view_type: {
    //AR, VR etc..
    required: [true, "Scene requires a type"],
    type: String,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  owner: {
    type: String,
    required: [true, "Scene requires a owner"],
  },
  is_private: {
    type: Boolean,
    default: 0,
  },
  password: {
    type: String,
  },
  content: {
    object_link: {
      type: String,
    },
    thumbnail_link: {
      type: String,
    },
    default_skybox_link: {
      type: String,
    },
  },
  created_date: {
    default: Date.now(),
    type: Date,
  },
  updated_date: {
    type: Date,
  },
});

const Scene = mongoose.model("Scenes", SceneSchema);
export default Scene;
