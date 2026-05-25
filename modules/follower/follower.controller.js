import * as followerService from './follower.service.js';

export const AgregarSeguido = async (req, res) => {
    try {
        const result = await followerService.follow(req.user.id, req.params.id);

        if (result.siguiendo && result.message === "Ya sigues a este usuario") {
            return res.status(200).json({ status: "success", message: result.message, siguiendo: true });
        }

        return res.status(201).json({
            status: "success", message: result.message,
            siguiendo: true, seguidor: result.seguidor
        });
    } catch (error) {
        if (error.message.includes("inválido")) {
            return res.status(400).json({ status: "error", message: "ID de usuario inválido" });
        }
        if (error.message.includes("seguirte a ti")) {
            return res.status(400).json({ status: "error", message: "No puedes seguirte a ti mismo" });
        }
        return res.status(500).json({ status: "error", message: "Error al agregar seguidor" });
    }
};

export const DejarSeguir = async (req, res) => {
    try {
        await followerService.unfollow(req.user.id, req.params.id);
        return res.status(200).json({ message: "Seguidor eliminado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al eliminar seguidor" });
    }
};

export const MisSeguidores = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const seguidores = await followerService.getMyFollowers(userId, page, limit);

        return res.status(200).json({
            status: "success", message: "Mis seguidores obtenidos correctamente",
            seguidores: seguidores.docs, totalDocs: seguidores.totalDocs,
            totalPages: seguidores.totalPages, page: seguidores.page, limit: seguidores.limit
        });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al obtener seguidores" });
    }
};

export const SeguidoresDeUsuario = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const seguidores = await followerService.getUserFollowers(req.params.id, page, limit);

        return res.status(200).json({
            status: "success", message: "Seguidores de usuario obtenidos",
            seguidores: seguidores.docs, totalDocs: seguidores.totalDocs,
            totalPages: seguidores.totalPages, page: seguidores.page, limit: seguidores.limit
        });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al listar seguidores" });
    }
};

export const SeguidosDeUsuario = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const seguidos = await followerService.getUserFollowing(req.params.id, page, limit);

        return res.status(200).json({
            status: "success", message: "Seguidos obtenidos correctamente",
            seguidos: seguidos.docs, totalDocs: seguidos.totalDocs,
            totalPages: seguidos.totalPages, page: seguidos.page, limit: seguidos.limit
        });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al listar seguidos" });
    }
};
