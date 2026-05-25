export const success = (res, data = {}, message = 'Success', code = 200) => {
    return res.status(code).json({ status: 'success', message, ...data });
};

export const error = (res, message = 'Error', code = 500, errorDetail = null) => {
    const response = { status: 'error', message };
    if (errorDetail) response.error = errorDetail;
    return res.status(code).json(response);
};

export const warning = (res, message = 'Warning', code = 200, data = {}) => {
    return res.status(code).json({ status: 'warning', message, ...data });
};
