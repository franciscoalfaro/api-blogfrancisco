import * as recoveryService from './recovery.service.js';
import { validateEmail, validateReset } from './recovery.validation.js';

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        validateEmail(email);
    } catch (error) {
        return res.status(400).json({ status: 'error', message: 'Email inválido' });
    }

    try {
        await recoveryService.requestReset(email);
        return res.status(200).json({ status: 'success', message: 'Email de recuperación enviado' });
    } catch (error) {
        if (error.message.includes('no está registrado')) {
            return res.status(404).json({ status: 'error', message: 'El email no está registrado' });
        }
        return res.status(500).json({ status: 'error', message: 'Error al solicitar la recuperación' });
    }
};

export const handleResetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        validateReset(token, newPassword);
    } catch (error) {
        return res.status(400).json({ status: 'error', message: 'Datos inválidos para restablecer contraseña' });
    }

    try {
        await recoveryService.handleReset(token, newPassword);
        return res.status(200).json({ status: 'success', message: 'Contraseña restablecida correctamente' });
    } catch (error) {
        if (error.message.includes('Token')) {
            return res.status(400).json({ status: 'error', message: 'Token inválido o expirado' });
        }
        return res.status(500).json({ status: 'error', message: 'Error al restablecer la contraseña' });
    }
};
