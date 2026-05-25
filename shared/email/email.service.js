import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function crearTransporter() {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    return nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 587,
        secure: false,
        auth: {
            user: emailUser,
            pass: emailPassword
        }
    });
}

export async function enviarEnlaceRecuperacion(email, resetURL) {
    const transporter = crearTransporter();
    const emailUser = process.env.EMAIL_USER;

    try {
        const emailTemplatePath = path.join(process.cwd(), 'uploads', 'html', 'reset-password.html');
        const emailTemplate = await fs.readFile(emailTemplatePath, 'utf8');

        const mailOptions = {
            from: emailUser,
            to: email,
            subject: 'Recuperación de Contraseña',
            html: emailTemplate.replace('{{resetURL}}', resetURL)
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo de recuperación con enlace enviado a', email);
    } catch (error) {
        console.error('Error al enviar correo de recuperación con enlace:', error);
    }
}

export async function enviarCorreoBienvenida(email, nuevaContrasena) {
    const transporter = crearTransporter();
    const emailUser = process.env.EMAIL_USER;

    try {
        const mailOptions = {
            from: emailUser,
            to: email,
            subject: 'Bienvenido',
            text: `Tu contraseña temporal es: ${nuevaContrasena}. Te recomendamos cambiarla una vez hayas iniciado sesión.`
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo de bienvenida enviado a', email);
    } catch (error) {
        console.error('Error al enviar correo de bienvenida:', error);
    }
}

export async function enviarCorreoContacto(email, apellido, telefono, mensaje, nombre) {
    const transporter = crearTransporter();
    const emailUser = process.env.EMAIL_USER;

    try {
        const emailTemplatePath = path.join(process.cwd(), 'uploads', 'html', 'contacto.html');
        const emailTemplate = await fs.readFile(emailTemplatePath, 'utf8');

        const mailOptions = {
            from: emailUser,
            cc: emailUser,
            to: email,
            subject: 'Solicitud de contacto',
            html: emailTemplate
                .replace('{{nombre}}', nombre)
                .replace('{{apellido}}', apellido)
                .replace('{{telefono}}', telefono)
                .replace('{{mensaje}}', mensaje)
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo de contacto enviado a', email);
    } catch (error) {
        console.error('Error al enviar correo de contacto:', error);
    }
}

export async function enviarCorreoInformativo(name, email, newArticulo) {
    const transporter = crearTransporter();
    const emailUser = process.env.EMAIL_USER;

    console.log('datos recibidos desde el controlador:', name, email);
    console.log('articulo', newArticulo);

    try {
        const emailTemplatePath = path.join(process.cwd(), 'uploads', 'html', 'informativo.html');
        const emailTemplate = await fs.readFile(emailTemplatePath, 'utf8');

        const sitioWeb = `${process.env.FRONTEND_URL}/article/${newArticulo._id}`;

        const htmlContent = emailTemplate
            .replace(/{{name}}/g, name)
            .replace(/{{titulo}}/g, newArticulo.titulo)
            .replace(/{{autor}}/g, newArticulo.Autor)
            .replace(/{{descripcion}}/g, newArticulo.descripcion)
            .replace(/{{sitio_web}}/g, sitioWeb);

        const mailOptions = {
            from: emailUser,
            to: email,
            subject: `Hola ${name}, nuevo artículo publicado: ${newArticulo.titulo}`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo informativo enviado a', email);
    } catch (error) {
        console.error('Error al enviar correo informativo:', error);
    }
}
