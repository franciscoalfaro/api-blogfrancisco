import express from "express";
import multer from "multer";
import * as ArticuloController from "../controller/articuloController.js";
import { auth as checkAuth } from "../middlewares/auth.js";
import { imageUpload, processAndSaveImage, processAndSaveCover } from "../middlewares/imageMiddleware.js";


const router = express.Router()

//configuracion de subida
const storage = multer.diskStorage({
    destination:(req,file, cb) =>{
        cb(null,"./uploads/publications")

    },

    filename:(req,file, cb) =>{
        cb(null,"articulo-"+Date.now()+"-"+file.originalname)
        
    }
})


const uploads = multer({storage})

//crear, eliminar, update
router.post("/create",checkAuth, ArticuloController.crearArticulo)
router.delete("/delete/:id",checkAuth, ArticuloController.eliminarArticulo)
router.put("/update/:id",checkAuth, ArticuloController.actualizarArticulo)


//imagen portada - nueva versión con compresión
router.post("/upload/:id",[checkAuth, imageUpload.single("file0"), processAndSaveCover], ArticuloController.upload)


//imagen de contenido (TinyMCE) - nueva ruta
router.post("/upload-content-image", checkAuth, imageUpload.single("file0"), processAndSaveImage, ArticuloController.uploadContentImage)

router.get("/media/:file", ArticuloController.media)

//buscar articulos
router.get("/search/:articulo/:page?", ArticuloController.buscador);

//consultar y traer el articulo por el id
router.get("/obtenido/:id", ArticuloController.leerArticulo)

//listar los articulos
router.get("/list/:page?", ArticuloController.listArticulos)
router.get("/ultimos/", ArticuloController.listMasVistos)
router.get("/misarticulos/:page?",checkAuth, ArticuloController.listMisArticulos)



//esto es para listar los articulos de un usuario seleccionado
router.get("/articulouser/:id/:page?", ArticuloController.listArticulosPorId)

//contador de publicaciones es publico para saber cuantos usuarios visualizan la publicacion
router.post("/aumentar/:id", ArticuloController.incrementarVisualizaciones )


export default router;