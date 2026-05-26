import fs from "fs"
import path from "path"
import * as validarArt from './article.validation.js';
import { Articulo, ContadorArticulo } from "./article.model.js"
import mongoosePagination from 'mongoose-paginate-v2'
import User from "../user/user.model.js"
import Categoria from "../category/category.model.js"
import Seguidor from "../follower/follower.model.js"
import * as sanitizerService from '../../shared/sanitize/sanitize.service.js';
import * as InformacionService from '../../shared/email/email.service.js';
import mongoose from "mongoose";

const UPLOAD_DIR = "./uploads/publications";

class ServiceError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
    }
}

export const crearArticulo = async (userId, params) => {
    if (!params.titulo || !params.descripcion || !params.contenido || !params.categoria) {
        throw new ServiceError("Faltan datos por enviar", 400);
    }

    validarArt.validar(params);

    let categoriaExistente = await Categoria.findById(params.categoria);
    if (!categoriaExistente) {
        throw new ServiceError('La categoría seleccionada no existe', 400);
    }

    let usuarioPublicacion = await User.findOne({ _id: userId });

    const contenidoSanitizado = await sanitizerService.sanitizarContenido(params.contenido);

    const newArticulo = await Articulo.create({
        userId: userId,
        titulo: params.titulo,
        descripcion: params.descripcion,
        contenido: contenidoSanitizado,
        categoria: categoriaExistente._id,
        Autor: usuarioPublicacion.name,
        ApellidoAutor: usuarioPublicacion.surname
    });

    await newArticulo.save();

    const seguidores = await Seguidor.find({ creadorId: userId }).populate('userId');

    for (let seguidor of seguidores) {
        const { name, email } = seguidor.userId;
        await InformacionService.enviarCorreoInformativo(name, email, newArticulo);
    }

    return { newArticulo };
}

export const eliminarArticulo = async (articuloId, userId) => {
    const articuloEliminar = await Articulo.findOne({ _id: articuloId, userId: userId });

    if (!articuloEliminar) {
        throw new ServiceError('Articulo no encontrado o no tiene permisos para eliminarlo', 404);
    }

    if (articuloEliminar.userId.toString() !== userId) {
        throw new ServiceError('No tiene permisos para eliminar este artículo', 403);
    }

    if (articuloEliminar.coverImage && articuloEliminar.coverImage !== 'default.png') {
        const coverPath = path.join(UPLOAD_DIR, articuloEliminar.coverImage);
        if (fs.existsSync(coverPath)) {
            fs.unlinkSync(coverPath);
        }
    }

    if (articuloEliminar.imagenes && articuloEliminar.imagenes.length > 0) {
        for (const img of articuloEliminar.imagenes) {
            const imgPath = path.join(UPLOAD_DIR, img.filename);
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        }
    }

    await Articulo.findByIdAndDelete(articuloId);

    return { articuloEliminado: articuloEliminar };
}

export const actualizarArticulo = async (articuloId, userId, data) => {
    const articuloExistente = await Articulo.findById(articuloId);
    if (!articuloExistente) {
        throw new ServiceError('Articulo no fue encontrado', 404);
    }

    if (articuloExistente.userId.toString() !== userId) {
        throw new ServiceError('No tiene permisos para modificar este artículo', 403);
    }

    const allowedFields = ['titulo', 'contenido', 'descripcion', 'categoria'];
    const filteredData = {};
    allowedFields.forEach(field => {
        if (data[field] !== undefined) filteredData[field] = data[field];
    });

    if (filteredData.categoria) {
        const categoriaDB = await Categoria.findById(filteredData.categoria);
        if (!categoriaDB) {
            throw new ServiceError('La categoría no existe', 400);
        }
    }

    const articuloModificado = await Articulo.findByIdAndUpdate(
        articuloId,
        filteredData,
        { new: true, runValidators: true }
    );

    return { articulo: articuloModificado };
}

export const uploadCover = async (articuloId, userId, processedFile) => {
    const oldArticulo = await Articulo.findById(articuloId);
    if (oldArticulo && oldArticulo.coverImage && oldArticulo.coverImage !== 'default.png') {
        const oldPath = path.join(UPLOAD_DIR, oldArticulo.coverImage);
        if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
        }
    }

    const articulo = await Articulo.findOneAndUpdate(
        { _id: articuloId, userId: userId },
        { coverImage: processedFile.filename },
        { new: true }
    );

    if (!articulo) {
        throw new ServiceError("Artículo no encontrado", 404);
    }

    return { articulo };
}

export const uploadContentImage = async (processedFile) => {
    return {
        url: processedFile.url,
        filename: processedFile.filename
    };
}

export const eliminarImagen = async (articuloId, userId, imagenId) => {
    const articulo = await Articulo.findOne({ _id: articuloId, userId: userId });

    if (!articulo) {
        throw new ServiceError('articulo no encontrado o no pertenece al usuario', 404);
    }

    const imagen = articulo.images.find(img => img._id.toString() === imagenId);
    if (!imagen) {
        throw new ServiceError('Imagen no encontrada en el articulo', 404);
    }

    const filePath = path.resolve('./uploads/publications/', imagen.filename);

    try {
        await is.access(filePath);
        await is.unlink(filePath);
    } catch (err) {
        console.error('Error eliminando el archivo físico:', err);
        throw new ServiceError('No se pudo eliminar el archivo físico de la imagen', 500);
    }

    await Articulo.updateOne(
        { _id: articuloId, userId: userId },
        { $pull: { images: { _id: imagenId } } }
    );

    const imagenesRestantes = proyecto.images.filter(img => img._id.toString() !== imagenId);

    return { imagenes: imagenesRestantes };
}

export const buscador = async (busqueda, page) => {
    if (busqueda.length < 2) {
        throw new ServiceError("La búsqueda debe contener al menos 2 caracteres.", 400);
    }

    busqueda = busqueda.replace(/\+/g, " ");

    const safeRegex = busqueda.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let itemPerPage = 4;

    const options = {
        page,
        limit: itemPerPage,
        sort: { fecha: -1 },
        select: "-password",
        populate: [],
        lean: true,
    };

    const query = {
        $or: [
            { titulo:      { $regex: safeRegex, $options: "i" } },
            { descripcion: { $regex: safeRegex, $options: "i" } },
            { contenido:   { $regex: safeRegex, $options: "i" } },
            { Autor:       { $regex: safeRegex, $options: "i" } },
        ],
    };

    const resultados = await Articulo.paginate(query, options);

    if (!resultados.docs.length) {
        throw new ServiceError("No se encontraron artículos relacionados con tu búsqueda.", 404);
    }

    const articulosFinal = await Promise.all(
        resultados.docs.map(async (art) => {
            const contador = await ContadorArticulo.findOne({ articuloId: art._id }).lean();
            return {
                ...art,
                vistas: contador?.visto || 0,
            };
        })
    );

    return {
        resultados: articulosFinal,
        page: resultados.page,
        totalDocs: resultados.totalDocs,
        totalPages: resultados.totalPages,
        itemPerPage: resultados.limit
    };
}

export const listArticulos = async (page) => {
    const limit = 4;
    const skip = (page - 1) * limit;

    const contadorCollection = ContadorArticulo.collection.name; 

    const result = await Articulo.aggregate([
        { $sort: { fecha: -1 } },
        { $skip: skip },
        { $limit: limit },

        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    { 
                      $project: { 
                        name: 1,
                        surname: 1,
                        image: 1
                      }
                    }
                ]
            }
        },
        { $unwind: "$author" },

        {
            $lookup: {
                from: contadorCollection,
                localField: "_id",
                foreignField: "articuloId",
                as: "contador"
            }
        },

        {
            $addFields: {
                vistas: {
                    $ifNull: [
                        { $arrayElemAt: ["$contador.visto", 0] },
                        0
                    ]
                },
                Autor: "$author.name",
                ApellidoAutor: "$author.surname"
            }
        },

        {
            $project: {
                titulo: 1,
                descripcion: 1,
                fecha: 1,
                coverImage: 1,
                categoria: 1,
                vistas: 1,
                Autor: 1,
                ApellidoAutor: 1
            }
        }
    ]);

    const totalDocs = await Articulo.countDocuments();

    return {
        articulos: result,
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
        itemPerPage: limit
    };
}

export const leerArticulo = async (id) => {
    const contadorCollection = ContadorArticulo.collection.name;
    
    const result = await Articulo.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(id) } },

        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    { 
                      $project: { 
                        name: 1,
                        surname: 1,
                        image: 1,
                        bio: 1,
                        frasefavorita: 1,
                        nick:1,
                        _id: 1
                      } 
                    }
                ]
            }
        },
        { $unwind: "$author" },

        {
            $lookup: {
                from: "categorias",
                localField: "categoria",
                foreignField: "_id",
                as: "categoria",
                pipeline: [
                    { $project: { name: 1 } }
                ]
            }
        },
        { $unwind: "$categoria" },

        {
            $lookup: {
                from: contadorCollection,
                localField: "_id",
                foreignField: "articuloId",
                as: "contador"
            }
        },

        {
            $addFields: {
                vistas: {
                    $ifNull: [
                        { $arrayElemAt: ["$contador.visto", 0] },
                        0
                    ]
                },
                Autor: "$author.name",
                ApellidoAutor: "$author.surname",
                
            }
        },

        {
            $project: {
                titulo: 1,
                contenido: 1,
                descripcion: 1,
                fecha: 1,
                coverImage: 1,
                categoria: 1,
                vistas: 1,
                Autor: 1,
                ApellidoAutor: 1,
                author: 1
            }
        }
    ]);

    if (!result.length) {
        throw new ServiceError("Artículo no encontrado", 404);
    }

    return { articulo: result[0] };
}

export const listMasVistos = async () => {
    const contadores = await ContadorArticulo.find({})
        .sort({ visto: -1 })
        .limit(3);

    if (!contadores.length) {
        throw new ServiceError("No se han encontrado artículos más vistos", 404);
    }

    const articulosIds = contadores.map(contador => contador.articuloId);
    const articulos = await Articulo.find({ _id: { $in: articulosIds } })
        .select('titulo Autor ApellidoAutor coverImage categoria fecha')
        .populate('categoria');

    return {
        articulos: articulos.map(articulo => {
            const contador = contadores.find(c => c.articuloId.toString() === articulo._id.toString());
            return {
                ...articulo.toObject(),
                vistas: contador ? contador.visto : 0
            };
        }),
    };
}

export const listMisArticulos = async (userId, page) => {
    let itemPerPage = 6;

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { fecha: -1 }
    };

    const articulos = await Articulo.paginate({ userId: userId }, opciones);

    if (!articulos) {
        throw new ServiceError("no se han encontrado articulos", 404);
    }

    return {
        articulos: articulos.docs,
        page: articulos.page,
        totalDocs: articulos.totalDocs,
        totalPages: articulos.totalPages,
        itemPerPage: articulos.limit
    };
}

export const listArticulosPorId = async (userId, page) => {
    const limit = 6;
    const skip = (page - 1) * limit;

    const contadorCollection = ContadorArticulo.collection.name;

    const articulos = await Articulo.aggregate([
        { 
            $match: { 
                userId: new mongoose.Types.ObjectId(userId) 
            } 
        },

        { $sort: { fecha: -1 } },

        { $skip: skip },
        { $limit: limit },

        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "author",
                pipeline: [
                    { 
                      $project: { 
                        name: 1,
                        surname: 1,
                        image: 1,
                        _id: 1
                      } 
                    }
                ]
            }
        },
        { $unwind: "$author" },

        {
            $lookup: {
                from: "categorias",
                localField: "categoria",
                foreignField: "_id",
                as: "categoria",
                pipeline: [
                    { $project: { name: 1 } }
                ]
            }
        },
        { $unwind: { path: "$categoria", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: contadorCollection,
                localField: "_id",
                foreignField: "articuloId",
                as: "contador"
            }
        },

        {
            $addFields: {
                vistas: {
                    $ifNull: [
                        { $arrayElemAt: ["$contador.visto", 0] },
                        0
                    ]
                },
                Autor: "$author.name",
                ApellidoAutor: "$author.surname"
            }
        },

        {
            $project: {
                titulo: 1,
                descripcion: 1,
                fecha: 1,
                coverImage: 1,
                categoria: 1,
                vistas: 1,
                Autor: 1,
                ApellidoAutor: 1
            }
        }
    ]);

    const totalDocs = await Articulo.countDocuments({ userId });

    return {
        articulos,
        page,
        totalDocs,
        totalPages: Math.ceil(totalDocs / limit),
        itemPerPage: limit
    };
}

export const incrementarVisualizaciones = async (id) => {
    const articulo = await Articulo.findById(id);
    if (!articulo) {
        throw new ServiceError('Artículo no encontrado', 404);
    }

    let contador = await ContadorArticulo.findOne({ articuloId: id });

    if (contador) {
        contador.visto += 1;
    } else {
        contador = await ContadorArticulo.create({
            articuloId: id,
            visto: 1
        });
    }

    await contador.save();

    return { vistas: contador.visto };
}
