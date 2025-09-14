// backend/models/SessionEvent.js
import mongoose from "mongoose";

/**
 * Stores events for a session/room for replay.
 * Event example: { type: 'code_change', payload: { code }, ts: Date }
 */
const SessionEventSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.SessionEvent || mongoose.model("SessionEvent", SessionEventSchema);

