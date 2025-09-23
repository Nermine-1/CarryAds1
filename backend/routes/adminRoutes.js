/**
 * @fileoverview Fichier de routage pour les fonctionnalités administratives.
 * Connecte les URLs aux fonctions du contrôleur.
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to ensure admin role
const isAdmin = (req, res, next) => {
  const roles = req.user?.roles;
  if (!roles || !roles.includes('ROLE_ADMIN')) {
    return res.status(403).json({ message: 'Accès refusé. Rôle admin requis.' });
  }
  next();
};
//dashboard admin
router.get('/dashboard', [authMiddleware.verifyToken, isAdmin], adminController.getDashboard);
router.get('/dashboard/revenue', [authMiddleware.verifyToken, isAdmin], adminController.getMonthlyRevenue);
router.get('/dashboard/distribution', [authMiddleware.verifyToken, isAdmin], adminController.getSupportDistribution);
router.get('/dashboard/campaigns-created', [authMiddleware.verifyToken, isAdmin], adminController.getMonthlyCampaignsCreated);
router.get('/dashboard/users-by-role', [authMiddleware.verifyToken, isAdmin], adminController.getUsersByRole);


router.get('/users', [authMiddleware.verifyToken, isAdmin], adminController.getUsers); 

router.post('/users', [authMiddleware.verifyToken, isAdmin], adminController.createUser);
router.put('/users/:id', [authMiddleware.verifyToken, isAdmin], adminController.updateUser);
router.delete('/users/:id', [authMiddleware.verifyToken, isAdmin], adminController.deleteUser);

// Distributor management
router.post('/distributors', [authMiddleware.verifyToken, isAdmin], adminController.createDistributor);
router.put('/distributors/:id', [authMiddleware.verifyToken, isAdmin], adminController.updateDistributor);
router.put('/distributors/:id/validate', [authMiddleware.verifyToken, isAdmin], adminController.validateDistributor);

// Campaign management
router.get('/campaigns', [authMiddleware.verifyToken, isAdmin], adminController.getCampaigns);
router.get('/campaigns/:id/performance', [authMiddleware.verifyToken, isAdmin], adminController.getCampaignPerformance);

// Contract and billing management
router.post('/contracts', [authMiddleware.verifyToken, isAdmin], adminController.createContract);
router.get('/invoices', [authMiddleware.verifyToken, isAdmin], adminController.getInvoices);

// Stock and delivery management

router.get('/stocks', [authMiddleware.verifyToken, isAdmin], adminController.getStocks);
router.post('/deliveries', [authMiddleware.verifyToken, isAdmin], adminController.createDelivery);
router.put('/stocks/:id', [authMiddleware.verifyToken, isAdmin], adminController.updateStock);
router.delete('/stocks/:id', [authMiddleware.verifyToken, isAdmin], adminController.deleteStock);
// Dashboard
router.get('/dashboard', [authMiddleware.verifyToken, isAdmin], adminController.getDashboard);

// Notifications
router.get('/notifications', [authMiddleware.verifyToken, isAdmin], adminController.getNotifications);

module.exports = router;