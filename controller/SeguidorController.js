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
        const { creadorId } = req.params.id; // Obtener el creadorId del cuerpo de la solicitud

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



export const ListarSeguidores = async (req, res) => {
    try {
        const userId = req.user.id;

        // Sanitizar valores de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Consulta paginada de seguidores
        const seguidores = await Seguidores.paginate(
            { creadorId: userId },
            {
                page,
                limit,
                sort: { createdAt: -1 },
                populate: {
                    path: "userId",
                    select: "name surname image nick frasefavorita bio" // solo lo necesario
                }
            }
        );

        return res.status(200).json({
            status: "success",
            message: "Seguidores obtenidos correctamente",
            seguidores: seguidores.docs,
            totalDocs: seguidores.totalDocs,
            totalPages: seguidores.totalPages,
            page: seguidores.page,
            limit: seguidores.limit
        });

    } catch (error) {
        console.error("ListarSeguidores ERROR:", error);
        return res.status(500).json({
            status: "error",
            message: "Error al listar seguidores",
            error: error.message
        });
    }
};


export const ListarSeguidoresPorUsuario = async (req, res) => {
    try {
        const  userId  = req.params.id;

        // Sanitizar paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // 1. Validar ID del usuario consultado
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                status: "error",
                message: "ID de usuario inválido"
            });
        }

        // 2. Buscar seguidores de ese usuario
        const seguidores = await Seguidores.paginate(
            { creadorId: userId }, // Usuarios que siguen a :userId
            {
                page,
                limit,
                sort: { createdAt: -1 },
                populate: {
                    path: "userId", // El usuario que está siguiendo
                    select: "name surname image nick bio frasefavorita"
                }
            }
        );

        return res.status(200).json({
            status: "success",
            message: "Seguidores obtenidos correctamente",
            seguidores: seguidores.docs,
            totalDocs: seguidores.totalDocs,
            totalPages: seguidores.totalPages,
            page: seguidores.page,
            limit: seguidores.limit
        });

    } catch (error) {
        console.error("ListarSeguidoresPorUsuario ERROR:", error);

        return res.status(500).json({
            status: "error",
            message: "Error al listar seguidores",
            error: error.message
        });
    }
};