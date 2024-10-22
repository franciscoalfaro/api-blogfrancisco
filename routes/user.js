import express from "express";
import multer from "multer";
import * as UserController from "../controller/userController.js";
import { auth as checkAuth } from "../middlewares/auth.js";

const router = express.Router();

//configuracion de subida
const storage = multer.diskStorage({
    destination:(req,file, cb) =>{
        cb(null,"./uploads/avatars")

    },

    filename:(req,file, cb) =>{
        cb(null,"avatar-"+Date.now()+"-"+file.originalname)
        
    }
})

const uploads = multer({storage})

//definir rutas

router.post("/register", UserController.register)
router.post("/login",UserController.login)
router.get("/profile/:id",checkAuth, UserController.profile)
router.get("/list/:page?",checkAuth, UserController.list)
router.put("/update",checkAuth, UserController.update)
router.post("/upload",[checkAuth, uploads.single("file0")], UserController.upload)
router.get("/avatar/:file", UserController.avatar)
router.delete("/delete/:id", checkAuth, UserController.remove)

//rutas publicas
router.get("/lastprofiles/:page?", UserController.publicListUser)
router.get("/profilepublic/:id", UserController.publicProfile)

// Exportar router
export default router;
