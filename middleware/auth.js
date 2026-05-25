import jwt from "jsonwebtoken";
import { secret_key as secret } from "../shared/jwt/jwt.service.js";

export const auth = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene cabecera de autenticacion."
        });
    }

    const token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        const payload = jwt.verify(token, secret);
        req.user = payload;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({
                status: "error",
                message: "token expirado"
            });
        }
        return res.status(404).send({
            status: "error",
            message: "token invalido"
        });
    }

    next();
};
