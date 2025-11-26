import User from "../models/user.js"
import fs from "fs"
import path from "path"
import Seguidores from "../models/seguidores.js"
import mongoose from "mongoose";

export const AgregarSeguido = async (req, res) => {
    try {
        const userId = req.user.id;
        const creadorId = req.params.id;

        console.log(creadorId)
        // 1. Validar IDs
        if (!mongoose.Types.ObjectId.isValid(creadorId)) {
            return res.status(400).json({
                status: "error",
                message: "ID de usuario inválido"
            });
        }

        // 2. Evitar que un usuario se siga a sí mismo
        if (userId === creadorId) {
            return res.status(400).json({
                status: "error",
                message: "No puedes seguirte a ti mismo"
            });
        }

        // 3. Verificar si ya lo sigue
        const existe = await Seguidores.findOne({ userId, creadorId });

        if (existe) {
            return res.status(200).json({
                status: "success",
                message: "Ya sigues a este usuario",
                siguiendo: true
            });
        }

        // 4. Crear nueva relación de seguimiento
        const nuevoSeguidor = await Seguidores.create({ userId, creadorId });

        return res.status(201).json({
            status: "success",
            message: "Ahora sigues a este usuario",
            siguiendo: true,
            seguidor: nuevoSeguidor
        });

    } catch (error) {
        console.error("AgregarSeguido Error:", error);
        return res.status(500).json({
            status: "error",
            message: "Error al agregar seguidor",
            error: error.message
        });
    }
};


export const DejarSeguir = async (req, res) => {
    try {
        const userId = req.user.id; // Obtener el userId del usuario autenticado
        const creadorId  = req.params.id; // Obtener el creadorId del cuerpo de la solicitud
        // Verificar que el creadorId esté presente
        if (!creadorId) {
            return res.status(400).json({ message: "creadorId es requerido" });
        }

        // Buscar y eliminar el seguidor
        const seguidorEliminado = await Seguidores.findOneAndDelete({
            userId,
            creadorId
        });

        if (!seguidorEliminado) {
            return res.status(404).json({ message: "No se encontró el seguidor" });
        }

        return res.status(200).json({ message: "Seguidor eliminado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al eliminar seguidor" });
    }
};



export const MisSeguidores = async (req, res) => {
    try {
        const userId = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const seguidores = await Seguidores.paginate(
            { creadorId: userId }, // Ellos te siguen a ti
            {
                page,
                limit,
                sort: { createdAt: -1 },
                populate: {
                    path: "userId", // El seguidor
                    select: "name surname image nick bio frasefavorita"
                }
            }
        );

        return res.status(200).json({
            status: "success",
            message: "Mis seguidores obtenidos correctamente",
            seguidores: seguidores.docs,
            totalDocs: seguidores.totalDocs,
            totalPages: seguidores.totalPages,
            page: seguidores.page,
            limit: seguidores.limit
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al obtener seguidores"
        });
    }
};

export const SeguidoresDeUsuario = async (req, res) => {
    try {
        const userId = req.params.id;

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: "error",
                message: "ID inválido"
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const seguidores = await Seguidores.paginate(
            { creadorId: userId }, // Ellos siguen al usuario X
            {
                page,
                limit,
                sort: { createdAt: -1 },
                populate: {
                    path: "userId",
                    select: "name surname image nick bio frasefavorita"
                }
            }
        );

        return res.status(200).json({
            status: "success",
            message: "Seguidores de usuario obtenidos",
            seguidores: seguidores.docs,
            totalDocs: seguidores.totalDocs,
            totalPages: seguidores.totalPages,
            page: seguidores.page,
            limit: seguidores.limit
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al listar seguidores"
        });
    }
};

export const SeguidosDeUsuario = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: "error",
                message: "ID inválido"
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const seguidos = await Seguidores.paginate(
            { userId: userId }, // El usuario X sigue a otros
            {
                page,
                limit,
                sort: { createdAt: -1 },
                populate: {
                    path: "creadorId", // El creador que es seguido
                    select: "name surname image nick bio frasefavorita"
                }
            }
        );

        return res.status(200).json({
            status: "success",
            message: "Seguidos obtenidos correctamente",
            seguidos: seguidos.docs,
            totalDocs: seguidos.totalDocs,
            totalPages: seguidos.totalPages,
            page: seguidos.page,
            limit: seguidos.limit
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al listar seguidos"
        });
    }
};

