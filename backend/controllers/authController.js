/**
 * Auth Controller
 * ================
 * Gestion de l'authentification (connexion, deconnexion, statut)
 */

const path = require('path');
const fs = require('fs');

// Chemin vers le fichier .env
const envPath = path.join(__dirname, '../config', '.env');

/**
 * Charge les identifiants depuis le fichier .env
 * Utilise directement les crédentials SANS hashing
 */
function loadCredentials() {
    try {
        // Lire le fichier .env
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Extraire les variables (en gérant les espaces et commentaires)
        const APP_USER = envContent.match(/^APP_USER=(.*)$/m)?.[1]?.trim() || 'admin';
        let APP_PASSWORD = envContent.match(/^APP_PASSWORD=(.*)$/m)?.[1]?.trim() || 'password123';
        
        // Vérifier si le mot de passe semble être un hash bcrypt (ancienne version)
        // Si c'est le cas, afficher une ERREUR claire et utiliser la valeur par défaut
        const isHashedPassword = APP_PASSWORD.startsWith('$2a$') || 
                                  APP_PASSWORD.startsWith('$2b$') || 
                                  APP_PASSWORD.startsWith('$2y$');
        
        if (isHashedPassword) {
            console.error('❌ ⚠️  ERREUR: Le mot de passe dans .env est HASHE (ancien format) !');
            console.error('   Le nouveau système utilise les mots de passe EN CLAIR.');
            console.error('   Veuillez modifier APP_PASSWORD dans backend/config/.env');
            console.error('   Exemple: APP_PASSWORD=password123');
            console.error('   Actuellement: APP_PASSWORD=' + APP_PASSWORD);
            // Utiliser le mot de passe par défaut pour permettre la connexion
            APP_PASSWORD = 'password123';
        }
        
        return { username: APP_USER, password: APP_PASSWORD };
    } catch (error) {
        console.error('❌ Erreur lors du chargement des identifiants:', error);
        // Retourner des valeurs par défaut en cas d'erreur
        return { username: 'admin', password: 'password123' };
    }
}

// Charger les identifiants (seulement une fois)
const credentials = loadCredentials();

/**
 * POST /api/login
 * Connecte un utilisateur
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Nom d\'utilisateur et mot de passe requis'
            });
        }
        
        // Vérifier les identifiants
        const isUsernameValid = username === credentials.username;
        const isPasswordValid = password === credentials.password;
        
        if (!isUsernameValid || !isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Identifiants incorrects'
            });
        }
        
        // Créer la session
        req.session.user = {
            username: credentials.username,
            authenticated: true
        };
        
        // Sauvegarder explicitement la session
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('❌ Erreur lors de la sauvegarde de la session:', err);
                    return reject(err);
                }
                console.log(`✅ Connexion réussie pour: ${username}`);
                resolve();
            });
        });
        
        res.json({
            success: true,
            message: 'Connexion réussie',
            user: { username: req.session.user.username }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la connexion:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la connexion'
        });
    }
};

/**
 * GET /api/logout
 * Déconnecte un utilisateur
 */
const logout = (req, res) => {
    try {
        const username = req.session.user?.username;
        
        // Détruire la session
        req.session.destroy((err) => {
            if (err) {
                console.error('❌ Erreur lors de la déconnexion:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Erreur serveur lors de la déconnexion'
                });
            }
            
            // Supprimer le cookie de session
            res.clearCookie(process.env.SESSION_NAME || 'form2sign_sid');
            
            console.log(`✅ Déconnexion réussie pour: ${username}`);
            
            res.json({
                success: true,
                message: 'Déconnexion réussie'
            });
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur lors de la déconnexion'
        });
    }
};

/**
 * GET /api/auth/status
 * Vérifie le statut de l'authentification
 */
const checkAuthStatus = (req, res) => {
    try {
        if (req.session.user?.authenticated) {
            res.json({
                success: true,
                authenticated: true,
                user: { username: req.session.user.username }
            });
        } else {
            res.status(401).json({
                success: false,
                authenticated: false,
                error: 'Non authentifié'
            });
        }
    } catch (error) {
        console.error('❌ Erreur lors de la vérification de l\'auth:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur'
        });
    }
};

module.exports = {
    login,
    logout,
    checkAuthStatus
};
