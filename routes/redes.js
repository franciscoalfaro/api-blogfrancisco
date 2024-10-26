import express from "express";
import * as RedesController from "../controller/redesController.js";
import { auth as checkAuth } from "../middlewares/auth.js";

const router = express.Router();


router.post("/create", checkAuth, RedesController.crearRed);
router.delete("/delete/:id", checkAuth, RedesController.eliminarRed);
router.put("/update/:id", checkAuth, RedesController.actualizarRed);
router.get("/list/:page?", checkAuth, RedesController.listarRedes)


//listado publico 
router.get("/listado/:id/:page?", RedesController.listado)
router.get("/redesadministrador", RedesController.redAdmin)

// Exportar router
export default router;
