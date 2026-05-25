import fs from 'fs';
import path from 'path';
import * as userService from './user.service.js';
import { auth as checkAuth } from '../../middleware/auth.js';

export const profile = async (req, res) => {
    try {
        const id = req.params.id;
        const userProfile = await userService.getProfile(id);
        return res.status(200).json({ status: "success", message: "profile found successfully", user: userProfile });
    } catch (error) {
        return res.status(404).json({ status: "error", message: "error al obtener el usuario en el servidor" });
    }
};

export const update = async (req, res) => {
    try {
        const userIdentity = req.user;
        const data = req.body;
        const result = await userService.updateUser(userIdentity.id, data);

        if (result.warning) {
            return res.status(200).json({ status: "warning", message: result.message });
        }

        return res.status(200).json({ status: "success", message: "Perfil actualizado correctamente", user: result });
    } catch (error) {
        const code = error.message.includes("requerida") || error.message.includes("correcta") ? 400 : 500;
        return res.status(code).json({ status: "error", message: "No se pudo actualizar el perfil" });
    }
};

export const avatar = (req, res) => {
    const file = req.params.file;

    if (file.includes('..') || file.includes('/')) {
        return res.status(400).json({ status: "error", message: "Nombre de archivo inválido" });
    }

    const filePath = "./uploads/avatars/" + file;

    try {
        fs.stat(filePath, (error, exist) => {
            if (!exist) {
                return res.status(404).send({ status: "error", message: "la image no existe" });
            }
            return res.sendFile(path.resolve(filePath));
        });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "error al obtener la informacion en servidor" });
    }
};

export const upload = async (req, res) => {
    if (!req.file) {
        return res.status(404).send({ status: "error", message: "imagen no seleccionada" });
    }

    let image = req.file.originalname;
    const imageSplit = image.split(".");
    const extension = imageSplit[imageSplit.length - 1].toLowerCase();

    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {
        const filePath = req.file.path;
        fs.unlinkSync(filePath);
        return res.status(400).json({ status: "error", mensaje: "Extension no valida" });
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(req.file.mimetype)) {
        const filePath = req.file.path;
        fs.unlinkSync(filePath);
        return res.status(400).json({ status: "error", mensaje: "Tipo de archivo no permitido" });
    }

    try {
        const ImaUpdate = await userService.uploadAvatar(req.user.id, req.file);
        return res.status(200).json({
            status: "success", message: "avatar actualizado",
            user: req.user, file: req.file, image
        });
    } catch (error) {
        const filePath = req.file.path;
        fs.unlinkSync(filePath);
        return res.status(500).send({ status: "error", message: "error al obtener la informacion en servidor" });
    }
};

export const remove = async (req, res) => {
    try {
        const userId = req.params.id;
        const userDelete = await userService.removeUser(userId);
        return res.status(200).json({ status: "success", message: "Usuario eliminado", user: userDelete });
    } catch (error) {
        return res.status(404).json({ status: "error", message: "Error al eliminar usuario" });
    }
};

export const list = async (req, res) => {
    let page = 1;
    if (req.params.page) page = parseInt(req.params.page);

    try {
        const users = await userService.listUsers(page);
        return res.status(200).send({
            status: "success", message: "listado de usuarios",
            users: users.docs, pages: users.totalPages,
            totalDocs: users.totalDocs, itempage: users.limit, page: users.page
        });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "error al obtener el usuario en servidor" });
    }
};

export const publicListUser = async (req, res) => {
    try {
        const usuarios = await userService.publicListUser();
        return res.status(200).send({
            status: "success", message: "usuarios encontrados",
            usuarios: usuarios.docs, totalPages: usuarios.totalPages,
            totalDocs: usuarios.totalDocs, itempage: usuarios.limit, page: usuarios.page
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error al listar los usuarios' });
    }
};

export const publicProfile = async (req, res) => {
    try {
        const id = req.params.id;
        const userProfile = await userService.publicProfile(id);
        return res.status(200).json({ status: "success", message: "profile found successfully", user: userProfile });
    } catch (error) {
        return res.status(404).json({ status: "error", message: "error al obtener el usuario en el servidor" });
    }
};
