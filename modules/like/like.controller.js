import * as likeService from './like.service.js';

export const likePublication = async (req, res) => {
    try {
        await likeService.likePublication(req.params.id, req.user.id);
        return res.status(200).json({ status: "success", message: "Me gusta agregado correctamente" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al agregar el me gusta" });
    }
};

export const unlike = async (req, res) => {
    try {
        await likeService.unlike(req.params.id, req.user.id);
        return res.status(200).json({ status: "success", message: "no me gusta agregado correctamente" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al agregar no me gusta" });
    }
};

export const deleteLike = async (req, res) => {
    try {
        const { likeId, noLikeId } = req.body;
        const userId = req.user.id;

        if (!likeId && !noLikeId) {
            return res.status(400).json({ status: "Error", message: "Se debe enviar al menos un ID de like o no like" });
        }

        const result = await likeService.deleteLike(likeId, noLikeId, userId);
        return res.status(200).json({ status: "success", message: result.type === 'like' ? "Like eliminado correctamente" : "No me gusta eliminado correctamente" });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al eliminar el like o no me gusta" });
    }
};

export const listLikes = async (req, res) => {
    try {
        const result = await likeService.listLikes(req.params.id);
        return res.status(200).json({ status: "success", ...result });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error al obtener los likes de la publicación" });
    }
};
