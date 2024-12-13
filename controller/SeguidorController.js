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
        const userId = req.user.id; // Obtener el userId del usuario autenticado
        const { page = 1, limit = 10 } = req.query; // Paginación con valores predeterminados

        // Listar los seguidores con paginación
        const seguidores = await Seguidores.paginate(
            { creadorId: userId }, // Filtrar los seguidores por creadorId (usuario autenticado)
            { page, limit, populate: 'userId' } // Poblamos el campo `userId` con los datos de usuario
        );

        return res.status(200).json(seguidores);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error al listar seguidores" });
    }
};
