
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function migrateCandidates() {
  try {
    const filePath = path.join(
      process.env.USERPROFILE || "",
      "Downloads",
      "candidates.json"
    );

    const rawData = fs.readFileSync(filePath, "utf8");
    const candidates = JSON.parse(rawData);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    const collection = mongoose.connection.collection("candidates");

    for (const candidate of candidates) {
      const email = candidate.email?.toLowerCase();

      if (!email) {
        console.log("Skipped record without email");
        continue;
      }

      const existing = await collection.findOne({ email });

      if (existing) {
        console.log(`Skipped existing candidate: ${email}`);
        continue;
      }

      const document = {
        name: candidate.name,
        email,
        role: candidate.role,
        stage: candidate.stage || "Applied",
        createdAt: candidate.createdAt?.$date
          ? new Date(candidate.createdAt.$date)
          : new Date(),
        updatedAt: candidate.updatedAt?.$date
          ? new Date(candidate.updatedAt.$date)
          : new Date(),
      };

      await collection.insertOne(document);
      console.log(`Migrated: ${candidate.name}`);
    }

    console.log("Migration finished");
  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

migrateCandidates();
