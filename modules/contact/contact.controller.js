import * as contactService from './contact.service.js';
import { validateContact } from './contact.validation.js';

export const contacto = async (req, res) => {
    const params = req.body;

    try {
        validateContact(params);
    } catch (error) {
        return res.status(400).json({ status: "error", message: "Datos de contacto inválidos" });
    }

    try {
        await contactService.sendContact(params.email, params.apellido, params.telefono, params.mensaje, params.nombre);
        return res.status(200).json({ status: 'success', message: 'Se ha enviado un correo de contacto' });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error al enviar correo' });
    }
};
