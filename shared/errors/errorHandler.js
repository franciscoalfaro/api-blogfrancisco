export const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        ...(isProduction ? {} : { error: err.message })
    });
};
