import express from "express";
import * as RecoveryController from "../controller/recoveryController.js";

const router = express.Router()

router.post("/request-reset", RecoveryController.requestPasswordReset)
router.post("/reset-password/:token", RecoveryController.handleResetPassword)

export default router;