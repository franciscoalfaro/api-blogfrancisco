import jwt from "jsonwebtoken";

const secret_key = process.env.SECRET_KEY;

export const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        organizacion: user.organizacion
    };
    return jwt.sign(payload, secret_key, { expiresIn: "30d" });
};

export const createResetToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email
    };
    return jwt.sign(payload, secret_key, { expiresIn: "1h" });
};

export { secret_key };
