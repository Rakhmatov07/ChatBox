const { Router } = require("express");
const { chatView } = require("../controllers/chat.controller");
const router = Router();

router.get("/chat", chatView);

module.exports = router; 