const express = require("express");
const router = express.Router();

const controller = require("../controllers/score.controller");

router.get("/", controller.getScores);

// dropdown subjects
router.get("/subjects", controller.getSubjects);

router.put("/:studentId", controller.updateScore);

router.post("/clear", controller.clearScores);

router.get("/export", controller.exportScores);

module.exports = router;