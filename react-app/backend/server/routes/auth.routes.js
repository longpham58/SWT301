const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");

router.post("/login", controller.login);
router.post("/forgot/verify", controller.verifyUsername);
router.post("/forgot/reset", controller.resetPassword);

module.exports = router;

