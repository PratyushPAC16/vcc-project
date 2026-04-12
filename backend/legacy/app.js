"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");

const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, "data", "courses.json");

/** Demo users — change for your team demo if needed */
const USERS = [
  { username: "student1", password: "pass123" },
  { username: "demo", password: "demo" },
];

function loadSeedCourses() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

function ensureSessionCourses(req) {
  if (!req.session.courses) {
    req.session.courses = JSON.parse(JSON.stringify(loadSeedCourses()));
  }
}

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "mycourses.sid",
    secret: "group31-change-in-production-use-random-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.post("/login", (req, res) => {
  const username = (req.body.username || "").trim();
  const password = (req.body.password || "").trim();
  const ok = USERS.some(
    (u) => u.username === username && u.password === password
  );
  if (!ok) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  req.session.user = { username };
  req.session.courses = JSON.parse(JSON.stringify(loadSeedCourses()));
  return res.json({ ok: true, username });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("mycourses.sid");
    res.json({ ok: true });
  });
});

app.get("/session", (req, res) => {
  res.json({
    loggedIn: Boolean(req.session.user),
    username: req.session.user ? req.session.user.username : null,
  });
});

/** GET all courses (from session after login) */
app.get("/courses", requireAuth, (req, res) => {
  ensureSessionCourses(req);
  res.json({ courses: req.session.courses });
});

/** GET one course by id */
app.get("/course", requireAuth, (req, res) => {
  ensureSessionCourses(req);
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: "Query id is required" });
  }
  const course = req.session.courses.find((c) => c.id === id);
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json({ course });
});

/** POST add course */
app.post("/course", requireAuth, (req, res) => {
  ensureSessionCourses(req);
  const { title, details, semester, enrollstatus } = req.body || {};
  if (!title || !details || !semester || !enrollstatus) {
    return res.status(400).json({
      error: "title, details, semester, and enrollstatus are required",
    });
  }
  const newCourse = {
    id: crypto.randomUUID(),
    title: String(title).trim(),
    details: String(details).trim(),
    semester: String(semester).trim(),
    enrollstatus: String(enrollstatus).trim(),
  };
  req.session.courses.push(newCourse);
  res.status(201).json({ course: newCourse });
});

/** PUT update course — body must include id */
app.put("/course", requireAuth, (req, res) => {
  ensureSessionCourses(req);
  const { id, title, details, semester, enrollstatus } = req.body || {};
  if (!id) {
    return res.status(400).json({ error: "id is required in body" });
  }
  const idx = req.session.courses.findIndex((c) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Course not found" });
  }
  const cur = req.session.courses[idx];
  req.session.courses[idx] = {
    id: cur.id,
    title: title != null ? String(title).trim() : cur.title,
    details: details != null ? String(details).trim() : cur.details,
    semester: semester != null ? String(semester).trim() : cur.semester,
    enrollstatus:
      enrollstatus != null
        ? String(enrollstatus).trim()
        : cur.enrollstatus,
  };
  res.json({ course: req.session.courses[idx] });
});

/** DELETE course — query id */
app.delete("/course", requireAuth, (req, res) => {
  ensureSessionCourses(req);
  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: "Query id is required" });
  }
  const before = req.session.courses.length;
  req.session.courses = req.session.courses.filter((c) => c.id !== id);
  if (req.session.courses.length === before) {
    return res.status(404).json({ error: "Course not found" });
  }
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (req, res, next) => {
  if (req.method !== "GET") return next();
  if (req.path.startsWith("/api")) return next();
  if (req.accepts("html")) {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  }
  next();
});

app.listen(PORT, () => {
  console.log(`My Courses listening on http://localhost:${PORT}`);
});
