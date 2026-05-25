import Categoria from './category.model.js';
import { Articulo } from '../article/article.model.js';

export const create = async (userId, name) => {
    const categoriaExistente = await Categoria.findOne({ name, userId });
    if (categoriaExistente) {
        throw new Error("La categoría ya existe para este usuario");
    }

    const nuevaCategoria = await Categoria.create({ name, userId });
    return nuevaCategoria;
};

export const remove = async (categoriaId, userId) => {
    const categoriaEliminar = await Categoria.findOne({ _id: categoriaId, userId });
    if (!categoriaEliminar) {
        throw new Error("La categoría no fue encontrada o no tiene permisos para eliminarla");
    }

    let categoriaPredeterminada = await Categoria.findOne({ name: 'Sin Categoría', userId });
    if (!categoriaPredeterminada) {
        categoriaPredeterminada = await Categoria.create({ name: 'Sin Categoría', userId });
    }

    await Articulo.updateMany({ categoria: categoriaId }, { categoria: categoriaPredeterminada._id });
    await Categoria.findByIdAndDelete(categoriaId);
    return true;
};

export const update = async (id, userId, name) => {
    const categoriaActualizada = await Categoria.findOneAndUpdate(
        { _id: id, userId },
        { name },
        { new: true }
    );
    if (!categoriaActualizada) {
        throw new Error("La categoría no fue encontrada");
    }
    return categoriaActualizada;
};

export const list = async (userId, page) => {
    const itemPerPage = 4;
    const options = { page, limit: itemPerPage };
    const categorias = await Categoria.paginate({ userId }, options);
    return categorias;
};

export const listDrop = async (userId) => {
    const categorias = await Categoria.paginate({ userId });
    return categorias;
};
