//importar modulos
import fs from "fs"
import path from "path"
import mongoosePagination from 'mongoose-paginate-v2'

import Articulo from "../models/articulo.js"
import Comentario from "../models/comentario.js"

export const comment = async (req, res) => {
    try {
        const params = req.body;
        const articuloId = req.params.id
        console.log(req.user.id)


        if (!params.text) {
            return res.status(400).send({
                status: "error",
                message: "Debes enviar el texto del comentario"
            });
        }

        //se crea el nuevo objeto para ser guardado en la BD el cual tiene el id de la publicacion el usuario que comento y el comentario

        const newComment = new Comentario({
            comentario: params.text,
            articulo: articuloId,
            userId: req.user.id
        });
        console.log(newComment)

        //guardar comentario 
        const commentStored = await newComment.save();

        // Devolver el resultado
        return res.status(200).json({
            status: "success",
            message: "Comentario guardado de forma correcta",
            commentStored
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: "error", message: "Error al guardar el comentario" });
    }
}

//eliminar comentario comentDelete comentario: comentDelete
export const removeComment = async (req, res) => {
    try {
        //obtener id de la publicacion
        const commentsId = req.params.id;
        const userId = req.user.id;


        //buscar la publicacion comparando el id del usuario con el id de la publicacion y borrarlo
        //otra forma de buscar y elminar comentario
        //const comentario = await Comentario.findByIdAndDelete({ _id: commentsId, user: userId });

        const comentario = await Comentario.findByIdAndDelete({ "_id": commentsId })

        //si no existe el comentario se responde un 404
        if (!comentario) {
            return res.status(404).json({
                status: "error",
                message: "el comentario no existe para eliminar",
            });

        }
        //si comentario existe se elimina. 
        return res.status(200).json({
            status: "success",
            message: "el comentario ha sido eliminado",
            comentario
        });


    } catch (error) {
        return res.status(500).send({ status: "error", message: "error al eliminar comentario  o no existe" })
    }


}

//listar comentarios
export const listCommen = async (req, res) => {

    try {
        const publicationId = req.params.id;

        let page = 1;
        if (req.params.page) {
            page = req.params.page;
        }
        const itemsPerPage = 3;

        const options = {
            page,
            limit: itemsPerPage,
            sort: { create_at: -1 },
            populate: {
                path: 'userId',
                select: '-password -role -__v -email -create_at'
            }
        };
        const comments = await Comentario.paginate({ articulo: publicationId }, options);
        console.log(comments)
        if (!comments.docs || comments.docs.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No existen comentarios para esta publicación"
            });
        }



        return res.status(200).json({
            status: "success",
            message: "Listado de comentarios",
            comments: comments.docs,
            totalDocs: comments.totalDocs,
            totalPages: comments.totalPages,
            page: comments.page
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: "error", message: "Error al obtener información del servidor" });

    }

}