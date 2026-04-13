"use strict";

const express = require("express");
const courseController = require("../controllers/course.controller");

const router = express.Router();

router.get("/courses", courseController.getCourses);
router.get("/course/:id", courseController.getCourse);
router.post("/course", courseController.addCourse);
router.put("/course/:id", courseController.editCourse);
router.delete("/course/:id", courseController.removeCourse);

module.exports = router;

