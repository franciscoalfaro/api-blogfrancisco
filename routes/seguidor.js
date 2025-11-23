import express from "express";
import * as SeguidorController from "../controller/SeguidorController.js";
import { auth as checkAuth } from "../middlewares/auth.js";

const router = express.Router()


//definir rutas

router.post("/seguir/:id",checkAuth,  SeguidorController.AgregarSeguido)
router.delete("/dejarseguir/:id", checkAuth, SeguidorController.DejarSeguir)
router.get("/miseguidores/", checkAuth, SeguidorController.MisSeguidores)
router.get("/seguidores/:id",  SeguidorController.SeguidoresDeUsuario);
router.get("/quiensigue/:id",  SeguidorController.SeguidosDeUsuario);



// Exportar router
export default router;