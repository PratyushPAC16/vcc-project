"use strict";

const crypto = require("crypto");

const HASH_ITERATIONS = 100000;
const HASH_KEYLEN = 64;
const HASH_DIGEST = "sha512";

function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password, salt) {
  return crypto
    .pbkdf2Sync(String(password), String(salt), HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST)
    .toString("hex");
}

function comparePassword(password, salt, passwordHash) {
  const computedHash = hashPassword(password, salt);
  const hashBuffer = Buffer.from(String(passwordHash), "hex");
  const computedBuffer = Buffer.from(computedHash, "hex");

  if (hashBuffer.length !== computedBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashBuffer, computedBuffer);
}

module.exports = {
  hashPassword,
  generateSalt,
  comparePassword,
};
