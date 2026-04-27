import fs from "fs"
import path from "path"
import * as validarArt from '../helpers/validateArticulo.js';
import Articulo from "../models/articulo.js"
import Categoria from "../models/categoria.js"
import mongoosePagination from 'mongoose-paginate-v2'
import User from "../models/user.js"
import Seguidor from "../models/seguidores.js"
import ContadorArticulo from "../models/ContadorArticulos.js"
import sanitizerService from '../services/sanitizarContenido.js';
import InformacionService from '../services/EmailService.js';
import mongoose from "mongoose";

const UPLOAD_DIR = "./uploads/publications";



//end-point para crear articulos
export const crearArticulo = async (req, res) => {
    const params = req.body;
    console.log(params)
    if (!params.titulo || !params.descripcion || !params.contenido || !params.categoria) {
        return res.status(400).json({
            status: "Error",
            message: "Faltan datos por enviar",
        });
    }

    try {
        const userId = req.user.id;
        //se comprueba desde helpers-validate
        validarArt.validar(params)

        let categoriaExistente = await Categoria.findOne({ userId, name: params.categoria });

        //se busca el usuario por el id, y se extre el nombre y apellido para mostrar en la respuesta
        let usuarioPublicacion = await User.findOne({ _id: userId })


        if (!categoriaExistente) {
            categoriaExistente = await Categoria.create({ userId, name: params.categoria });
        }

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
        
        // Enviar correo informativo a cada seguidor
        for (let seguidor of seguidores) {
            const { name, email } = seguidor.userId;
    

            // Llamar al servicio de correo para enviar el correo informativo
            await InformacionService.enviarCorreoInformativo(name, email, newArticulo);
        }

        return res.status(200).json({
            status: "success",
            message: "publicacion guardada de forma correcta",
            newArticulo,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Error al crear el artículo",
            error: error.message || "Error desconocido",
        });
    }
}

//end-point para eliminar articulos
export const eliminarArticulo = async (req, res) => {
    try {
        const articuloId = req.params.id;
        const userId = req.user.id;

        // Buscar el artículo y verificar si el usuario logueado es el creador
        const articuloEliminar = await Articulo.findOne({ _id: articuloId, userId: userId });

        if (!articuloEliminar) {
            return res.status(404).json({
                status: 'error',
                message: 'Articulo no encontrado o no tiene permisos para eliminarlo'
            });
        }

        // Verificar si el usuario logueado es el creador del artículo
        if (articuloEliminar.userId.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para eliminar este artículo'
            });
        }

        // Borrar imagen de portada si existe y no es la default
        if (articuloEliminar.coverImage && articuloEliminar.coverImage !== 'default.png') {
            const coverPath = path.join(UPLOAD_DIR, articuloEliminar.coverImage);
            if (fs.existsSync(coverPath)) {
                fs.unlinkSync(coverPath);
            }
        }

        // Borrar imágenes del contenido
        if (articuloEliminar.imagenes && articuloEliminar.imagenes.length > 0) {
            for (const img of articuloEliminar.imagenes) {
                const imgPath = path.join(UPLOAD_DIR, img.filename);
                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            }
        }

        await Articulo.findByIdAndDelete(articuloId);

        return res.status(200).json({
            status: 'success',
            message: 'Articulo eliminado correctamente',
            articuloEliminado: articuloEliminar
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar el artículo',
            error: error.message
        });
    }
}


//end-point para modificar articulos
export const actualizarArticulo = async (req, res) => {
    try {
        const userId = req.user.id;
        const idArticulo = req.params.id;
        const articuloActualizado = req.body;
        console.log(articuloActualizado)

        // Buscar artículo
        const articuloExistente = await Articulo.findById(idArticulo);
        if (!articuloExistente) {
            return res.status(404).json({
                status: 'error',
                message: 'Articulo no fue encontrado'
            });
        }

        // Validar propietario
        if (articuloExistente.userId.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'No tiene permisos para modificar este artículo'
            });
        }

        // -------------------------------------------------------
        // 🔍 VALIDACIÓN DE CATEGORÍA POR NOMBRE (si viene en el body)
        // -------------------------------------------------------
        if (articuloActualizado.categoria) {
            const categoriaDB = await Categoria.findOne({ id: articuloActualizado.id });

            if (!categoriaDB) {
                return res.status(400).json({
                    status: 'error',
                    message: 'La categoría no existe'
                });
            }

            // reemplazar texto por id real
            articuloActualizado.categoria = categoriaDB._id;
        }

        // -------------------------------------------------------

        // Actualizar artículo
        const articuloModificado = await Articulo.findByIdAndUpdate(
            idArticulo,
            articuloActualizado,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            status: 'success',
            message: 'Articulo actualizado correctamente',
            articulo: articuloModificado
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al actualizar el artículo',
            error: error.message
        });
    }
};


//end-point para subir 1 imagen que sera la portada del articulo
export const upload = async (req, res) => {
    const articuloId = req.params.id;
    const file = req.file;

    if (!file) {
        return res.status(404).send({
            status: "error",
            message: "Imagen no seleccionada"
        });
    }

    try {
        // Si el archivo ya fue procesado por el middleware (nuevo flujo con Sharp)
        if (req.processedFile) {
            // Buscar artículo anterior para borrar imagen old
            const oldArticulo = await Articulo.findById(articuloId);
            if (oldArticulo && oldArticulo.coverImage && oldArticulo.coverImage !== 'default.png') {
                const oldPath = path.join(UPLOAD_DIR, oldArticulo.coverImage);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            const articulo = await Articulo.findOneAndUpdate(
                { _id: articuloId, userId: req.user.id },
                { coverImage: req.processedFile.filename },
                { new: true }
            );

            if (!articulo) {
                return res.status(404).json({
                    status: "error",
                    message: "Artículo no encontrado"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Imagen de portada subida correctamente",
                articulo: articulo
            });
        }

        // Old flow (sin middleware) - mantener compatibilidad
        const image = file.originalname;
        const imageSplit = image.split(".");
        const extension = imageSplit[imageSplit.length - 1].toLowerCase();

        if (extension !== "png" && extension !== "jpg" && extension !== "jpeg" && extension !== "gif") {
            const filePath = file.path;
            fs.unlinkSync(filePath);

            return res.status(400).json({
                status: "error",
                message: "Extensión no válida"
            });
        }

        const articulo = await Articulo.findOneAndUpdate(
            { _id: articuloId, userId: req.user.id },
            { coverImage: req.file.filename},
            { new: true }
        );

        if (!articulo) {
            return res.status(404).json({
                status: "error",
                message: "Artículo no encontrado"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Imagen de portada subida correctamente",
            articulo: articulo
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor"
        });
    }
};

// Controlador para subir imagenes del contenido (TinyMCE)
export const uploadContentImage = async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({
            status: "error",
            message: "Imagen no seleccionada"
        });
    }

    if (!req.processedFile) {
        return res.status(500).json({
            status: "error",
            message: "Error al procesar la imagen"
        });
    }

    try {
        return res.status(200).json({
            status: "success",
            message: "Imagen subida correctamente",
            url: req.processedFile.url,
            filename: req.processedFile.filename
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor"
        });
    }
};

// Controlador para eliminar una imagen
export const eliminarImagen = async (req, res) => {
    try {
        const articuloId = req.body.articuloId; // Obtener el ID del proyecto desde el cuerpo de la solicitud
        const userId = req.user.id; // Obtener el ID del usuario autenticado
        const imagenId = req.params.id; // Extraer el ID de la imagen desde los parámetros de la solicitud

        // Buscar el proyecto que contiene la imagen
        const articulo = await Articulo.findOne({ _id: articuloId, userId: userId });

        if (!articulo) {
            return res.status(404).json({
                status: 'error',
                message: 'articulo no encontrado o no pertenece al usuario'
            });
        }

        // Buscar la imagen a eliminar dentro del articulo
        const imagen = articulo.images.find(img => img._id.toString() === imagenId);
        if (!imagen) {
            return res.status(404).json({
                status: 'error',
                message: 'Imagen no encontrada en el articulo'
            });
        }

        // Construir la ruta absoluta del archivo a eliminar
        const filePath = path.resolve('./uploads/publications/', imagen.filename);

        try {
            // Verificar si el archivo existe antes de intentar eliminarlo
            await is.access(filePath); // Verifica si el archivo existe

            // Eliminar el archivo del sistema de archivos
            await is.unlink(filePath);
        } catch (err) {
            console.error('Error eliminando el archivo físico:', err);
            return res.status(500).json({
                status: 'error',
                message: 'No se pudo eliminar el archivo físico de la imagen',
                error: err.message
            });
        }

        // Eliminar la imagen del array de imágenes en el proyecto
        await Articulo.updateOne(
            { _id: articuloId, userId: userId },
            { $pull: { images: { _id: imagenId } } }
        );

        // Filtrar las imágenes restantes después de la eliminación
        const imagenesRestantes = proyecto.images.filter(img => img._id.toString() !== imagenId);

        return res.status(200).json({
            status: 'success',
            message: 'Imagen eliminada correctamente',
            imagenes: imagenesRestantes // Devuelve las imágenes restantes
        });

    } catch (error) {
        console.error('Error en la eliminación de la imagen:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error al eliminar la imagen',
            error: error.message
        });
    }
}


//devolver archivos multimedia
export const media = (req, res) => {
    const file = req.params.file;
    const filePath = "./uploads/publications/" + file;

    const ext = file.split('.').pop()?.toLowerCase();
    const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    try {
        fs.stat(filePath, (error, exist) => {
            if (!exist) {
                return res.status(404).send({
                    status: "error",
                    message: "La imagen no existe"
                });
            }

            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000');

            return res.sendFile(path.resolve(filePath));
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener la información en el servidor"
        });
    }
};


// Endpoint: Buscar artículos
export const buscador = async (req, res) => {
    try {
        // Sanitización básica
        let busqueda = req.params.articulo?.trim() || "";

        if (busqueda.length < 2) {
            return res.status(400).json({
                status: "error",
                message: "La búsqueda debe contener al menos 2 caracteres."
            });
        }

        // Reemplazar "+" por espacios
        busqueda = busqueda.replace(/\+/g, " ");

        // Evitar regex peligrosas
        const safeRegex = busqueda.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Paginación
        let page = parseInt(req.params.page) || 1;
        let itemPerPage = 4;

        const options = {
            page,
            limit: itemPerPage,
            sort: { fecha: -1 },
            select: "-password",
            populate: [],
            lean: true, // 🔥 Responde más ligero, sin doc instances de Mongoose
        };

        // Query de búsqueda
        const query = {
            $or: [
                { titulo:      { $regex: safeRegex, $options: "i" } },
                { descripcion: { $regex: safeRegex, $options: "i" } },
                { contenido:   { $regex: safeRegex, $options: "i" } },
                { Autor:       { $regex: safeRegex, $options: "i" } },
            ],
        };

        const resultados = await Articulo.paginate(query, options);

        // Si no hay artículos
        if (!resultados.docs.length) {
            return res.status(404).json({
                status: "error",
                message: "No se encontraron artículos relacionados con tu búsqueda."
            });
        }

        // Agregar contador de vistas a cada artículo
        const articulosFinal = await Promise.all(
            resultados.docs.map(async (art) => {
                const contador = await ContadorArticulo.findOne({ articuloId: art._id }).lean();
                return {
                    ...art,
                    vistas: contador?.visto || 0,
                };
            })
        );

        return res.status(200).json({
            status: "success",
            message: "Búsqueda completada",
            resultados: articulosFinal,
            page: resultados.page,
            totalDocs: resultados.totalDocs,
            totalPages: resultados.totalPages,
            itemPerPage: resultados.limit
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al realizar la búsqueda",
            error: error.message
        });
    }
};



//end-point para listar todos los articulos
export const listArticulos = async (req, res) => {
    const page = req.params.page ? parseInt(req.params.page) : 1;
    const limit = 4;
    const skip = (page - 1) * limit;

    try {
        const contadorCollection = ContadorArticulo.collection.name; 
        console.log("Colección contador:", contadorCollection);

        const result = await Articulo.aggregate([
            { $sort: { fecha: -1 } },
            { $skip: skip },
            { $limit: limit },

            // Autor
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

            // CONTADOR → USANDO EL NOMBRE REAL DE LA COLECCIÓN
            {
                $lookup: {
                    from: contadorCollection,  // ← AQUÍ USAMOS LA COLECCIÓN REAL
                    localField: "_id",
                    foreignField: "articuloId",
                    as: "contador"
                }
            },

            // Agregar campo vistas
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

            // Campos finales
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

        return res.status(200).json({
            status: "success",
            articulos: result,
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
            itemPerPage: limit
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al listar artículos",
            error: error.message
        });
    }
};


//end-point para mostrar 1 articulo - para mostrar o traer 1 articulo cuando se haga clic en leer desde el front
export const leerArticulo = async (req, res) => {
    try {
        const idArticulo = req.params.id;
        
        const contadorCollection = ContadorArticulo.collection.name;
        
        const result = await Articulo.aggregate([
            // Solo el artículo que buscamos
            { $match: { _id: new mongoose.Types.ObjectId(idArticulo) } },

            // Autor del artículo sin datos sensibles
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

            // Categoría del artículo
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

            // Vistas del contador
            {
                $lookup: {
                    from: contadorCollection,
                    localField: "_id",
                    foreignField: "articuloId",
                    as: "contador"
                }
            },

            // Agregar campos calculados
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

            // Proyección final (solo lo que se enviará al frontend)
            {
                $project: {
                    titulo: 1,
                    contenido: 1,
                    descripcion: 1,
                    fecha: 1,
                    coverImage: 1,
                    categoria: 1,

                    // campos calculados
                    vistas: 1,
                    Autor: 1,
                    ApellidoAutor: 1,
                    

                    // para sidebar/author card
                    author: 1
                }
            }
        ]);

        if (!result.length) {
            return res.status(404).json({
                status: "error",
                mensaje: "Artículo no encontrado"
            });
        }

        return res.status(200).json({
            status: "success",
            articulo: result[0]
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            mensaje: "Error al buscar el artículo",
            error: error.message
        });
    }
};



//listar articulos mas vistos
export const listMasVistos = async (req, res) => {
    try {
        // Obtener los contadores de visualización, ordenados por vistas y limitando a 3
        const contadores = await ContadorArticulo.find({})
            .sort({ visto: -1 }) // Ordenar por el número de visualizaciones
            .limit(3)// Limitar a los 3 más vistos

        if (!contadores.length) {
            return res.status(404).json({
                status: "error",
                message: "No se han encontrado artículos más vistos"
            });
        }

        // Obtener los IDs de los artículos correspondientes a los contadores
        const articulosIds = contadores.map(contador => contador.articuloId);
        const articulos = await Articulo.find({ _id: { $in: articulosIds } }).populate('categoria');

        return res.status(200).send({
            status: "success",
            message: "Últimos artículos más vistos encontrados",
            articulos: articulos.map(articulo => {
                const contador = contadores.find(c => c.articuloId.toString() === articulo._id.toString());
                return {
                    ...articulo.toObject(), // Convertir a objeto plano
                    vistas: contador ? contador.visto : 0 // Incluir el número de vistas
                };
            }),
        });

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los últimos artículos más vistos',
            error: error.message,
        });
    }
}


//end-point para listar los articulos del usuario logueado
export const listMisArticulos = async (req, res) => {
    const userId = req.user.id;

    let page = 1
    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    let itemPerPage = 6

    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { fecha: -1 }
    }

    try {


        const articulos = await Articulo.paginate({ userId: userId }, opciones);

        if (!articulos) return res.status(404).json({
            status: "error",
            message: "no se han encontrado articulos"
        })

        return res.status(200).send({
            status: "success",
            message: "articulos encontrados",
            articulos: articulos.docs,

            page: articulos.page,
            totalDocs: articulos.totalDocs,
            totalPages: articulos.totalPages,
            itemPerPage: articulos.limit
        })

    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al listar los articulos',
            error: error.message,
        });

    }
}

//end-point para buscar todas las publicaciones por un Id de usuario
export const listArticulosPorId = async (req, res) => {
    const userId = req.params.id;

    const page = req.params.page ? parseInt(req.params.page) : 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    try {
        const contadorCollection = ContadorArticulo.collection.name;

        const articulos = await Articulo.aggregate([
            // Filtrar solo artículos del usuario
            { 
                $match: { 
                    userId: new mongoose.Types.ObjectId(userId) 
                } 
            },

            // Orden
            { $sort: { fecha: -1 } },

            // Paginación
            { $skip: skip },
            { $limit: limit },

            // Autor del artículo
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

            // Categoría
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

            // Contador de vistas
            {
                $lookup: {
                    from: contadorCollection,
                    localField: "_id",
                    foreignField: "articuloId",
                    as: "contador"
                }
            },

            // Campos calculados
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

            // Proyección final
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

        // Total de artículos del usuario
        const totalDocs = await Articulo.countDocuments({ userId });

        return res.status(200).json({
            status: "success",
            articulos,
            page,
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
            itemPerPage: limit
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al listar los artículos",
            error: error.message
        });
    }
};


//generador de contador de cuantas veces es vistio un articulo
export const incrementarVisualizaciones = async (req, res) => {
    const { id } = req.params;

    try {
        // Verifica si el artículo existe
        const articulo = await Articulo.findById(id);
        if (!articulo) {
            return res.status(404).json({ mensaje: 'Artículo no encontrado' });
        }

        // Busca el contador asociado al artículo
        let contador = await ContadorArticulo.findOne({ articuloId: id });

        if (contador) {
            // Si existe el contador, incrementa el valor de las visualizaciones
            contador.visto += 1;
        } else {
            // Si no existe el contador, créalo con valor inicial de 1
            contador = await ContadorArticulo.create({
                articuloId: id,
                visto: 1
            });
        }

        // Guarda el contador actualizado
        await contador.save();

        // Retorna el valor actualizado del contador
        return res.status(200).json({
            mensaje: 'Visualización incrementada',
            vistas: contador.visto
        });
    } catch (error) {
        console.error('Error al incrementar las visualizaciones:', error);
        return res.status(500).json({ mensaje: 'Error del servidor' });
    }
};
