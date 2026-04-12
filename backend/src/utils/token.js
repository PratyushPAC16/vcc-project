"use strict";

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "7d";

function getSecret(envName, fallback) {
  const value = process.env[envName];
  if (value) return value;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${envName} is required in production`);
  }
  return fallback;
}

function generateAccessToken(userId) {
  return jwt.sign(
    { sub: String(userId), type: "access", jti: crypto.randomUUID() },
    getSecret("JWT_ACCESS_SECRET", "dev-access-secret"),
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function generateRefreshToken(userId) {
  return jwt.sign(
    { sub: String(userId), type: "refresh", jti: crypto.randomUUID() },
    getSecret("JWT_REFRESH_SECRET", "dev-refresh-secret"),
    { expiresIn: REFRESH_TOKEN_TTL }
  );
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, getSecret("JWT_ACCESS_SECRET", "dev-access-secret"));
  if (payload.type !== "access") throw new Error("Invalid access token type");
  return payload;
}

function verifyRefreshToken(token) {
  const payload = jwt.verify(token, getSecret("JWT_REFRESH_SECRET", "dev-refresh-secret"));
  if (payload.type !== "refresh") throw new Error("Invalid refresh token type");
  return payload;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
