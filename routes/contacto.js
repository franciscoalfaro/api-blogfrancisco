import express from "express";
import * as ContactoController from "../controller/ContactoController.js";

const router = express.Router();


router.post("/crear",ContactoController.contacto)

// Exportar router
export default router;
