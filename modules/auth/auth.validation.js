import validator from "validator";

export const validateRegister = (params) => {
    if (!params.name || !params.email || !params.password) {
        throw new Error("faltan datos por enviar");
    }

    let name = !validator.isEmpty(params.name) &&
        validator.isLength(params.name, { min: 3, max: 100 }) &&
        validator.isAlpha(params.name, "es-ES");

    let email = !validator.isEmpty(params.email) && validator.isEmail(params.email);

    let password = !validator.isEmpty(params.password) &&
        validator.isLength(params.password, { min: 8, max: 128 }) &&
        /[A-Z]/.test(params.password) &&
        /[a-z]/.test(params.password) &&
        /[0-9]/.test(params.password);

    if (!name || !email || !password) {
        throw new Error("No se ha superado la validación. La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.");
    }
};

export const validateLogin = (params) => {
    if (!params.email || typeof params.email !== 'string' || !params.password || typeof params.password !== 'string') {
        throw new Error("Email o contraseña no válidos");
    }
};
