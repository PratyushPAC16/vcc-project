"use strict";

const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is required in environment variables");
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.DB_NAME || "mycourses",
  });
}

module.exports = {
  connectDatabase,
};

