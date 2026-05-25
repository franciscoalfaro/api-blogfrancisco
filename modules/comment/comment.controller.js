import * as commentService from './comment.service.js';

export const comment = async (req, res) => {
    try {
        const params = req.body;
        const articuloId = req.params.id;

        if (!params.text) {
            return res.status(400).send({ status: "error", message: "Debes enviar el texto del comentario" });
        }

        const commentStored = await commentService.create(params.text, articuloId, req.user.id);

        return res.status(200).json({ status: "success", message: "Comentario guardado de forma correcta", commentStored });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "Error al guardar el comentario" });
    }
};

export const removeComment = async (req, res) => {
    try {
        const commentsId = req.params.id;
        const userId = req.user.id;

        const comentario = await commentService.remove(commentsId, userId);

        return res.status(200).json({ status: "success", message: "el comentario ha sido eliminado", comentario });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "error al eliminar comentario o no existe" });
    }
};

export const listCommen = async (req, res) => {
    try {
        const publicationId = req.params.id;
        let page = 1;
        if (req.params.page) page = req.params.page;

        const comments = await commentService.list(publicationId, page);

        return res.status(200).json({
            status: "success", message: "Listado de comentarios",
            comments: comments.docs, totalDocs: comments.totalDocs,
            totalPages: comments.totalPages, page: comments.page
        });
    } catch (error) {
        if (error.message.includes("No existen comentarios")) {
            return res.status(404).json({ status: "error", message: "No existen comentarios para esta publicación" });
        }
        return res.status(500).send({ status: "error", message: "Error al obtener información del servidor" });
    }
};
