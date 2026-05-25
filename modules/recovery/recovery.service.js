import bcrypt from 'bcrypt';
import User from '../user/user.model.js';
import { createResetToken } from '../../shared/jwt/jwt.service.js';
import { enviarEnlaceRecuperacion } from '../../shared/email/email.service.js';

export const requestReset = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('El correo electrónico no está registrado');
    }

    const resetToken = createResetToken(user);
    const resetTokenExpiration = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpiration = resetTokenExpiration;
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}reset-password/${resetToken}`;

    await enviarEnlaceRecuperacion(email, resetURL);

    return true;
};

export const handleReset = async (token, newPassword) => {
    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('Token inválido o vencido');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    return true;
};
