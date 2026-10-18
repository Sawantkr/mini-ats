
const express = require("express");
const Candidate = require("../models/Candidate");

const router = express.Router();

router.get("/stats", async (req, res) => {
  try {
    const stages = ["Applied", "Screening", "Interview", "Selected", "Rejected"];

    const [total, grouped] = await Promise.all([
      Candidate.countDocuments(),
      Candidate.aggregate([
        { $group: { _id: "$stage", count: { $sum: 1 } } },
      ]),
    ]);

    const counts = Object.fromEntries(
      stages.map((stage) => [stage, 0])
    );

    grouped.forEach(({ _id, count }) => {
      counts[_id] = count;
    });

    res.json({
      total,
      applied: counts.Applied,
      screening: counts.Screening,
      interviews: counts.Interview,
      selected: counts.Selected,
      rejected: counts.Rejected,
      byStage: counts,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch dashboard statistics" });
  }
});

module.exports = router;
