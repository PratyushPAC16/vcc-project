"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    // Supporting Multiple Active Sessions (Transactions/Security Concept)
    refreshTokens: [
      {
        token: { type: String, required: true },
        device: { type: String, default: "Unknown" },
        ip: { type: String, default: "Unknown" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("User", userSchema);

