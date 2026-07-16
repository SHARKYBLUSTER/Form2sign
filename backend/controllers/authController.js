/**
 * Auth Controller
 * ================
 * Gestion de l'authentification (connexion, deconnexion, statut)
 */

const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Chemin vers le fichier .env
const envPath = path.join(__dirname, '../config', '.env');

/**
 * Charge les identifiants depuis le fichier .env
 * Si le mot de passe n'est pas hashe, le hashe et sauvegarde
 */
function loadCredentials() {
    try {
        // Lire le fichier .env
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // Extraire les variables (en gérant les espaces et commentaires)
        const APP_USER = envContent.match(/^APP_USER=(.*)$/m)?.[1]?.trim() || 'admin';
        let APP_PASSWORD = envContent.match(/^APP_PASSWORD=(.*)$/m)?.[1]?.trim() || 'password123';
        
        // Vérifier si le mot de passe est déjà hashé (commence par $2a$, $2b$, ou $2y$)
        const isHashed = APP_PASSWORD.startsWith('$2a$') || APP_PASSWORD.startsWith('$2b$') || APP_PASSWORD.startsWith('$2y$');
        
        if (!isHashed) {
            // Hasher le mot de passe
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(APP_PASSWORD, salt);
            
            // Mettre à jour le fichier .env (remplacer seulement la ligne APP_PASSWORD)
            const newEnvContent = envContent.replace(
                /^(APP_PASSWORD=).*/m,
                `$1${hashedPassword}`
            );
            
            fs.writeFileSync(envPath, newEnvContent);
            console.log('🔐 Mot de passe hashé et sauvegardé dans .env');
            
            return { username: APP_USER, password: hashedPassword };
        }
        
        return { username: APP_USER, password: APP_PASSWORD };
    } catch (error) {
        console.error('❌ Erreur lors du chargement des identifiants:', error);
        // Retourner des valeurs par défaut en cas d'erreur
        return { username: 'admin', password: bcrypt.hashSync('password123', bcrypt.genSaltSync(10)) };
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
        const isPasswordValid = await bcrypt.compare(password, credentials.password);
        
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
