import { Like, NoLike, ContadorLikes } from './like.model.js';

export const likePublication = async (publicationId, userId) => {
    const existingLike = await Like.findOne({ user: userId, liked: publicationId });
    if (existingLike) {
        throw new Error("El usuario ya dio me gusta a esta publicación");
    }

    const newLike = new Like({ liked: publicationId, user: userId });
    await newLike.save();

    const contador = await ContadorLikes.findOne({ articuloId: publicationId });
    if (contador) {
        contador.like += 1;
        await contador.save();
    } else {
        const newContador = new ContadorLikes({ articuloId: publicationId, like: 1 });
        await newContador.save();
    }

    return true;
};

export const unlike = async (publicationId, userId) => {
    const existingLike = await NoLike.findOne({ user: userId, noliked: publicationId });
    if (existingLike) {
        throw new Error("El usuario ya dio no me gusta a esta publicación");
    }

    const newLike = new NoLike({ noliked: publicationId, user: userId });
    await newLike.save();

    const contador = await ContadorLikes.findOne({ articuloId: publicationId });
    if (contador) {
        contador.nolike += 1;
        await contador.save();
    } else {
        const newContador = new ContadorLikes({ articuloId: publicationId, nolike: 1 });
        await newContador.save();
    }

    return true;
};

export const deleteLike = async (likeId, noLikeId, userId) => {
    if (likeId) {
        const like = await Like.findOneAndDelete({ _id: likeId, user: userId });
        if (like) {
            await ContadorLikes.findOneAndUpdate(
                { articuloId: like.liked },
                { $inc: { like: -1 } }
            );
            return { type: 'like' };
        }
    }

    if (noLikeId) {
        const noLike = await NoLike.findOneAndDelete({ _id: noLikeId, user: userId });
        if (noLike) {
            await ContadorLikes.findOneAndUpdate(
                { articuloId: noLike.noliked },
                { $inc: { nolike: -1 } }
            );
            return { type: 'nolike' };
        }
    }

    throw new Error("El usuario no dio like o no me gusta a esta publicación");
};

export const listLikes = async (publicationId) => {
    const contador = await ContadorLikes.findOne({ articuloId: publicationId });
    const likesCount = contador ? contador.like : 0;
    const noLikesCount = contador ? contador.nolike : 0;

    const likes = await Like.find({ liked: publicationId }).populate('user', 'name surname');
    const noLikes = await NoLike.find({ noliked: publicationId }).populate('user', 'name surname');

    return { likes, noLikes, TotalLike: likesCount, TotalNoLike: noLikesCount };
};
