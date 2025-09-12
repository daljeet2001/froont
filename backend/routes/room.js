import express from "express";
import { v4 as uuidv4 } from "uuid";
import Room from "../models/Room.js";

const router = express.Router();

// Create a new room
router.post("/", async (req, res) => {
  try {
    const roomId = uuidv4();
    const room = await Room.create({ roomId, participants: [] });
    return res.status(201).json({ roomId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create room" });
  }
});

// Optional: get room info
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

