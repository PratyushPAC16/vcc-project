"use strict";

const { z } = require("zod");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("must be a valid email address")
  .max(254, "email is too long");

const passwordSchema = z
  .string()
  .min(8, "must be at least 8 characters")
  .max(128, "password is too long")
  .regex(/[a-z]/, "must include at least one lowercase letter")
  .regex(/[A-Z]/, "must include at least one uppercase letter")
  .regex(/[0-9]/, "must include at least one number")
  .regex(/[^A-Za-z0-9]/, "must include at least one special character")
  .regex(/^\S+$/, "must not include spaces");

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
}).strict();

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
}).strict();

module.exports = {
  registerSchema,
  loginSchema,
};
