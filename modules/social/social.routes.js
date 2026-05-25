import express from "express";
import * as SocialController from "./social.controller.js";
import { auth as checkAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post("/create", checkAuth, SocialController.crearRed);
router.delete("/delete/:id", checkAuth, SocialController.eliminarRed);
router.put("/update/:id", checkAuth, SocialController.actualizarRed);
router.get("/list{/:page}", checkAuth, SocialController.listarRedes);
router.get("/listado/:id{/:page}", SocialController.listado);
router.get("/redesadministrador", SocialController.redAdmin);

export default router;
