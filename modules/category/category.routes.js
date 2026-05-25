import express from "express";
import * as CategoryController from "./category.controller.js";
import { auth as checkAuth } from "../../middleware/auth.js";

const router = express.Router();

router.post("/crearcategoria", checkAuth, CategoryController.crearCategoria);
router.put("/update/:id", checkAuth, CategoryController.actualizarCategoria);
router.delete("/delete/:id", checkAuth, CategoryController.eliminarCategoria);
router.get("/list{/:page}", checkAuth, CategoryController.listarCategorias);
router.get("/listcategoria/", checkAuth, CategoryController.listarCategoriasDrop);

export default router;
