import express from "express";
import * as CommentController from "./comment.controller.js";
import { auth as checkAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post("/savecomment/:id", checkAuth, CommentController.comment);
router.delete("/deletecomment/:id", checkAuth, CommentController.removeComment);
router.get("/comment/:id{/:page}", CommentController.listCommen);

export default router;
