import express from "express";
import * as FollowerController from "./follower.controller.js";
import { auth as checkAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post("/seguir/:id", checkAuth, FollowerController.AgregarSeguido);
router.delete("/dejarseguir/:id", checkAuth, FollowerController.DejarSeguir);
router.get("/miseguidores/", checkAuth, FollowerController.MisSeguidores);
router.get("/seguidores/:id", FollowerController.SeguidoresDeUsuario);
router.get("/quiensigue/:id", FollowerController.SeguidosDeUsuario);

export default router;
