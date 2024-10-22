import validator from "validator";

export const validar = (params) => {
    let errores = [];

    if (validator.isEmpty(params.titulo) || !validator.isLength(params.titulo, { min: 3, max: undefined })) {
        errores.push("El campo 'titulo' no cumple con los requisitos de longitud.");
    }

    if (validator.isEmpty(params.descripcion) || !validator.isLength(params.descripcion, { min: 3, max: undefined })) {
        errores.push("El campo 'descripcion' no cumple con los requisitos de longitud.");
    }

    if (validator.isEmpty(params.contenido) || !validator.isLength(params.contenido, { min: 3, max: undefined })) {
        errores.push("El campo 'contenido' no cumple con los requisitos de longitud.");
    }

    if (errores.length > 0) {
        throw new Error(`No se ha superado la validación. Errores: ${errores.join(", ")}`);
    } else {
        console.log("Validación superada.");
    }
}


