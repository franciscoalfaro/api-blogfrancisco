export const validateEmail = (email) => {
    if (!email) {
        throw new Error("Email es requerido");
    }
};

export const validateReset = (token, newPassword) => {
    if (!token) {
        throw new Error("Token es requerido");
    }
    if (!newPassword || newPassword.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
    }
};
