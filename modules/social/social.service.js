import Redes from './social.model.js';
import User from '../user/user.model.js';

const ensureHttps = (url) => {
    if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
    }
    return url;
};

const isValidUrl = (url) => {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

export const create = async (userId, name, url) => {
    const urlValida = ensureHttps(url);
    if (!isValidUrl(urlValida)) {
        throw new Error("La URL proporcionada no es válida");
    }
    const nuevaRed = new Redes({ userId, name, url: urlValida });
    const redGuardada = await nuevaRed.save();
    return redGuardada;
};

export const list = async (userId, page = 1, limit = 10) => {
    const redes = await Redes.paginate(
        { userId },
        { page, limit, sort: { fecha: -1 } }
    );
    return redes;
};

export const update = async (id, userId, name, url) => {
    const urlValida = ensureHttps(url);
    if (!isValidUrl(urlValida)) {
        throw new Error("La URL proporcionada no es válida");
    }
    const redActualizada = await Redes.findOneAndUpdate(
        { _id: id, userId },
        { name, url: urlValida },
        { new: true }
    );
    if (!redActualizada) {
        throw new Error("Red no encontrada o no pertenece al usuario");
    }
    return redActualizada;
};

export const remove = async (id, userId) => {
    const redEliminada = await Redes.findOneAndDelete({ _id: id, userId });
    if (!redEliminada) {
        throw new Error("Red no encontrada o no pertenece al usuario");
    }
    return true;
};

export const listPublic = async (userId, page = 1, limit = 10) => {
    const redes = await Redes.paginate(
        { userId },
        { page, limit, sort: { fecha: -1 } }
    );
    return redes;
};

export const listAdmin = async () => {
    const usuario = await User.findOne({ email: "franciscoalfar@gmail.com" });
    if (!usuario) {
        throw new Error("Usuario no encontrado");
    }

    const redes = await Redes.find({ userId: usuario._id }).sort({ fecha: -1 }).select({ "-userId": 0 });
    return redes;
};
