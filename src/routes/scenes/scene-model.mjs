import mongoose from "mongoose";

//const

const MIN_TITLE = 2;
const MAX_TITLE = 20;
const MIN_DESCRIPTION = 6;
const MAX_DESCRIPTION = 255;
const MAX_CATEGORY = 255;
const MIN_PASSWORD = 5;
const MAX_PASSWORD = 255;

//--------------------------------------

const SceneSchema = new mongoose.Schema({
  title: {
    required: [true, "Scene requires a title"],
    type: String,
    trim: true,
    minLength: [MIN_TITLE, `Title must be more than ${MIN_TITLE} characters`],
    maxLength: [MAX_TITLE, `Title must be less than ${MAX_TITLE} characters`],
  },
  view_type: {
    //AR, VR etc..
    required: [true, "Scene requires a type"],
    type: String,
  },
  description: {
    type: String,
    trim: true,
    minLength: [
      MIN_DESCRIPTION,
      `Description must be more than ${MIN_DESCRIPTION} characters`,
    ],
    maxLength: [
      MAX_DESCRIPTION,
      `Description must be less than ${MAX_DESCRIPTION} characters`,
    ],
  },
  thumbnail_link: {
    type: String,
  },
  category: {
    type: String,
    trim: true,
    maxLength: [
      MAX_CATEGORY,
      `Category must be less than ${MAX_CATEGORY} characters`,
    ],
  },
  owner: {
    type: String,
    required: [true, "Scene requires a owner"], //id
  },
  is_private: {
    type: Boolean,
    default: 1,
  },
  passcode: {
    type: String,
    minLength: [
      MIN_PASSWORD,
      `Password must be more than ${MIN_PASSWORD} characters`,
    ],
    maxLength: [
      MAX_PASSWORD,
      `Password must be less than ${MAX_PASSWORD} characters`,
    ],
    default: null,
  },
  content: {
    object_size: {
      type: String,
    },
    object_link: {
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
    default: null,
  },
});

const Scene = mongoose.model("Scenes", SceneSchema);
export default Scene;
