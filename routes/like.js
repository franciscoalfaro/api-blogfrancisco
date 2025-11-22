import express from "express";
import * as LikeController from "../controller/LikeController.js";
import { auth as checkAuth } from "../middlewares/auth.js";

const router = express.Router()


//definir rutas

router.post("/megusta/:id",checkAuth,  LikeController.likePublication)
router.post("/nolike/:id", checkAuth, LikeController.unlike)

//elimina el like/nolike
router.delete("/unlike/:id", checkAuth, LikeController.deleteLike)

//devuelve el total de like/nolike de la publicacion
router.get("/listlikes/:id",  LikeController.listLikes);


// Exportar router
export default router;