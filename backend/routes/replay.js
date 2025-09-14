// backend/routes/replay.js
import express from "express";
import SessionEvent from "../models/SessionEvent.js";

const router = express.Router();

// GET /api/replay/:roomId -> fetch all events in chronological order
router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const events = await SessionEvent.find({ roomId }).lean();
    return res.json({ events });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

