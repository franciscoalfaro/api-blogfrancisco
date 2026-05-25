import express from "express";
import * as LikeController from "./like.controller.js";
import { auth as checkAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post("/megusta/:id", checkAuth, LikeController.likePublication);
router.post("/nolike/:id", checkAuth, LikeController.unlike);
router.delete("/unlike/:id", checkAuth, LikeController.deleteLike);
router.get("/listlikes/:id", LikeController.listLikes);

export default router;
