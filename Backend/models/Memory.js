import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: [true, "Please provide a title"],
    maxlength: 100,
  },
  story: {
    type: String,
    maxlength: 2000,
  },
  mood: {
    type: String,
    default: "happy",
  },
  tags: [{
    type: String,
  }],
  date: {
    type: String, // Storing as YYYY-MM-DD string for easy calendar matching
    required: true,
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String },
  },
  country: {
    type: String,
    default: null
  },
  images: [{
    type: String, // URL or base64
  }],
  type: {
    type: String,
    enum: ['trip', 'pin', 'memory'],
    default: 'memory'
  },
  visibility: {
    type: String,
    enum: ['private', 'friends', 'public'],
    default: 'private'
  }
}, { timestamps: true });

export default mongoose.model("Memory", MemorySchema);
