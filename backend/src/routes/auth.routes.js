"use strict";

const express = require("express");
const { register, login, logout, refreshToken, me } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/me", requireAuth, me);

module.exports = router;
