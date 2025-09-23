// Fichier: routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware'); // Middleware pour la vérification du token JWT

// Route pour récupérer les données du tableau de bord de l'annonceur
router.get('/annonceur-data', authMiddleware.verifyToken, dashboardController.getAnnonceurDashboardData);


module.exports = router;