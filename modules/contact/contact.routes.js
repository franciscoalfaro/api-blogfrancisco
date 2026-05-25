import express from "express";
import * as ContactController from "./contact.controller.js";

const router = express.Router();

router.post("/crear", ContactController.contacto);

export default router;
