import mongoose from 'mongoose';
import Seguidor from './follower.model.js';

export const follow = async (userId, creadorId) => {
    if (!mongoose.Types.ObjectId.isValid(creadorId)) {
        throw new Error("ID de usuario inválido");
    }

    if (userId === creadorId) {
        throw new Error("No puedes seguirte a ti mismo");
    }

    const existe = await Seguidor.findOne({ userId, creadorId });
    if (existe) {
        return { siguiendo: true, message: "Ya sigues a este usuario" };
    }

    const nuevoSeguidor = await Seguidor.create({ userId, creadorId });
    return { siguiendo: true, seguidor: nuevoSeguidor, message: "Ahora sigues a este usuario" };
};

export const unfollow = async (userId, creadorId) => {
    if (!creadorId) {
        throw new Error("creadorId es requerido");
    }

    const seguidorEliminado = await Seguidor.findOneAndDelete({ userId, creadorId });
    if (!seguidorEliminado) {
        throw new Error("No se encontró el seguidor");
    }

    return true;
};

export const getMyFollowers = async (userId, page, limit) => {
    const seguidores = await Seguidor.paginate(
        { creadorId: userId },
        {
            page, limit, sort: { createdAt: -1 },
            populate: { path: "userId", select: "name surname image nick bio frasefavorita" }
        }
    );
    return seguidores;
};

export const getUserFollowers = async (userId, page, limit) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("ID inválido");
    }

    const seguidores = await Seguidor.paginate(
        { creadorId: userId },
        {
            page, limit, sort: { createdAt: -1 },
            populate: { path: "userId", select: "name surname image nick bio frasefavorita" }
        }
    );
    return seguidores;
};

export const getUserFollowing = async (userId, page, limit) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("ID inválido");
    }

    const seguidos = await Seguidor.paginate(
        { userId },
        {
            page, limit, sort: { createdAt: -1 },
            populate: { path: "creadorId", select: "name surname image nick bio frasefavorita" }
        }
    );
    return seguidos;
};
