"use strict";

const { ZodError } = require("zod");
const { registerSchema, loginSchema } = require("../validators/auth.validator");
const { registerUser, loginUser, logoutUser, rotateRefreshToken } = require("../services/auth.service");

// Security Settings applied dynamically to cookies based on NODE_ENV
const ACCESS_COOKIE_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions(maxAge) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
    path: "/",
  };
}

function handleError(res, error) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : error.message,
  });
}

function getClientIp(req) {
  // Use Express raw IP or proxy forwarded IP
  return req.headers["x-forwarded-for"] || req.connection.remoteAddress || "Unknown";
}

function getDevice(req) {
  return req.headers["user-agent"] || "Unknown";
}

async function register(req, res) {
  try {
    const payload = registerSchema.parse(req.body);
    const ip = getClientIp(req);
    const device = getDevice(req);

    const user = await registerUser({ ...payload, ip, device });
    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    return handleError(res, error);
  }
}

async function login(req, res) {
  try {
    const payload = loginSchema.parse(req.body);
    const ip = getClientIp(req);
    const device = getDevice(req);

    const result = await loginUser({ ...payload, ip, device });

    res.cookie("accessToken", result.tokens.accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE_MS));
    res.cookie("refreshToken", result.tokens.refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE_MS));

    return res.json({ message: "Login successful", user: result.user });
  } catch (error) {
    return handleError(res, error);
  }
}

async function logout(req, res) {
  try {
    const rfToken = req.cookies?.refreshToken;
    await logoutUser(rfToken);

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    return res.json({ message: "Logout successful" });
  } catch (error) {
    return handleError(res, error);
  }
}

async function refreshToken(req, res) {
  try {
    const rfToken = req.cookies?.refreshToken;
    const ip = getClientIp(req);
    const device = getDevice(req);

    const result = await rotateRefreshToken(rfToken, ip, device);

    res.cookie("accessToken", result.tokens.accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE_MS));
    res.cookie("refreshToken", result.tokens.refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE_MS));

    return res.json({ message: "Token refreshed successfully", user: result.user });
  } catch (error) {
    return handleError(res, error);
  }
}

function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, logout, refreshToken, me };
