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
            const categoriaDB = await Categoria.findOne({ name: articuloActualizado.categoria });

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
    // Sacar el ID del artículo
    const articuloId = req.params.id;

    // Recoger el archivo de imagen
    const file = req.file;
  
    // Verificar si se proporcionó la imagen
    if (!file) {
        return res.status(404).send({
            status: "error",
            message: "Imagen no seleccionada"
        });
    }

    try {
        // Conseguir el nombre del archivo
        const image = file.originalname;

        // Obtener extensión del archivo
        const imageSplit = image.split(".");
        const extension = imageSplit[imageSplit.length - 1].toLowerCase();

        // Comprobar extensión
        if (extension !== "png" && extension !== "jpg" && extension !== "jpeg" && extension !== "gif") {
            // Borrar archivo si la extensión no es válida
            const filePath = file.path;
            fs.unlinkSync(filePath);

            return res.status(400).json({
                status: "error",
                message: "Extensión no válida"
            });
        }

        // Actualizar el artículo con la imagen de portada
        const articulo = await Articulo.findOneAndUpdate(
            { _id: articuloId, userId: req.user.id },
            { coverImage: req.file.filename},  // Guardar la ruta de la imagen de portada
            { new: true }
        );

        if (!articulo) {
            return res.status(404).json({
                status: "error",
                message: "Artículo no encontrado"
            });
        }

        // Responder con éxito y la información del artículo actualizado
        return res.status(200).json({
            status: "success",
            message: "Imagen de portada subida correctamente",
            articulo: articulo
        });
    } catch (error) {
        // Manejo de errores
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

    try {
        fs.stat(filePath, (error, exist) => {
            if (!exist) {
                return res.status(404).send({
                    status: "error",
                    message: "La imagen no existe"
                });
            }

            // Configurar las cabeceras de caché
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

            // Devolver el archivo si existe
            return res.sendFile(path.resolve(filePath));
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener la información en el servidor"
        });
    }
};


//end-point para buscar articulos
export const buscador = async (req, res) => {
    try {
        let busqueda = req.params.articulo;
        busqueda = busqueda.replace(/\+/g, ' ');

        let page = 1;
        if (req.params.page) {
            page = req.params.page;
        }
        page = parseInt(page);

        let itemPerPage = 4;

        const options = {
            page,
            limit: itemPerPage,
            sort: { fecha: -1 },
            select: '-password', // Selecciona los campos que necesitas
            populate: [] // Populación adicional si es necesario
        };

        // Realiza la búsqueda de artículos con expresiones regulares insensibles a mayúsculas y minúsculas
        const resultados = await Articulo.paginate({
            $or: [
                { "titulo": { $regex: busqueda, $options: "i" } },
                { "descripcion": { $regex: busqueda, $options: "i" } },
                { "contenido": { $regex: busqueda, $options: "i" } },
                { "Autor": { $regex: busqueda, $options: "i" } },
            ]
        }, options);

        if (!resultados.docs.length) {
            return res.status(404).json({
                status: "error",
                message: "No se encontraron artículos para la búsqueda"
            });
        }

        // Para cada artículo encontrado, obtener su contador de visualizaciones
        const articulosConContador = await Promise.all(resultados.docs.map(async articulo => {
            const contador = await ContadorArticulo.findOne({ articuloId: articulo._id });
            return {
                ...articulo.toObject(), // Convierte el artículo en objeto plano
                vistas: contador ? contador.visto : 0 // Agrega el contador de vistas si existe
            };
        }));

        return res.status(200).json({
            status: "success",
            message: "Búsqueda completada",
            resultados: articulosConContador,
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
