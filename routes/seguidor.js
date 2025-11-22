import express from "express";
import * as SeguidorController from "../controller/SeguidorController.js";
import { auth as checkAuth } from "../middlewares/auth.js";

const router = express.Router()


//definir rutas

router.post("/seguir/:id",checkAuth,  SeguidorController.AgregarSeguido)
router.delete("/dejarseguir/:id", checkAuth, SeguidorController.DejarSeguir)
router.get("/listar/", checkAuth, SeguidorController.ListarSeguidores)

router.get("/listseguidores/:id",  SeguidorController.ListarSeguidoresPorUsuario);


// Exportar router
export default router;