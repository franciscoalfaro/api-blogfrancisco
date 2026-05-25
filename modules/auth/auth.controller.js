import * as authService from './auth.service.js';
import { validateRegister, validateLogin } from './auth.validation.js';

export const register = async (req, res) => {
    const params = req.body;

    try {
        validateRegister(params);
    } catch (error) {
        return res.status(400).json({ status: "error", message: "Datos de registro inválidos" });
    }

    try {
        const result = await authService.registerUser(params);

        if (result.warning) {
            return res.status(200).send({ status: "warning", message: result.message });
        }

        return res.status(200).json({
            status: "success",
            message: "Usuario registrado correctamente",
            user: result
        });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "error al guardar el usuario" });
    }
};

export const login = async (req, res) => {
    const params = req.body;

    try {
        validateLogin(params);
    } catch (error) {
        return res.status(400).send({ status: "error_400", message: "Datos de inicio de sesión inválidos" });
    }

    try {
        const result = await authService.loginUser(params.email, params.password);

        return res.status(200).json({
            status: "success",
            message: "Te has identificado de forma correcta.",
            user: result.user,
            token: result.token
        });
    } catch (error) {
        return res.status(401).send({
            status: "error",
            message: "Credenciales inválidas"
        });
    }
};
