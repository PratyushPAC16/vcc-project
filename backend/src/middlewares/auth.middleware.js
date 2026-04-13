"use strict";

const { verifyAccessToken } = require("../utils/token");
const User = require("../models/user.model");

async function requireAuth(req, res, next) {
  try {
    // Rely on cookie-parser populated req.cookies
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ error: "Access token missing" });
    }

    const payload = verifyAccessToken(accessToken);
    const user = await User.findById(payload.sub).select("_id username");

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = {
      id: String(user._id),
      username: user.username,
      email: user.username,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = {
  requireAuth,
};
