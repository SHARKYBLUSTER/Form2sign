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
        console.log('🔐 Vérification auth - Session:', req.sessionID, 'User:', req.session.user);
        if (req.session.user?.authenticated) {
            // Utilisateur authentifié, continuer
            console.log('✅ Utilisateur authentifié:', req.session.user.username);
            return next();
        }
        
        // Non authentifié
        console.log('❌ Utilisateur non authentifié - Redirection vers login');
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
        console.log('🔐 Vérification auth (redirect) - Session:', req.sessionID, 'User:', req.session.user);
        if (req.session.user?.authenticated) {
            console.log('✅ Utilisateur authentifié (redirect):', req.session.user.username);
            return next();
        }
        
        // Rediriger vers la page de login
        console.log('❌ Utilisateur non authentifié - Redirection vers /');
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
