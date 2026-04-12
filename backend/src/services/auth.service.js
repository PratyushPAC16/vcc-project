"use strict";

const { hashPassword, generateSalt, comparePassword } = require("../utils/crypto");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/token");
const User = require("../models/user.model");

// Limits maximum active devices per user to prevent tracking overflow
const MAX_SESSIONS = 5;

function isTransactionUnsupported(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("transaction numbers are only allowed") ||
    message.includes("replica set") ||
    message.includes("does not support transactions")
  );
}

async function runWithOptionalTransaction(workFn) {
  const session = await User.db.startSession();
  try {
    return await session.withTransaction(async () => workFn(session));
  } catch (error) {
    if (!isTransactionUnsupported(error)) {
      throw error;
    }

    // Local standalone MongoDB fallback: run same logic without transaction.
    return workFn(null);
  } finally {
    await session.endSession();
  }
}

function withSession(query, session) {
  return session ? query.session(session) : query;
}

async function registerUser({ email, password, device, ip }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  let resultUser;

  await runWithOptionalTransaction(async (session) => {
      const existingUser = await withSession(
        User.findOne({ username: normalizedEmail }),
        session
      );
      if (existingUser) {
        const error = new Error("Email is already in use");
        error.statusCode = 409;
        throw error;
      }

      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);

      if (session) {
        const createdUsers = await User.create(
          [
            {
              username: normalizedEmail,
              salt,
              passwordHash,
              refreshTokens: [],
            },
          ],
          { session }
        );
        resultUser = createdUsers[0];
      } else {
        resultUser = await User.create({
          username: normalizedEmail,
          salt,
          passwordHash,
          refreshTokens: [],
        });
      }
  });

  return {
    id: String(resultUser._id),
    username: resultUser.username,
    email: resultUser.username,
  };
}

async function loginUser({ email, password, device, ip }) {
  const normalizedEmail = String(email).trim().toLowerCase();

  let resultPayload;

  await runWithOptionalTransaction(async (session) => {
      const user = await withSession(
        User.findOne({ username: normalizedEmail }),
        session
      );
      if (!user || !comparePassword(password, user.salt, user.passwordHash)) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
      }

      const userId = String(user._id);
      const accessToken = generateAccessToken(userId);
      const refreshToken = generateRefreshToken(userId);

      // Support concurrent sessions:
      user.refreshTokens.push({
        token: refreshToken,
        device: String(device),
        ip: String(ip),
      });

      // Avoid hoarding old sessions
      if (user.refreshTokens.length > MAX_SESSIONS) {
        user.refreshTokens.shift(); // Remove oldest
      }

      await user.save(session ? { session } : undefined);

      resultPayload = {
        user: { id: userId, username: user.username, email: user.username },
        tokens: { accessToken, refreshToken },
      };
  });

  return resultPayload;
}

async function logoutUser(refreshToken) {
  if (!refreshToken) return;
  // Pull the session specific to the provided token without disturbing others
  await User.findOneAndUpdate(
    { "refreshTokens.token": refreshToken },
    { $pull: { refreshTokens: { token: refreshToken } } }
  );
}

async function rotateRefreshToken(currentRefreshToken, ip, deviceFallback) {
  if (!currentRefreshToken) {
    const error = new Error("Refresh token is required");
    error.statusCode = 401;
    throw error;
  }

  const payload = verifyRefreshToken(currentRefreshToken);

  let resultPayload;

  await runWithOptionalTransaction(async (session) => {
      const user = await withSession(User.findById(payload.sub), session);
      if (!user) {
        const error = new Error("User not found");
        error.statusCode = 401;
        throw error;
      }

      // Check array membership
      const existingSession = user.refreshTokens.find((t) => t.token === currentRefreshToken);

      if (!existingSession) {
        // TOKEN REUSE DETECTED: Valid signature, but no longer recognized in DB.
        // This indicates potential token theft. Protect account by nuking all sessions.
        user.refreshTokens = [];
        await user.save(session ? { session } : undefined);

        const error = new Error("Refresh token reuse detected. All devices revoked.");
        error.statusCode = 401;
        throw error;
      }

      // Filter out the old token securely
      user.refreshTokens = user.refreshTokens.filter((t) => t.token !== currentRefreshToken);

      // Issue rotated tokens
      const userId = String(user._id);
      const accessToken = generateAccessToken(userId);
      const newRefreshToken = generateRefreshToken(userId);

      // Keep original session's metadata intact, just replaced tokens.
      user.refreshTokens.push({
        token: newRefreshToken,
        device: existingSession.device || deviceFallback,
        ip: ip || existingSession.ip,
      });

      await user.save(session ? { session } : undefined);

      resultPayload = {
        user: { id: userId, username: user.username, email: user.username },
        tokens: { accessToken, refreshToken: newRefreshToken },
      };
  });

  return resultPayload;
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  rotateRefreshToken,
};
