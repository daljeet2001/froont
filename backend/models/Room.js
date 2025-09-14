// backend/models/Room.js
import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  questionId: { type: String, default: null },
  hostId: { type: String, default: null }, // userId of the host (interviewer)
  requireInviteToken: { type: Boolean, default: false }, // if true, require invite token
  inviteToken: { type: String, default: null }, // stable token for joining as solver (share with candidate)
  participants: [
    {
      userId: { type: String, default: null },
      role: { type: String, enum: ["solver", "spectator"], required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Room || mongoose.model("Room", RoomSchema);

