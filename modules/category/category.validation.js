import validator from "validator";

export const validateCreate = (params) => {
    if (!params.name || typeof params.name !== 'string') {
        throw new Error("Nombre de categoría requerido");
    }
    if (!validator.isLength(params.name, { min: 2, max: 50 })) {
        throw new Error("El nombre debe tener entre 2 y 50 caracteres");
    }
};
