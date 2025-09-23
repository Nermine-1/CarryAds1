/**
 * @fileoverview Fichier de routage pour les distributeurs.
 * Connecte les URLs aux fonctions du contrôleur.
 */
const express = require('express');
const router = express.Router();

// Importation du contrôleur et du middleware
const distributorController = require('../controllers/distributorController');
const authMiddleware = require('../middleware/authMiddleware');

// Les routes sont définies ici en utilisant l'objet 'router'
router.get('/pending', authMiddleware.verifyToken, distributorController.getPendingCampaigns);
router.get('/active', authMiddleware.verifyToken, distributorController.getActiveCampaigns);
router.get('/mes-campagnes', authMiddleware.verifyToken, distributorController.getAllCampaigns);
router.post('/distribute', authMiddleware.verifyToken, distributorController.distributeBags);
router.post('/accept-campaign', authMiddleware.verifyToken, distributorController.acceptCampaign);
router.post('/decline-campaign', authMiddleware.verifyToken, distributorController.declineCampaign);
router.get('/paiements', authMiddleware.verifyToken, distributorController.getPayments);
router.get('/paiements/:id', authMiddleware.verifyToken, distributorController.getPaymentDetails);
router.get('/stats', authMiddleware.verifyToken, distributorController.getStats); 
router.get('/profile', authMiddleware.verifyToken, distributorController.getProfile);
// EXPORTATION CLÉ :
// On exporte l'objet 'router' pour qu'il puisse être utilisé dans server.js
module.exports = router;