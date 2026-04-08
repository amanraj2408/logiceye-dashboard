import mongoose from "mongoose";

const CameraDetailSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },
    ip: {
      type: String,
      default: "",
      trim: true,
    },
    streamPath: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const InstallationSchema = new mongoose.Schema(
  {
    ftpUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    cameraDetails: {
      type: [CameraDetailSchema],
      default: [],
    },
    passwordHash: {
      type: String,
      default: "",
    },
    lastPing: {
      type: Date,
      default: null,
      index: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const Installation =
  mongoose.models.Installation ||
  mongoose.model("Installation", InstallationSchema);

export default Installation;
