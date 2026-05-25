import * as ArticuloService from './article.service.js';
import { auth as checkAuth } from "../../middleware/auth.js";
import { imageUpload, processAndSaveImage, processAndSaveCover } from "../../middleware/upload.js";

import fs from "fs";
import path from "path";

const UPLOAD_DIR = "./uploads/publications";

export const crearArticulo = async (req, res) => {
    try {
        const userId = req.user.id;
        const params = req.body;
        const result = await ArticuloService.crearArticulo(userId, params);
        return res.status(200).json({
            status: "success",
            message: "publicacion guardada de forma correcta",
            newArticulo: result.newArticulo,
        });
    } catch (error) {
        console.error(error);
        const status = error.status || 500;
        return res.status(status).json({
            status: "error",
            message: "Error al crear el artículo"
        });
    }
}

export const eliminarArticulo = async (req, res) => {
    try {
        const articuloId = req.params.id;
        const userId = req.user.id;
        const result = await ArticuloService.eliminarArticulo(articuloId, userId);
        return res.status(200).json({
            status: 'success',
            message: 'Articulo eliminado correctamente',
            articuloEliminado: result.articuloEliminado
        });
    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            status: 'error',
            message: 'Error al eliminar el artículo'
        });
    }
}

export const actualizarArticulo = async (req, res) => {
    try {
        const userId = req.user.id;
        const idArticulo = req.params.id;
        const articuloActualizado = req.body;
        const result = await ArticuloService.actualizarArticulo(idArticulo, userId, articuloActualizado);
        return res.status(200).json({
            status: 'success',
            message: 'Articulo actualizado correctamente',
            articulo: result.articulo
        });
    } catch (error) {
        console.error(error);
        const status = error.status || 500;
        return res.status(status).json({
            status: 'error',
            message: 'Error al actualizar el artículo'
        });
    }
};

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
        if (req.processedFile) {
            const result = await ArticuloService.uploadCover(articuloId, req.user.id, req.processedFile);
            return res.status(200).json({
                status: "success",
                message: "Imagen de portada subida correctamente",
                articulo: result.articulo
            });
        }

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

        const result = await ArticuloService.uploadCover(articuloId, req.user.id, { filename: req.file.filename });

        if (!result) {
            return res.status(404).json({
                status: "error",
                message: "Artículo no encontrado"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Imagen de portada subida correctamente",
            articulo: result.articulo
        });
    } catch (error) {
        console.error(error);
        const status = error.status || 500;
        return res.status(status).json({
            status: "error",
            message: "Error interno del servidor"
        });
    }
};

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
        const result = await ArticuloService.uploadContentImage(req.processedFile);
        return res.status(200).json({
            status: "success",
            message: "Imagen subida correctamente",
            url: result.url,
            filename: result.filename
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor"
        });
    }
};

export const eliminarImagen = async (req, res) => {
    try {
        const articuloId = req.body.articuloId;
        const userId = req.user.id;
        const imagenId = req.params.id;
        const result = await ArticuloService.eliminarImagen(articuloId, userId, imagenId);
        return res.status(200).json({
            status: 'success',
            message: 'Imagen eliminada correctamente',
            imagenes: result.imagenes
        });
    } catch (error) {
        console.error('Error en la eliminación de la imagen:', error);
        const status = error.status || 500;
        return res.status(status).json({
            status: 'error',
            message: 'Error al eliminar la imagen'
        });
    }
}

export const media = (req, res) => {
    const file = req.params.file;

    if (file.includes('..') || file.includes('/')) {
        return res.status(400).json({ status: "error", message: "Nombre de archivo inválido" });
    }

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

export const buscador = async (req, res) => {
    try {
        let busqueda = req.params.articulo?.trim() || "";
        let page = parseInt(req.params.page) || 1;

        const result = await ArticuloService.buscador(busqueda, page);

        return res.status(200).json({
            status: "success",
            message: "Búsqueda completada",
            resultados: result.resultados,
            page: result.page,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            itemPerPage: result.itemPerPage
        });

    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            status: "error",
            message: "Error al realizar la búsqueda"
        });
    }
};

export const listArticulos = async (req, res) => {
    const page = req.params.page ? parseInt(req.params.page) : 1;

    try {
        const result = await ArticuloService.listArticulos(page);

        return res.status(200).json({
            status: "success",
            articulos: result.articulos,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            itemPerPage: result.itemPerPage
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al listar artículos"
        });
    }
};

export const leerArticulo = async (req, res) => {
    try {
        const idArticulo = req.params.id;
        const result = await ArticuloService.leerArticulo(idArticulo);

        return res.status(200).json({
            status: "success",
            articulo: result.articulo
        });

    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            status: "error",
            mensaje: "Error al buscar el artículo"
        });
    }
};

export const listMasVistos = async (req, res) => {
    try {
        const result = await ArticuloService.listMasVistos();

        return res.status(200).send({
            status: "success",
            message: "Últimos artículos más vistos encontrados",
            articulos: result.articulos,
        });

    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            status: 'error',
            message: 'Error al listar los últimos artículos más vistos'
        });
    }
}

export const listMisArticulos = async (req, res) => {
    const userId = req.user.id;

    let page = 1
    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    try {
        const result = await ArticuloService.listMisArticulos(userId, page);

        return res.status(200).send({
            status: "success",
            message: "articulos encontrados",
            articulos: result.articulos,
            page: result.page,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            itemPerPage: result.itemPerPage
        })

    } catch (error) {
        const status = error.status || 500;
        return res.status(status).json({
            status: 'error',
            message: 'Error al listar los articulos'
        });
    }
}

export const listArticulosPorId = async (req, res) => {
    const userId = req.params.id;
    const page = req.params.page ? parseInt(req.params.page) : 1;

    try {
        const result = await ArticuloService.listArticulosPorId(userId, page);

        return res.status(200).json({
            status: "success",
            articulos: result.articulos,
            page: result.page,
            totalDocs: result.totalDocs,
            totalPages: result.totalPages,
            itemPerPage: result.itemPerPage
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al listar los artículos"
        });
    }
};

export const incrementarVisualizaciones = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await ArticuloService.incrementarVisualizaciones(id);

        return res.status(200).json({
            mensaje: 'Visualización incrementada',
            vistas: result.vistas
        });
    } catch (error) {
        console.error('Error al incrementar las visualizaciones:', error);
        const status = error.status || 500;
        return res.status(status).json({ mensaje: 'Error del servidor' });
    }
};
