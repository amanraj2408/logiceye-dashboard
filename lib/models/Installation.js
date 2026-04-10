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

const PingHistorySchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      default: "online",
      trim: true,
      lowercase: true,
    },
    camCount: {
      type: Number,
      default: 0,
      min: 0,
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
    pingHistory: {
      type: [PingHistorySchema],
      default: [],
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
