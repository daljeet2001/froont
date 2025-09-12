import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  questionId: { type: String, default: null },
  hostId: { type: String, default: null },
  participants: [
    {
      userId: { type: String, default: null },
      role: { type: String, enum: ["solver", "spectator"], required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);

