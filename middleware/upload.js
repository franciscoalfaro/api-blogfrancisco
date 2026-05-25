import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = './uploads/publications';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const config = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
    format: 'webp'
};

const processImage = async (buffer, isCover = false) => {
    const prefix = isCover ? 'cover' : 'img';
    const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const metadata = await sharp(buffer).metadata();

    let sharpInstance = sharp(buffer);

    if (metadata.width > config.maxWidth || metadata.height > config.maxHeight) {
        sharpInstance = sharpInstance.resize(config.maxWidth, config.maxHeight, {
            fit: 'inside',
            withoutEnlargement: true
        });
    }

    await sharpInstance
        .webp({ quality: config.quality })
        .toFile(filePath);

    return filename;
};

export const processAndSaveImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const filename = await processImage(req.file.buffer, false);
        req.processedFile = {
            filename,
            url: `/api/articulo/media/${filename}`
        };
        next();
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al procesar la imagen'
        });
    }
};

export const processAndSaveCover = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const filename = await processImage(req.file.buffer, true);
        req.processedFile = {
            filename,
            url: `/api/articulo/media/${filename}`
        };
        next();
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Error al procesar la imagen de portada'
        });
    }
};

export const imageUpload = upload;
