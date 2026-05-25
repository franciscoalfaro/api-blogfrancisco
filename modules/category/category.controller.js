import * as categoryService from './category.service.js';

export const crearCategoria = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;
        const nuevaCategoria = await categoryService.create(userId, name);
        return res.status(201).json({ status: "success", message: "Categoría creada correctamente", categoria: nuevaCategoria });
    } catch (error) {
        if (error.message.includes("ya existe")) {
            return res.status(409).json({ status: "error", message: "La categoría ya existe para este usuario" });
        }
        return res.status(500).json({ status: "error", message: "Error al crear la categoría" });
    }
};

export const eliminarCategoria = async (req, res) => {
    try {
        await categoryService.remove(req.params.id, req.user.id);
        return res.status(200).json({ status: 'success', message: 'Categoría eliminada correctamente' });
    } catch (error) {
        const code = error.message.includes("permisos") ? 404 : 500;
        const msg = error.message.includes("permisos") ? "Categoría no encontrada" : "Error al eliminar la categoría";
        return res.status(code).json({ status: 'error', message: msg });
    }
};

export const actualizarCategoria = async (req, res) => {
    try {
        const categoriaActualizada = await categoryService.update(req.params.id, req.user.id, req.body.name);
        return res.status(200).json({ status: 'success', message: 'Categoría actualizada correctamente', categoria: categoriaActualizada });
    } catch (error) {
        const code = error.message.includes("no fue encontrada") ? 404 : 500;
        const msg = error.message.includes("no fue encontrada") ? "Categoría no encontrada" : "Error al actualizar la categoría";
        return res.status(code).json({ status: 'error', message: msg });
    }
};

export const listarCategorias = async (req, res) => {
    try {
        const userId = req.user.id;
        let page = 1;
        if (req.params.page) page = parseInt(req.params.page);

        const categorias = await categoryService.list(userId, page);
        return res.status(200).json({
            status: 'success', message: 'Categorías encontradas',
            categorias: categorias.docs, totalPages: categorias.totalPages,
            totalCategories: categorias.totalCategoria, itempage: categorias.limit,
            page: categorias.page, totalDocs: categorias.totalDocs
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error al listar las categorías' });
    }
};

export const listarCategoriasDrop = async (req, res) => {
    try {
        const userId = req.user.id;
        const categorias = await categoryService.listDrop(userId);
        return res.status(200).json({ status: 'success', message: 'Categorías encontradas', categorias: categorias.docs });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error al listar las categorías' });
    }
};
