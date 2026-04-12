"use strict";

const path = require("path");
require("dotenv").config();

const app = require("./src/app");
const { connectDatabase } = require("./src/config/db");
const { initializeCourses } = require("./src/services/course.service");

const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, "src", "data", "courses.json");

async function bootstrap() {
  await connectDatabase();
  await initializeCourses(DATA_FILE);

  app.listen(PORT, () => {
    console.log(`My Courses backend listening on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
