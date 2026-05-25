import express from "express";
import multer from "multer";
import path from "path";
import * as ArticuloController from "./article.controller.js";
import { auth as checkAuth } from "../../middleware/auth.js";
import { imageUpload, processAndSaveImage, processAndSaveCover } from "../../middleware/upload.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications");
    },
    filename: (req, file, cb) => {
        const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, "articulo-" + Date.now() + "-" + safeName);
    }
});

const uploads = multer({ storage });

router.post("/create", checkAuth, ArticuloController.crearArticulo);
router.delete("/delete/:id", checkAuth, ArticuloController.eliminarArticulo);
router.put("/update/:id", checkAuth, ArticuloController.actualizarArticulo);

router.post("/upload/:id", [checkAuth, imageUpload.single("file0"), processAndSaveCover], ArticuloController.upload);

router.post("/upload-content-image", checkAuth, imageUpload.single("file0"), processAndSaveImage, ArticuloController.uploadContentImage);

router.get("/media/:file", ArticuloController.media);

router.delete("/deleteimagen/:id", checkAuth, ArticuloController.eliminarImagen);

router.get("/search/:articulo{/:page}", ArticuloController.buscador);

router.get("/list{/:page}", ArticuloController.listArticulos);
router.get("/ultimos/", ArticuloController.listMasVistos);

router.get("/misarticulos{/:page}", checkAuth, ArticuloController.listMisArticulos);

router.get("/articulouser/:id{/:page}", ArticuloController.listArticulosPorId);

router.get("/obtenido/:id", ArticuloController.leerArticulo);

router.post("/aumentar/:id", ArticuloController.incrementarVisualizaciones);

export default router;
