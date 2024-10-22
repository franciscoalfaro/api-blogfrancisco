import Publication from "../models/articulo.js"
import Like from "../models/like.js"
import NoLike from "../models/nolike.js"
import ContadorLikes from "../models/ContadorLikes.js"



//like
export const likePublication = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const userId = req.user.id; // Suponiendo que recibes el ID del usuario que da like

        // Verificar si el usuario ya dio like a la publicación
        const existingLike = await Like.findOne({ user: userId, liked: publicationId });
        if (existingLike) {
            return res.status(400).json({ status: "error", message: "El usuario ya dio me gusta a esta publicación" });
        }

        // Crear nuevo like
        const newLike = new Like({ liked: publicationId, user: userId });
        await newLike.save();

        //aca guardar en el modelo ContadorLike en like y sumar +1 cuando exista un like
        const contador = await ContadorLikes.findOne({ articuloId: publicationId });

        if (contador) {
            // Si ya existe un contador, simplemente incrementa el número de likes
            contador.like += 1;
            await contador.save();
        } else {
            // Si no existe, crea uno nuevo
            const newContador = new ContadorLikes({ articuloId: publicationId, like: 1 });
            await newContador.save();
        }

        return res.status(200).json({ status: "success", message: "Me gusta agregado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al agregar el me gusta" });
    }
}

//este end-poit guarda los no me gusta
export const unlike = async (req, res) => {
    try {
        const publicationId = req.params.id;
        const userId = req.user.id; // Suponiendo que recibes el ID del usuario que da like

        // Verificar si el usuario ya dio like a la publicación
        const existingLike = await NoLike.findOne({ user: userId, noliked: publicationId });
        if (existingLike) {
            return res.status(400).json({ status: "error", message: "El usuario ya dio no me gusta a esta publicación" });
        }


        // Crear nuevo no me gusta
        const newLike = new NoLike({ noliked: publicationId, user: userId });
        await newLike.save();

        //aca guardar en el modelo ContadorLike en like y sumar +1 cuando exista un like
        const contador = await ContadorLikes.findOne({ articuloId: publicationId });

        if (contador) {
            // Si ya existe un contador, simplemente incrementa el número de likes
            contador.nolike += 1;
            await contador.save();
        } else {
            // Si no existe, crea uno nuevo
            const newContador = new ContadorLikes({ articuloId: publicationId, nolike: 1 });
            await newContador.save();
        }


        return res.status(200).json({ status: "success", message: "no me gusta agregado correctamente" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al agregar no me gusta" });
    }

}


// Eliminar like de una publicación
export const deleteLike = async (req, res) => {
    try {
        const { likeId, noLikeId } = req.body; // Espera que los IDs se envíen en el cuerpo de la solicitud
        const userId = req.user.id;
        console.log(req.body)

        if (!likeId && !noLikeId) {
            return res.status(400).json({
                status: "Error",
                message: "Se debe enviar al menos un ID de like o no like",
            });
        }

        // Buscar y eliminar el like correspondiente al ID proporcionado
        if (likeId) {
            const like = await Like.findOneAndDelete({ _id: likeId, user: userId });
            if (like) {
                // Decrementar el contador de likes
                await ContadorLikes.findOneAndUpdate(
                    { articuloId: like.liked }, // Obtener el ID de la publicación desde el like
                    { $inc: { like: -1 } } // Decrementa el contador de likes
                );
                return res.status(200).json({ status: "success", message: "Like eliminado correctamente" });
            }
        }

        // Buscar y eliminar el noLike correspondiente al ID proporcionado
        if (noLikeId) {
            const noLike = await NoLike.findOneAndDelete({ _id: noLikeId, user: userId });
            if (noLike) {
                // Decrementar el contador de no likes
                await ContadorLikes.findOneAndUpdate(
                    { articuloId: noLike.noliked }, // Obtener el ID de la publicación desde el no like
                    { $inc: { nolike: -1 } } // Decrementa el contador de no likes
                );
                return res.status(200).json({ status: "success", message: "No me gusta eliminado correctamente" });
            }
        }

        return res.status(400).json({ status: "error", message: "El usuario no dio like o no me gusta a esta publicación" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al eliminar el like o no me gusta" });
    }
}


//se mejora end-point para popular informacion del usuario (nombre y apellido)
export const listLikes = async (req, res) => {
    try {
        const publicationId = req.params.id;

        // Obtener el contador de likes y no likes de la publicación
        const contador = await ContadorLikes.findOne({ articuloId: publicationId });

        // Si no existe el contador, establecer valores por defecto
        const likesCount = contador ? contador.like : 0;
        const noLikesCount = contador ? contador.nolike : 0;

        // Obtener los likes y no likes que tiene la publicación
        const likes = await Like.find({ liked: publicationId }).populate('user', 'name surname');
        const noLikes = await NoLike.find({ noliked: publicationId }).populate('user', 'name surname');

        return res.status(200).json({
            status: "success",
            likes,
            noLikes,

            TotalLike: likesCount,
            TotalNoLike: noLikesCount,

        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Error al obtener los likes de la publicación" });
    }
}


//contador para likes
