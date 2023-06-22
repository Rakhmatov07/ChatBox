const { Router } = require("express");
const { loginView } = require("../controllers/auth.controller");
const router = Router();

router.get("/login", loginView);

module.exports = router;