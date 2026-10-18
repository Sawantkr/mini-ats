
const express = require("express");
const Candidate = require("../models/Candidate");

const router = express.Router();
const stages = ["Applied", "Screening", "Interview", "Selected", "Rejected"];

// Get candidates, with optional search and stage filter
router.get("/", async (req, res) => {
  try {
    const { search = "", stage } = req.query;
    const query = {};

    if (search.trim()) {
      const regex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );
      query.$or = [
        { name: regex },
        { email: regex },
        { role: regex },
      ];
    }

    if (stage && stage !== "All stages") {
      if (!stages.includes(stage)) {
        return res.status(400).json({ message: "Invalid hiring stage" });
      }
      query.stage = stage;
    }

    const candidates = await Candidate.find(query).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch candidates" });
  }
});

// Get one candidate
router.get("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json(candidate);
  } catch (error) {
    res.status(400).json({ message: "Invalid candidate ID" });
  }
});

// Add candidate
router.post("/", async (req, res) => {
  try {
    const { name, email, role, stage = "Applied" } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof role !== "string" || !role.trim()
    ) {
      return res.status(400).json({
        message: "Name, valid email and job title are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    if (!stages.includes(stage)) {
      return res.status(400).json({ message: "Invalid hiring stage" });
    }

    const candidate = await Candidate.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.trim(),
      stage,
    });

    res.status(201).json(candidate);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A candidate with this email already exists",
      });
    }
    res.status(500).json({ message: "Unable to create candidate" });
  }
});

// Update candidate
router.put("/:id", async (req, res) => {
  try {
    const updates = {};
    const { name, email, role, stage } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "Name cannot be empty" });
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        return res.status(400).json({ message: "Invalid email address" });
      }
      updates.email = email.trim().toLowerCase();
    }

    if (role !== undefined) {
      if (typeof role !== "string" || !role.trim()) {
        return res.status(400).json({ message: "Job title cannot be empty" });
      }
      updates.role = role.trim();
    }

    if (stage !== undefined) {
      if (!stages.includes(stage)) {
        return res.status(400).json({ message: "Invalid hiring stage" });
      }
      updates.stage = stage;
    }

    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(candidate);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(400).json({ message: "Unable to update candidate" });
  }
});

// Delete candidate
router.delete("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({ success: true, message: "Candidate deleted" });
  } catch (error) {
    res.status(400).json({ message: "Invalid candidate ID" });
  }
});

module.exports = router;
