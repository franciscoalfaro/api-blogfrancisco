import express from "express";
import multer from "multer";
import * as ArticuloController from "../controller/articuloController.js";
import { auth as checkAuth } from "../middlewares/auth.js";;


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


//imagen portada 
router.post("/upload/:id",[checkAuth, uploads.single("file0")], ArticuloController.upload)

router.get("/media/:file", ArticuloController.media)

//imagen
router.delete("/deleteimagen/:id", checkAuth,ArticuloController.eliminarImagen)

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