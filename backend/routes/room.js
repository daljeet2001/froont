// backend/routes/rooms.js
import express from "express";
import { v4 as uuidv4 } from "uuid";
import Room from "../models/Room.js";

const router = express.Router();

// Create a new room. Optionally require invite token.
// POST body: { requireInviteToken: true|false, hostId: optional }
router.post("/", async (req, res) => {
  try {
// in POST "/" handler
const { requireInviteToken = false, hostId = null, questionSlug = null } = req.body || {};
const roomId = uuidv4();
const inviteToken = requireInviteToken ? uuidv4() : null;


// if (questionSlug) {
//   const Question = await import("../models/Questions.js").then(m => m.default);
//   const q = await Question.findOne({ slug: questionSlug }).lean();
//   if (q) questionId = q._id.toString();
// }

const room = await Room.create({ roomId, hostId, requireInviteToken, inviteToken, participants: [], questionSlug });
console.log(`Created room ${room}`)


    return res.status(201).json({ roomId, inviteToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create room" });
  }
});

// Get room info (no sensitive fields like inviteToken unless caller is host)
router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId }).lean();
    if (!room) return res.status(404).json({ error: "Room not found" });
    return res.json(room);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

