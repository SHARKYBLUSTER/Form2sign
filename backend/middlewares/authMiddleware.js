/**
 * Auth Middleware
 * ===============
 * Middleware pour vérifier l'authentification
 */

/**
 * Vérifie si l'utilisateur est authentifié
 * Si non, retourne une erreur 401
 */
const requireAuth = (req, res, next) => {
    try {
        if (req.session.user?.authenticated) {
            // Utilisateur authentifié, continuer
            return next();
        }
        
        // Non authentifié
        return res.status(401).json({
            success: false,
            error: 'Accès non autorisé - Veuillez vous connecter'
        });
        
    } catch (error) {
        console.error('❌ Erreur dans le middleware d\'auth:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la vérification de l\'authentification'
        });
    }
};

/**
 * Vérifie si l'utilisateur est authentifié et redirige vers login si non
 * (Pour les routes qui doivent rediriger au lieu de retourner JSON)
 */
const requireAuthRedirect = (req, res, next) => {
    try {
        if (req.session.user?.authenticated) {
            return next();
        }
        
        // Rediriger vers la page de login
        return res.redirect('/');
        
    } catch (error) {
        console.error('❌ Erreur dans le middleware d\'auth avec redirection:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

module.exports = {
    requireAuth,
    requireAuthRedirect
};
