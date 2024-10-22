import 'dotenv'
import bcrypt  from 'bcrypt'
import Contacto from "../middlewares/recuperarpass.js"

export const contacto = async (req, res) => {
    let params = req.body;
    try {
        if (!params.nombre ||!params.apellido || !params.telefono || !params.email || !params.mensaje) {
            return res.status(400).json({
                status: "error",
                message: "faltan datos por enviar"
            })
        }
        

        // Envío del correo con la nueva contraseña al usuario
        await Contacto.enviarCorreoContacto(params.email, params.apellido, params.telefono, params.mensaje, params.nombre);

        return res.status(200).json({
            status: 'success',
            message: 'Se ha enviado un correo de contacto'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al enviar correo',
            error: error.message
        });
    }
};