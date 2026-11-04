const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif'
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(new Error(
        'Formato inválido. Utilize JPG, PNG, WEBP, GIF ou AVIF.'
      ));
    }

    callback(null, true);
  }
});

router.post(
  '/image',
  authMiddleware,
  (req, res, next) => {
    upload.single('image')(req, res, (error) => {
      if (error) {
        return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
          message: error.message
        });
      }

      next();
    });
  },
  async (req, res) => {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME ||
          !process.env.CLOUDINARY_API_KEY ||
          !process.env.CLOUDINARY_API_SECRET) {
        return res.status(503).json({
          message: 'Serviço de imagens não configurado.'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: 'Selecione uma imagem.'
        });
      }

      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'catalogo-online/products',
            resource_type: 'image'
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );

        stream.end(req.file.buffer);
      });

      return res.status(200).json({
        message: 'Imagem enviada com sucesso.',
        imageUrl
      });

    } catch (error) {
      console.error('Erro no upload da imagem:', error.message);

      return res.status(500).json({
        message: 'Não foi possível enviar a imagem.'
      });
    }
  }
);

module.exports = router;
