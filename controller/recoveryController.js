import bcrypt from 'bcrypt'
import User from '../models/user.js'
import EmailService from "../services/EmailService.js"
import * as jwt from '../services/jwt.js'

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'El correo electrónico no está registrado'
            });
        }

        const resetToken = jwt.createToken(user);
        const resetTokenExpiration = Date.now() + 3600000;

        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        await user.save();

        const resetURL = `${process.env.FRONTEND_URL}reset-password/${resetToken}`;

        await EmailService.enviarEnlaceRecuperacion(email, resetURL);

        return res.status(200).json({
            status: 'success',
            message: 'Email de recuperación enviado'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al solicitar la recuperación',
            error: error.message
        });
    }
};

export const handleResetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Token inválido o vencido'
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        return res.status(200).json({
            status: 'success',
            message: 'Contraseña restablecida correctamente'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al restablecer la contraseña',
            error: error.message
        });
    }
};



