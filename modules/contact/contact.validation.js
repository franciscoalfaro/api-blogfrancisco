export const validateContact = (params) => {
    if (!params.nombre || !params.apellido || !params.telefono || !params.email || !params.mensaje) {
        throw new Error("faltan datos por enviar");
    }
};
