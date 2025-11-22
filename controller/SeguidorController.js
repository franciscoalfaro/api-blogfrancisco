import User from "../models/user.js"
import fs from "fs"
import path from "path"
import Seguidores from "../models/seguidores.js"

export const AgregarSeguido = async (req, res) => {
    try {
        const userId = req.user.id; // Obtener el userId del usuario autenticado
        const creadorId  = req.params.id;

        // Verificar que el creadorId sea válido
        if (!creadorId) {
            return res.status(400).json({ message: "creadorId es requerido" });
        }

        // Crear un nuevo seguidor
        const nuevoSeguidor = new Seguidores({
            userId,
            creadorId
        });

        // Guardar el seguidor en la base de datos
        await nuevoSeguidor.save();

        return res.status(201).json({ message: "Seguidor agregado con éxito", nuevoSeguidor });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al agregar seguidor" });
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
