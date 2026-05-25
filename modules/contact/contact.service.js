import * as EmailService from '../../shared/email/email.service.js';

export const sendContact = async (email, apellido, telefono, mensaje, nombre) => {
    await EmailService.enviarCorreoContacto(email, apellido, telefono, mensaje, nombre);
    return true;
};
