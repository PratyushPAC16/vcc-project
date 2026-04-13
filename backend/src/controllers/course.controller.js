"use strict";

const courseService = require("../services/course.service");

async function getCourses(req, res, next) {
  try {
    const courses = await courseService.getAllCourses();
    return res.status(200).json({ courses });
  } catch (error) {
    return next(error);
  }
}

async function getCourse(req, res, next) {
  try {
    const course = await courseService.getCourseById(req.params.id);
    return res.status(200).json({ course });
  } catch (error) {
    return next(error);
  }
}

async function addCourse(req, res, next) {
  try {
    const course = await courseService.createCourse(req.body);
    return res.status(201).json({ course });
  } catch (error) {
    return next(error);
  }
}

async function editCourse(req, res, next) {
  try {
    const hasBody = req.body && Object.keys(req.body).length > 0;
    if (!hasBody) {
      const badRequest = new Error("Request body is required");
      badRequest.status = 400;
      throw badRequest;
    }

    const course = await courseService.updateCourse(req.params.id, req.body);
    return res.status(200).json({ course });
  } catch (error) {
    return next(error);
  }
}

async function removeCourse(req, res, next) {
  try {
    await courseService.deleteCourse(req.params.id);
    return res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCourses,
  getCourse,
  addCourse,
  editCourse,
  removeCourse,
};

