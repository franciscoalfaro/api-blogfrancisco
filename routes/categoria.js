import express from "express";
import * as CategoriaController from "../controller/categoriaController.js";
import { auth as checkAuth } from "../middlewares/auth.js";

const router = express.Router()

//ruta para crear actualizar y elmiminar gastos
router.post("/crearcategoria",checkAuth, CategoriaController.crearCategoria)
router.put("/update/:id",checkAuth, CategoriaController.actualizarCategoria)
router.delete("/delete/:id",checkAuth, CategoriaController.eliminarCategoria)
router.get("/list/:page?",checkAuth, CategoriaController.listarCategorias)
router.get("/listcategoria/",checkAuth, CategoriaController.listarCategoriasDrop)

// Exportar router
export default router;