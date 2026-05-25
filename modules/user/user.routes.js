import express from "express";
import multer from "multer";
import path from "path";
import * as UserController from "./user.controller.js";
import { auth as checkAuth } from "../../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars");
    },
    filename: (req, file, cb) => {
        const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '');
        cb(null, "avatar-" + Date.now() + "-" + safeName);
    }
});

const uploads = multer({ storage });

router.get("/profile/:id", checkAuth, UserController.profile);
router.get("/list{/:page}", checkAuth, UserController.list);
router.put("/update", checkAuth, UserController.update);
router.post("/upload", [checkAuth, uploads.single("file0")], UserController.upload);
router.get("/avatar/:file", UserController.avatar);
router.delete("/delete/:id", checkAuth, UserController.remove);

router.get("/lastprofiles{/:page}", UserController.publicListUser);
router.get("/profilepublic/:id", UserController.publicProfile);

export default router;
