import mongoose from "mongoose";

/*
  Message Schema
  Represents a private message exchanged between two users
*/
const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",        // Reference to the user who sent the message
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",        // Reference to the user who receives the message
      required: true,
    },

    content: {
      type: String,
      required: true,     // Actual message text
    },

    read: {
      type: Boolean,
      default: false,     // Indicates whether the message has been read
    },
  },
  {
    timestamps: true,     // Automatically adds createdAt & updatedAt fields
  }
);

// Export Message model
export default mongoose.model("Message", MessageSchema);
