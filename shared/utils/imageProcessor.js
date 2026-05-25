import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = './uploads/publications';

const config = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
    format: 'webp',
    allowedFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024
};

export const processImage = async (file) => {
    const filename = `img-${Date.now()}-${Math.random().toString(36).substring(7)}.${config.format}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const metadata = await sharp(file.buffer).metadata();

    let sharpInstance = sharp(file.buffer);

    if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
        sharpInstance = sharpInstance.resize(config.maxWidth, config.maxHeight, {
            fit: 'inside',
            withoutEnlargement: true
        });
    }

    await sharpInstance
        .webp({ quality: config.quality })
        .toFile(filePath);

    return {
        filename,
        url: `/api/articulo/media/${filename}`,
        originalName: file.originalname,
        size: fs.statSync(filePath).size
    };
};

export const deleteImage = async (filename) => {
    const filePath = path.join(UPLOAD_DIR, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
};

export const processCoverImage = async (file) => {
    const filename = `cover-${Date.now()}-${Math.random().toString(36).substring(7)}.${config.format}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const metadata = await sharp(file.buffer).metadata();

    let sharpInstance = sharp(file.buffer);

    if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
        sharpInstance = sharpInstance.resize(config.maxWidth, config.maxHeight, {
            fit: 'inside',
            withoutEnlargement: true
        });
    }

    await sharpInstance
        .webp({ quality: config.quality })
        .toFile(filePath);

    return {
        filename,
        url: `/api/articulo/media/${filename}`
    };
};

export const validateImage = (file) => {
    if (!config.allowedFormats.includes(file.mimetype)) {
        throw new Error('Tipo de archivo no permitido. Solo se aceptan: jpeg, png, gif, webp');
    }

    if (file.size > config.maxFileSize) {
        throw new Error(`El archivo excede el tamaño máximo de ${config.maxFileSize / 1024 / 1024}MB`);
    }

    return true;
};
