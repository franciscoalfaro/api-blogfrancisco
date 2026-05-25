import sanitizeHtml from 'sanitize-html';
import Comentario from './comment.model.js';

export const create = async (text, articuloId, userId) => {
    const sanitizedText = sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });

    const newComment = new Comentario({
        comentario: sanitizedText,
        articulo: articuloId,
        userId
    });
    const commentStored = await newComment.save();
    return commentStored;
};

export const remove = async (commentsId, userId) => {
    const comentario = await Comentario.findOneAndDelete({ _id: commentsId, userId });
    if (!comentario) {
        throw new Error("el comentario no existe para eliminar");
    }
    return comentario;
};

export const list = async (publicationId, page) => {
    const itemsPerPage = 3;
    const options = {
        page,
        limit: itemsPerPage,
        sort: { create_at: -1 },
        populate: { path: 'userId', select: '-password -role -__v -email -create_at' }
    };
    const comments = await Comentario.paginate({ articulo: publicationId }, options);

    if (!comments.docs || comments.docs.length === 0) {
        throw new Error("No existen comentarios para esta publicación");
    }
    return comments;
};
