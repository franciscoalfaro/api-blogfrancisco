import bcrypt from 'bcrypt';
import User from '../user/user.model.js';
import { createToken } from '../../shared/jwt/jwt.service.js';

const SALT_ROUNDS = 12;

export const registerUser = async (params) => {
    const existingUser = await User.find({ email: params.email.toLowerCase() });
    if (existingUser && existingUser.length >= 1) {
        return { warning: true, message: "El usuario ya existe" };
    }

    const pwd = await bcrypt.hash(params.password, SALT_ROUNDS);
    params.password = pwd;

    const userToSave = new User(params);
    const userStored = await userToSave.save();
    return userStored;
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Credenciales inválidas");
    }

    const pwd = await bcrypt.compare(password, user.password);
    if (!pwd) {
        throw new Error("Credenciales inválidas");
    }

    user.eliminado = false;
    await user.save();

    const token = createToken(user);
    return { user: { id: user._id, name: user.name }, token };
};
