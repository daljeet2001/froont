// backend/routes/questions.js
import express from "express";
import Question from "../models/Questions.js";

const router = express.Router();

// GET /api/questions - list (basic)
router.get("/", async (req, res) => {
  try {
    const qs = await Question.find({}).lean();
    return res.json(qs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/questions/:slug - full
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const q = await Question.findOne({ slug }).lean();
    if (!q) return res.status(404).json({ error: "Question not found" });
    return res.json(q);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/questions - create (admin)
// For now open endpoint; in production guard with auth/role.
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    // require title & slug
    if (!payload.title || !payload.slug) return res.status(400).json({ error: "Missing title or slug" });
    const q = await Question.create(payload);
    return res.status(201).json(q);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/questions/:slug - update
router.put("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const updates = req.body;
    const q = await Question.findOneAndUpdate({ slug }, updates, { new: true });
    if (!q) return res.status(404).json({ error: "Question not found" });
    return res.json(q);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/questions/:slug
router.delete("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    await Question.deleteOne({ slug });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

