import * as socialService from './social.service.js';

export const crearRed = async (req, res) => {
    try {
        const { name, url } = req.body;
        if (!name || !url) {
            return res.status(400).json({ status: 'error', message: 'se debe de enviar los valores nombre de la url y url' });
        }
        const redGuardada = await socialService.create(req.user.id, name, url);
        return res.status(201).json({ status: 'success', message: 'Red creada correctamente', red: redGuardada });
    } catch (error) {
        const code = error.message.includes('URL') ? 400 : 500;
        return res.status(code).json({ status: 'error', message: 'Error al crear la red' });
    }
};

export const listarRedes = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const redes = await socialService.list(req.user.id, page, limit);
        return res.status(200).json({
            status: 'success', message: 'Listado de redes', redes: redes.docs,
            totalPages: redes.totalPages, totalItems: redes.totalDocs,
            itemsPerPage: redes.limit, currentPage: redes.page
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error al listar las redes' });
    }
};

export const actualizarRed = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url } = req.body;
        const redActualizada = await socialService.update(id, req.user.id, name, url);
        return res.status(200).json({ status: 'success', message: 'Red actualizada correctamente', red: redActualizada });
    } catch (error) {
        const code = error.message.includes('URL') ? 400 : error.message.includes('no pertenece') ? 404 : 500;
        return res.status(code).json({ status: 'error', message: 'Error al actualizar la red' });
    }
};

export const eliminarRed = async (req, res) => {
    try {
        await socialService.remove(req.params.id, req.user.id);
        return res.status(200).json({ status: 'success', message: 'Red eliminada correctamente' });
    } catch (error) {
        const code = error.message.includes('no pertenece') ? 404 : 500;
        return res.status(code).json({ status: 'error', message: 'Error al eliminar la red' });
    }
};

export const listado = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const redes = await socialService.listPublic(req.params.id, page, limit);
        return res.status(200).json({
            status: 'success', message: 'Listado de redes', redes: redes.docs,
            totalPages: redes.totalPages, totalItems: redes.totalDocs,
            itemsPerPage: redes.limit, currentPage: redes.page
        });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error al listar las redes' });
    }
};

export const redAdmin = async (req, res) => {
    try {
        const redes = await socialService.listAdmin();
        return res.status(200).json({ status: 'success', message: 'Listado de redes', redes, totalItems: redes.length });
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Error al listar las redes' });
    }
};
