const express = require("express");
const router = express.Router();
const multer = require("multer");

const studentController = require("../controllers/student.controller");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", studentController.getStudents);

router.post(
  "/import",
  upload.single("file"),  
  studentController.importStudents
);

router.delete("/:id", studentController.deleteStudent);

router.get("/export", studentController.exportStudents);

module.exports = router;