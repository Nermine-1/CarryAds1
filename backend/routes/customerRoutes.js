/**
 * @fileoverview Fichier de routage pour les distributeurs.
 * Connecte les URLs aux fonctions du contrôleur.
 */
const express = require('express');
const router = express.Router();

// Importation du contrôleur et du middleware
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');

// Les routes sont définies ici en utilisant l'objet 'router'
router.get('/mes-campagnes', authMiddleware.verifyToken, customerController.getAdvertiserCampaigns);
router.get('/facturation', authMiddleware.verifyToken, customerController.getBillingInfo);
router.get('/factures', authMiddleware.verifyToken, customerController.getInvoices);
router.get('/getprofile', authMiddleware.verifyToken, customerController.getProfile);
router.get('/profile', authMiddleware.verifyToken, customerController.getProfile);
router.put('/profile', authMiddleware.verifyToken, customerController.updateProfile);

router.get('/download-invoice/:id', authMiddleware.verifyToken, customerController.downloadInvoice);

module.exports = router;

