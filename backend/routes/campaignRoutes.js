const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../Uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Le fichier doit être une image valide (JPEG, PNG, etc.).'), false);
    }
  },
});

router.post(
  '/creer-campagne',
  authMiddleware.verifyToken,
  (req, res, next) => {
    console.log('Requête reçue pour /creer-campagne');
    upload.single('visuel')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Erreur Multer:', err);
        return res.status(400).json({ message: `Erreur Multer: ${err.message}` });
      } else if (err) {
        console.error('Erreur lors du téléchargement:', err);
        return res.status(400).json({ message: 'Erreur lors du téléchargement du fichier.', error: err.message });
      }
      console.log('Fichier traité par Multer:', req.file);
      next();
    });
  },
  campaignController.createCampaign
);

module.exports = router;