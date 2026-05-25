import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import User from './user.model.js';

const SALT_ROUNDS = 12;

export const getProfile = async (id) => {
    const userProfile = await User.findById(id).select({ "password": 0 });
    if (!userProfile) throw new Error("NO SE HA ENCONTRADO EL USUARIO");
    return userProfile;
};

export const updateUser = async (userId, data) => {
    const allowedFields = ["name", "surname", "nick", "email", "title", "bio", "frasefavorita"];
    let userToUpdate = {};

    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            userToUpdate[field] = data[field];
        }
    });

    let newPassword = data.newPassword || null;
    if (newPassword) {
        if (!data.currentPassword) {
            throw new Error("La contraseña actual es requerida para cambiar la contraseña");
        }
        const user = await User.findById(userId);
        const valid = await bcrypt.compare(data.currentPassword, user.password);
        if (!valid) {
            throw new Error("La contraseña actual no es correcta");
        }
        userToUpdate.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    if (userToUpdate.email) {
        const emailExists = await User.findOne({
            email: userToUpdate.email.toLowerCase(),
            _id: { $ne: userId }
        });
        if (emailExists) {
            return { warning: true, message: "El correo ya está en uso por otro usuario" };
        }
    }

    const userUpdated = await User.findByIdAndUpdate(userId, userToUpdate, { new: true });
    if (!userUpdated) throw new Error("No se pudo actualizar el usuario");
    return userUpdated;
};

export const getAvatarPath = (file) => {
    return "./uploads/avatars/" + file;
};

export const uploadAvatar = async (userId, file) => {
    const ImaUpdate = await User.findOneAndUpdate(
        { _id: userId },
        { image: file.filename },
        { new: true }
    );
    if (!ImaUpdate) throw new Error("error al actualizar");
    return ImaUpdate;
};

export const removeUser = async (userId) => {
    const userDelete = await User.findByIdAndUpdate(userId, { eliminado: true });
    if (!userDelete) throw new Error("Usuario no encontrado");
    return userDelete;
};

export const listUsers = async (page) => {
    let itemPerPage = 12;
    const opciones = {
        page: page,
        limit: itemPerPage,
        sort: { create_at: -1 },
        select: "-password -email -role -__v"
    };

    return new Promise((resolve, reject) => {
        User.paginate({}, opciones, (error, users) => {
            if (error || !users) {
                reject(new Error("NO SE HA ENCONTRADO EL USUARIO"));
            } else {
                resolve(users);
            }
        });
    });
};

export const publicListUser = async () => {
    let itemPerPage = 3;
    const opciones = {
        limit: itemPerPage,
        sort: { fecha: -1 },
        select: '-password -email -role -__v -nick'
    };

    const usuarios = await User.paginate({}, opciones);
    if (!usuarios) throw new Error("no se han encontrado usuarios");
    return usuarios;
};

export const publicProfile = async (id) => {
    const userProfile = await User.findById(id).select({ "password": 0, "role": 0 });
    if (!userProfile) throw new Error("NO SE HA ENCONTRADO EL USUARIO");
    return userProfile;
};
