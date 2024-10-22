import express from "express";
import multer from "multer";
import * as ComentarioController from "../controller/comentarioController.js";
import { auth as checkAuth } from "../middlewares/auth.js";

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

//definir rutas
router.post("/savecomment/:id",checkAuth, ComentarioController.comment )
router.delete("/deletecomment/:id", checkAuth, ComentarioController.removeComment)


//router.post("/upload/:id",[checkAuth, uploads.single("file0")], ComentarioController.upload)
//router.get("/media/:file", ComentarioController.media)

router.get("/list",checkAuth, ComentarioController.listCommen)

export default router;