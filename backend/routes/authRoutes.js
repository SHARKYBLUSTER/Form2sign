/**
 * Auth Routes
 * ===========
 * Routes pour l'authentification
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/login - Connexion
router.post('/login', authController.login);

// GET /api/logout - Déconnexion
router.get('/logout', authController.logout);

// GET /api/auth/status - Vérifier le statut d'authentification
router.get('/auth/status', authController.checkAuthStatus);

module.exports = router;
