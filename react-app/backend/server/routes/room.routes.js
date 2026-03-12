const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room.controller");

// Lấy danh sách tất cả kỳ thi
router.get("/", roomController.getAllExams);

// Lấy chi tiết 1 kỳ thi
router.get("/:examId", roomController.getExamDetail);

// NEW: generate rooms khi bấm Open
router.post("/generate/:examId", roomController.generateRooms);

module.exports = router;