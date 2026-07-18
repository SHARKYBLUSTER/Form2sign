/**
 * Form2Sign - Main Application Entry Point
 * ==========================================
 * Point d'entree principal de l'application backend
 * Configuration d'Express, des middlewares et des routes
 */

const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const multer = require('multer');

// Charger les variables d'environnement
const envPath = path.join(__dirname, 'config', '.env');
const envExamplePath = path.join(__dirname, 'config', '.env.example');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  Fichier .env non trouvé.');
  
  // Essayer de copier .env.example vers .env
  if (fs.existsSync(envExamplePath)) {
    try {
      const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
      fs.writeFileSync(envPath, envExampleContent, 'utf8');
      console.log(`✅ Fichier .env créé à partir de .env.example: ${envPath}`);
      dotenv.config({ path: envPath });
    } catch (err) {
      console.warn('⚠️  Impossible de copier .env.example vers .env:', err);
      console.warn('⚠️  Utilisation des variables par défaut.');
      dotenv.config();
    }
  } else {
    console.warn('⚠️  Fichiers .env et .env.example non trouvés. Utilisation des variables par défaut.');
    dotenv.config();
  }
}

// Initialisation de l'application Express
const app = express();

// ============================================================================
// CONFIGURATION DE BASE
// ============================================================================

// Port de l'application
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Creer le repertoire de stockage si il n'existe pas
const PDF_STORAGE_PATH = process.env.PDF_STORAGE_PATH || './uploads/pdfs';
const FORMS_DIRECTORY = process.env.FORMS_DIRECTORY || './forms';
const LOGO_STORAGE_PATH = process.env.LOGO_STORAGE_PATH || './uploads/logos';

// Creer les repertoires s'ils n'existent pas
const directories = [
  PDF_STORAGE_PATH,
  FORMS_DIRECTORY,
  LOGO_STORAGE_PATH
];

directories.forEach(dir => {
  const fullPath = path.isAbsolute(dir) ? dir : path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Répertoire créé: ${fullPath}`);
  }
});

// ============================================================================
// MIDDLEWARES
// ============================================================================

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));

// Middleware pour parser les données URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour servir UNIQUEMENT les assets statiques (CSS, JS, images)
// Les pages HTML sont gérées par des routes explicites ci-dessous
app.use('/static', express.static(path.join(__dirname, '../frontend/public')));

// Middleware pour servir les logos uploadés via /static/logos
// Cela permet d'utiliser les logos dans les formulaires YAML avec header.logo: /static/logos/nom.svg
app.use('/static/logos', express.static(path.join(__dirname, LOGO_STORAGE_PATH)));

// Configuration CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  credentials: process.env.CORS_CREDENTIALS === 'true' || true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_change_me',
  name: process.env.SESSION_NAME || 'form2sign_sid',
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24h
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  },
  resave: false,
  saveUninitialized: false
}));

// Configuration de multer pour l'upload de fichiers YAML
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/yaml' || 
        file.mimetype === 'application/x-yaml' ||
        path.extname(file.originalname).match(/\.(yaml|yml)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers YAML sont autorises'), false);
    }
  }
});

// Configuration de multer pour l'upload de logos
const uploadLogo = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB pour les logos
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
    
    const isValidType = allowedTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.some(ext => 
      path.extname(file.originalname).toLowerCase() === ext
    );
    
    if (isValidType || isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PNG, JPG, JPEG et SVG sont autorisés pour les logos'), false);
    }
  }
});

// ============================================================================
// IMPORTATION DES ROUTES
// ============================================================================

// Routes d'authentification
const authRoutes = require('./routes/authRoutes');

// Routes des formulaires (a implementer)
// const formRoutes = require('./routes/formRoutes');

// Routes des PDFs (a implementer)
// const pdfRoutes = require('./routes/pdfRoutes');

// Middleware d'authentification
const { requireAuth, requireAuthRedirect } = require('./middlewares/authMiddleware');

// ============================================================================
// FONCTIONS UTILITAIRES POUR LA CONFIGURATION
// ============================================================================

// Lire la configuration depuis le fichier .env
function readEnvConfig() {
  const envPath = path.join(__dirname, 'config', '.env');
  let config = {};
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      // Ignorer les lignes vides et les commentaires
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          let value = trimmedLine.substring(equalIndex + 1).trim();
          
          // Supprimer les quotes si présentes
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          
          config[key] = value;
        }
      }
    });
  }
  
  // Remplir avec les valeurs par défaut depuis .env.example ou les valeurs actuelles
  const defaults = {
    PDF_TITLE: process.env.PDF_TITLE || 'Formulaire signé - {full_name}',
    PDF_FOOTER: process.env.PDF_FOOTER || 'Document signé électroniquement via Form2Sign',
    PDF_INCLUDE_TIMESTAMP: process.env.PDF_INCLUDE_TIMESTAMP !== 'false',
    PDF_PAGE_SIZE: process.env.PDF_PAGE_SIZE || 'A4',
    PDF_ORIENTATION: process.env.PDF_ORIENTATION || 'portrait'
  };
  
  // Fusionner avec les valeurs actuelles de l'environnement
  Object.keys(defaults).forEach(key => {
    if (config[key] === undefined) {
      config[key] = key.endsWith('_TIMESTAMP') ? defaults[key].toString() : defaults[key];
    }
  });
  
  return config;
}

// Sauvegarder la configuration dans le fichier .env
function saveEnvConfig(newConfig) {
  const envPath = path.join(__dirname, 'config', '.env');
  const configDir = path.dirname(envPath);
  
  // S'assurer que le répertoire existe
  if (!fs.existsSync(configDir)) {
    try {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`✅ Répertoire créé: ${configDir}`);
    } catch (err) {
      console.error(`❌ Impossible de créer le répertoire ${configDir}:`, err);
      throw err;
    }
  }
  
  // Lire le contenu existant
  let envContent = '';
  if (fs.existsSync(envPath)) {
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (err) {
      console.error(`❌ Impossible de lire ${envPath}:`, err);
      throw err;
    }
  } else {
    console.log(`ℹ️  Fichier .env non trouvé, création d'un nouveau: ${envPath}`);
  }
  
  const lines = envContent.split('\n');
  const updatedLines = [];
  const configKeys = Object.keys(newConfig);
  
  // Mettre à jour les lignes existantes ou ajouter de nouvelles
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        
        // Si c'est une clé de configuration PDF, mettre à jour la valeur
        if (configKeys.includes(key)) {
          let value = newConfig[key];
          
          // Pour les booléens, convertir en string
          if (typeof value === 'boolean') {
            value = value.toString();
          }
          
          // Ajouter des quotes si la valeur contient des espaces ou des caractères spéciaux
          if (typeof value === 'string' && (value.includes(' ') || value.includes('{') || value.includes('}'))) {
            value = `"${value}"`;
          }
          
          updatedLines.push(`${key}=${value}`);
          
          // Retirer la clé des clés à ajouter
          const index = configKeys.indexOf(key);
          if (index > -1) {
            configKeys.splice(index, 1);
          }
        } else {
          // Garder la ligne inchangée
          updatedLines.push(line);
        }
      } else {
        updatedLines.push(line);
      }
    } else {
      // Garder les commentaires et lignes vides
      updatedLines.push(line);
    }
  });
  
  // Ajouter les nouvelles clés qui n'existaient pas
  configKeys.forEach(key => {
    let value = newConfig[key];
    
    if (typeof value === 'boolean') {
      value = value.toString();
    }
    
    if (typeof value === 'string' && (value.includes(' ') || value.includes('{') || value.includes('}'))) {
      value = `"${value}"`;
    }
    
    updatedLines.push(`${key}=${value}`);
  });
  
  // Écrire le fichier
  const newEnvContent = updatedLines.join('\n');
  
  try {
    fs.writeFileSync(envPath, newEnvContent, 'utf8');
    console.log(`✅ Configuration .env sauvegardée avec succès: ${envPath}`);
    console.log('   Contenu sauvegardé:', newConfig);
  } catch (err) {
    console.error(`❌ Impossible d'écrire dans ${envPath}:`, err);
    console.error('   Vérifiez les permissions sur le fichier et le répertoire');
    console.error('   UID:', process.getuid ? process.getuid() : 'N/A');
    console.error('   GID:', process.getgid ? process.getgid() : 'N/A');
    throw err;
  }
  
  // Recharger les variables d'environnement
  try {
    dotenv.config({ path: envPath });
    console.log('✅ Variables d\'environnement rechargées');
    
    // Mettre à jour process.env avec les nouvelles valeurs
    Object.keys(newConfig).forEach(key => {
      if (typeof newConfig[key] === 'boolean') {
        process.env[key] = newConfig[key].toString();
      } else {
        process.env[key] = newConfig[key];
      }
    });
  } catch (err) {
    console.error('⚠️  Impossible de recharger dotenv:', err);
  }
}

// ============================================================================
// ROUTES API
// ============================================================================

// Routes d'authentification
app.use('/api', authRoutes);

// ============================================================================
// ROUTES DE BASE (Déjà fonctionnelles)
// ============================================================================

// Route principale - Redirige vers la page de login
app.get('/', (req, res) => {
  // Si déjà connecté, rediriger vers form-list
  if (req.session.user?.authenticated) {
    return res.redirect('/form-list.html');
  }
  res.sendFile(path.join(__dirname, '../frontend/views/login.html'));
});

// Route alternative pour /login.html
app.get('/login.html', (req, res) => {
  // Si déjà connecté, rediriger vers form-list
  if (req.session.user?.authenticated) {
    return res.redirect('/form-list.html');
  }
  res.sendFile(path.join(__dirname, '../frontend/views/login.html'));
});

// Routes protégées - Redirigent vers login si non authentifié
app.get('/form-list.html', requireAuthRedirect, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/views/form-list.html'));
});

app.get('/form.html', requireAuthRedirect, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/views/form.html'));
});

app.get('/pdf-list.html', requireAuthRedirect, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/views/pdf-list.html'));
});

app.get('/pdfs.html', requireAuthRedirect, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/views/pdf-list.html'));
});

app.get('/config.html', requireAuthRedirect, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/views/config.html'));
});

app.get('/logout.html', requireAuthRedirect, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/views/logout.html'));
});

// Route de health check (pour Docker)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Route pour lister les formulaires disponibles (temporaire)
app.get('/api/forms', requireAuthRedirect, (req, res) => {
  try {
    const formsDir = path.join(__dirname, FORMS_DIRECTORY);
    const files = fs.readdirSync(formsDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    
    const forms = files.map(file => ({
      id: path.parse(file).name,
      filename: file,
      path: `/api/forms/${path.parse(file).name}`
    }));
    
    res.json({ success: true, forms });
  } catch (error) {
    console.error('Erreur lors de la lecture des formulaires:', error);
    res.status(500).json({ success: false, error: 'Impossible de lister les formulaires' });
  }
});

// ============================================================================
// ROUTES API POUR LA CONFIGURATION
// ============================================================================

// GET /api/config - Lire la configuration PDF
app.get('/api/config', requireAuthRedirect, (req, res) => {
  try {
    const config = readEnvConfig();
    
    // Récupérer uniquement les clés PDF
    const pdfConfig = {
      PDF_TITLE: config.PDF_TITLE,
      PDF_FOOTER: config.PDF_FOOTER,
      PDF_INCLUDE_TIMESTAMP: config.PDF_INCLUDE_TIMESTAMP === 'true' || config.PDF_INCLUDE_TIMESTAMP === true,
      PDF_PAGE_SIZE: config.PDF_PAGE_SIZE,
      PDF_ORIENTATION: config.PDF_ORIENTATION
    };
    
    res.json({ 
      success: true, 
      config: pdfConfig 
    });
  } catch (error) {
    console.error('Erreur lors de la lecture de la configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Impossible de charger la configuration',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/config - Sauvegarder la configuration PDF
app.post('/api/config', requireAuthRedirect, (req, res) => {
  try {
    const { 
      PDF_TITLE, 
      PDF_FOOTER, 
      PDF_INCLUDE_TIMESTAMP, 
      PDF_PAGE_SIZE, 
      PDF_ORIENTATION 
    } = req.body;
    
    if (!PDF_TITLE || !PDF_FOOTER || !PDF_PAGE_SIZE || !PDF_ORIENTATION) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs de configuration sont requis'
      });
    }
    
    // Valider les valeurs
    const validPageSizes = ['A4', 'A5', 'Letter', 'Legal'];
    if (!validPageSizes.includes(PDF_PAGE_SIZE)) {
      return res.status(400).json({
        success: false,
        error: 'Taille de page invalide. Valeurs autorisées: A4, A5, Letter, Legal'
      });
    }
    
    const validOrientations = ['portrait', 'landscape'];
    if (!validOrientations.includes(PDF_ORIENTATION)) {
      return res.status(400).json({
        success: false,
        error: 'Orientation invalide. Valeurs autorisées: portrait, landscape'
      });
    }
    
    const newConfig = {
      PDF_TITLE,
      PDF_FOOTER,
      PDF_INCLUDE_TIMESTAMP: Boolean(PDF_INCLUDE_TIMESTAMP),
      PDF_PAGE_SIZE,
      PDF_ORIENTATION
    };
    
    // Sauvegarder la configuration
    saveEnvConfig(newConfig);
    
    res.json({ 
      success: true, 
      message: 'Configuration sauvegardée avec succès',
      config: newConfig
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Impossible de sauvegarder la configuration',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================================================
// ROUTES API POUR LA GESTION DES LOGOS
// ============================================================================

// GET /api/logos - Lister tous les logos disponibles
app.get('/api/logos', requireAuthRedirect, (req, res) => {
  try {
    const logosDir = path.join(__dirname, LOGO_STORAGE_PATH);
    
    if (!fs.existsSync(logosDir)) {
      return res.json({ success: true, logos: [] });
    }
    
    const logoFiles = fs.readdirSync(logosDir).filter(file => 
      ['.png', '.jpg', '.jpeg', '.svg'].includes(path.extname(file).toLowerCase())
    );
    
    const logos = logoFiles.map(file => ({
      id: path.parse(file).name,
      filename: file,
      url: `/api/logos/${file}`,
      path: file,
      size: fs.statSync(path.join(logosDir, file)).size
    }));
    
    res.json({ success: true, logos });
  } catch (error) {
    console.error('Erreur lors de la liste des logos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Impossible de lister les logos' 
    });
  }
});

// POST /api/logos/upload - Uploader un nouveau logo
app.post('/api/logos/upload', requireAuthRedirect, uploadLogo.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier logo téléchargé'
      });
    }
    
    const logosDir = path.join(__dirname, LOGO_STORAGE_PATH);
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(logosDir)) {
      fs.mkdirSync(logosDir, { recursive: true });
    }
    
    // Générer un nom de fichier unique pour éviter les conflits
    const timestamp = Date.now();
    const ext = path.extname(req.file.originalname).toLowerCase();
    const baseName = path.parse(req.file.originalname).name;
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${safeBaseName}_${timestamp}${ext}`;
    const filePath = path.join(logosDir, filename);
    
    // Sauvegarder le fichier
    fs.writeFileSync(filePath, req.file.buffer);
    
    console.log(`✅ Logo uploadé: ${filename}`);
    
    res.json({
      success: true,
      message: 'Logo téléchargé avec succès',
      logo: {
        id: path.parse(filename).name,
        filename: filename,
        url: `/api/logos/${filename}`,
        path: filename
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du logo:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de télécharger le logo',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/logos/:filename - Supprimer un logo
app.delete('/api/logos/:filename', requireAuthRedirect, (req, res) => {
  try {
    const { filename } = req.params;
    const logosDir = path.join(__dirname, LOGO_STORAGE_PATH);
    const filePath = path.join(logosDir, filename);
    
    // Vérifier que le chemin est valide et dans le répertoire des logos
    const normalizedPath = path.normalize(filePath);
    const normalizedLogsDir = path.normalize(logosDir);
    
    if (!normalizedPath.startsWith(normalizedLogsDir)) {
      return res.status(403).json({
        success: false,
        error: 'Accès interdit: chemin invalide'
      });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Logo non trouvé'
      });
    }
    
    // Supprimer le fichier
    fs.unlinkSync(filePath);
    
    console.log(`🗑️  Logo supprimé: ${filename}`);
    
    res.json({
      success: true,
      message: 'Logo supprimé avec succès',
      filename: filename
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du logo:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de supprimer le logo',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/logos/:filename - Servir un logo
app.get('/api/logos/:filename', requireAuthRedirect, (req, res) => {
  try {
    const { filename } = req.params;
    const logosDir = path.join(__dirname, LOGO_STORAGE_PATH);
    const filePath = path.join(logosDir, filename);
    
    // Vérifier que le chemin est valide
    const normalizedPath = path.normalize(filePath);
    const normalizedLogsDir = path.normalize(logosDir);
    
    if (!normalizedPath.startsWith(normalizedLogsDir)) {
      return res.status(403).json({
        success: false,
        error: 'Accès interdit: chemin invalide'
      });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Logo non trouvé'
      });
    }
    
    // Envoyer le fichier
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    res.contentType(contentType);
    res.sendFile(filePath);
  } catch (error) {
    console.error('Erreur lors du chargement du logo:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de charger le logo'
    });
  }
});

// ============================================================================
// FONCTIONS UTILITAIRES POUR LA PERSONNALISATION PDF (Solution 1)
// ============================================================================

/**
 * Valeurs par défaut pour les options PDF
 */
const DEFAULT_PDF_OPTIONS = {
  page: {
    size: 'A4',
    orientation: 'portrait',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    }
  },
  header: {
    logo: null,
    logo_position: 'top-left',
    logo_width: 100,
    logo_height: 50,
    title: null,
    title_font_size: 20,
    title_color: '#000000',
    subtitle: null,
    subtitle_font_size: 12,
    subtitle_color: '#666666'
  },
  introduction: {
    text: null,
    font_size: 12,
    color: '#333333',
    spacing_after: 1
  },
  custom_sections: [],
  footer: {
    text: null,
    font_size: 8,
    color: '#999999',
    align: 'center'
  },
  spacing: {
    between_fields: 0.5,
    after_header: 1,
    before_signature: 2
  },
  styles: {
    font_family: 'Helvetica',
    text_color: '#000000',
    title_color: '#000000'
  }
};

/**
 * Valide et normalise les options PDF avec des valeurs par défaut
 * @param {Object} pdfOptions - Options PDF du formulaire
 * @returns {Object} Options PDF validées et normalisées
 */
function validateAndNormalizePdfOptions(pdfOptions) {
  if (!pdfOptions || typeof pdfOptions !== 'object') {
    return DEFAULT_PDF_OPTIONS;
  }

  // Créer une copie profonde pour éviter de modifier l'original
  const normalized = JSON.parse(JSON.stringify(DEFAULT_PDF_OPTIONS));

  // Valider et fusionner la configuration de la page
  if (pdfOptions.page && typeof pdfOptions.page === 'object') {
    if (pdfOptions.page.size && ['A4', 'A5', 'Letter', 'Legal'].includes(pdfOptions.page.size)) {
      normalized.page.size = pdfOptions.page.size;
    }
    if (pdfOptions.page.orientation && ['portrait', 'landscape'].includes(pdfOptions.page.orientation)) {
      normalized.page.orientation = pdfOptions.page.orientation;
    }
    if (pdfOptions.page.margins && typeof pdfOptions.page.margins === 'object') {
      normalized.page.margins = {
        top: typeof pdfOptions.page.margins.top === 'number' && pdfOptions.page.margins.top >= 0 ? pdfOptions.page.margins.top : normalized.page.margins.top,
        bottom: typeof pdfOptions.page.margins.bottom === 'number' && pdfOptions.page.margins.bottom >= 0 ? pdfOptions.page.margins.bottom : normalized.page.margins.bottom,
        left: typeof pdfOptions.page.margins.left === 'number' && pdfOptions.page.margins.left >= 0 ? pdfOptions.page.margins.left : normalized.page.margins.left,
        right: typeof pdfOptions.page.margins.right === 'number' && pdfOptions.page.margins.right >= 0 ? pdfOptions.page.margins.right : normalized.page.margins.right
      };
    }
  }

  // Valider et fusionner l'en-tête
  if (pdfOptions.header && typeof pdfOptions.header === 'object') {
    if (typeof pdfOptions.header.logo === 'string') {
      normalized.header.logo = pdfOptions.header.logo;
    }
    if (pdfOptions.header.logo_position && ['top-left', 'top-center', 'top-right'].includes(pdfOptions.header.logo_position)) {
      normalized.header.logo_position = pdfOptions.header.logo_position;
    }
    if (typeof pdfOptions.header.logo_width === 'number' && pdfOptions.header.logo_width > 0) {
      normalized.header.logo_width = pdfOptions.header.logo_width;
    }
    if (typeof pdfOptions.header.logo_height === 'number' && pdfOptions.header.logo_height > 0) {
      normalized.header.logo_height = pdfOptions.header.logo_height;
    }
    if (typeof pdfOptions.header.title === 'string') {
      normalized.header.title = pdfOptions.header.title;
    }
    if (typeof pdfOptions.header.title_font_size === 'number' && pdfOptions.header.title_font_size > 0) {
      normalized.header.title_font_size = pdfOptions.header.title_font_size;
    }
    if (typeof pdfOptions.header.title_color === 'string') {
      normalized.header.title_color = pdfOptions.header.title_color;
    }
    if (typeof pdfOptions.header.subtitle === 'string') {
      normalized.header.subtitle = pdfOptions.header.subtitle;
    }
    if (typeof pdfOptions.header.subtitle_font_size === 'number' && pdfOptions.header.subtitle_font_size > 0) {
      normalized.header.subtitle_font_size = pdfOptions.header.subtitle_font_size;
    }
    if (typeof pdfOptions.header.subtitle_color === 'string') {
      normalized.header.subtitle_color = pdfOptions.header.subtitle_color;
    }
  }

  // Valider et fusionner l'introduction
  if (pdfOptions.introduction && typeof pdfOptions.introduction === 'object') {
    if (typeof pdfOptions.introduction.text === 'string') {
      normalized.introduction.text = pdfOptions.introduction.text;
    }
    if (typeof pdfOptions.introduction.font_size === 'number' && pdfOptions.introduction.font_size > 0) {
      normalized.introduction.font_size = pdfOptions.introduction.font_size;
    }
    if (typeof pdfOptions.introduction.color === 'string') {
      normalized.introduction.color = pdfOptions.introduction.color;
    }
    if (typeof pdfOptions.introduction.spacing_after === 'number' && pdfOptions.introduction.spacing_after >= 0) {
      normalized.introduction.spacing_after = pdfOptions.introduction.spacing_after;
    }
  }

  // Valider et fusionner les sections personnalisées
  if (Array.isArray(pdfOptions.custom_sections)) {
    normalized.custom_sections = pdfOptions.custom_sections.map(section => {
      const validatedSection = {};
      if (typeof section.type === 'string' && ['text', 'separator', 'image', 'spacing'].includes(section.type)) {
        validatedSection.type = section.type;
        if (section.content !== undefined) {
          validatedSection.content = section.content;
        }
        if (section.style && typeof section.style === 'object') {
          validatedSection.style = { ...section.style };
        }
        if (typeof section.width === 'number' && section.width > 0) {
          validatedSection.width = section.width;
        }
        if (typeof section.height === 'number' && section.height > 0) {
          validatedSection.height = section.height;
        }
        if (typeof section.align === 'string' && ['left', 'center', 'right'].includes(section.align)) {
          validatedSection.align = section.align;
        }
        if (typeof section.spacing_before === 'number' && section.spacing_before >= 0) {
          validatedSection.spacing_before = section.spacing_before;
        }
        if (typeof section.spacing_after === 'number' && section.spacing_after >= 0) {
          validatedSection.spacing_after = section.spacing_after;
        }
        if (typeof section.lines === 'number' && section.lines >= 0) {
          validatedSection.lines = section.lines;
        }
      }
      return validatedSection;
    }).filter(s => s.type); // Filtrer les sections invalides
  }

  // Valider et fusionner le pied de page
  if (pdfOptions.footer && typeof pdfOptions.footer === 'object') {
    if (typeof pdfOptions.footer.text === 'string') {
      normalized.footer.text = pdfOptions.footer.text;
    }
    if (typeof pdfOptions.footer.font_size === 'number' && pdfOptions.footer.font_size > 0) {
      normalized.footer.font_size = pdfOptions.footer.font_size;
    }
    if (typeof pdfOptions.footer.color === 'string') {
      normalized.footer.color = pdfOptions.footer.color;
    }
    if (typeof pdfOptions.footer.align === 'string' && ['left', 'center', 'right'].includes(pdfOptions.footer.align)) {
      normalized.footer.align = pdfOptions.footer.align;
    }
  }

  // Valider et fusionner les espacements
  if (pdfOptions.spacing && typeof pdfOptions.spacing === 'object') {
    if (typeof pdfOptions.spacing.between_fields === 'number' && pdfOptions.spacing.between_fields >= 0) {
      normalized.spacing.between_fields = pdfOptions.spacing.between_fields;
    }
    if (typeof pdfOptions.spacing.after_header === 'number' && pdfOptions.spacing.after_header >= 0) {
      normalized.spacing.after_header = pdfOptions.spacing.after_header;
    }
    if (typeof pdfOptions.spacing.before_signature === 'number' && pdfOptions.spacing.before_signature >= 0) {
      normalized.spacing.before_signature = pdfOptions.spacing.before_signature;
    }
  }

  // Valider et fusionner les styles globaux
  if (pdfOptions.styles && typeof pdfOptions.styles === 'object') {
    if (typeof pdfOptions.styles.font_family === 'string') {
      normalized.styles.font_family = pdfOptions.styles.font_family;
    }
    if (typeof pdfOptions.styles.text_color === 'string') {
      normalized.styles.text_color = pdfOptions.styles.text_color;
    }
    if (typeof pdfOptions.styles.title_color === 'string') {
      normalized.styles.title_color = pdfOptions.styles.title_color;
    }
  }

  return normalized;
}

// ============================================================================
// FONCTIONS DE RENDU PDF (Phase 4 - Solution 1)
// ============================================================================

/**
 * Résout les variables dans un texte
 * @param {string} text - Texte contenant des variables sous forme {variable}
 * @param {Object} formValues - Valeurs des champs du formulaire
 * @param {Object} context - Contexte supplémentaire (date, pageNumber, etc.)
 * @returns {string} Texte avec les variables remplacées
 */
function resolveVariables(text, formValues = {}, context = {}) {
  if (!text || typeof text !== 'string') {
    return text || '';
  }

  // Variables disponibles dans le contexte
  const date = new Date();
  const defaultContext = {
    date: date.toLocaleDateString('fr-FR'),
    time: date.toLocaleTimeString('fr-FR'),
    pageNumber: context.pageNumber || '',
    pageCount: context.pageCount || '',
    form_id: context.formId || '',
    form_title: context.formTitle || ''
  };

  // Fusionner contexte par défaut avec le contexte fourni
  const fullContext = { ...defaultContext, ...context };

  // Remplacer les variables de contexte
  let resolved = text;
  Object.keys(fullContext).forEach(key => {
    const regex = new RegExp(`\{${key}\}`, 'g');
    resolved = resolved.replace(regex, fullContext[key]);
  });

  // Remplacer les variables de champs du formulaire
  Object.keys(formValues).forEach(key => {
    const regex = new RegExp(`\{${key}\}`, 'g');
    const value = formValues[key] !== undefined && formValues[key] !== null ? formValues[key] : '';
    resolved = resolved.replace(regex, value);
  });

  return resolved;
}

/**
 * Calcule la position X pour le logo en fonction de son positionnement
 * @param {PDFDocument} doc - Document PDFKit
 * @param {number} width - Largeur du logo
 * @param {string} position - Position: 'top-left', 'top-center', 'top-right'
 * @returns {number} Position X
 */
function getLogoXPosition(doc, width, position) {
  const margins = doc._margins || { left: 50, right: 50 };
  const pageWidth = doc.page.width - margins.left - margins.right;

  switch (position) {
    case 'top-right':
      return pageWidth - width;
    case 'top-center':
      return (pageWidth - width) / 2;
    case 'top-left':
    default:
      return 0;
  }
}

/**
 * Rend l'en-tête du PDF (logo, titre, sous-titre)
 * @param {PDFDocument} doc - Document PDFKit
 * @param {Object} pdfOptions - Options PDF validées
 * @param {Object} formValues - Valeurs des champs du formulaire
 * @param {Object} context - Contexte supplémentaire
 */
function renderHeader(doc, pdfOptions, formValues = {}, context = {}) {
  const header = pdfOptions.header || {};

  // Logo
  if (header.logo) {
    try {
      let logoBuffer = null;
      let width = header.logo_width || 100;
      let height = header.logo_height || 50;
      let position = header.logo_position || 'top-left';
      
      // Gérer les chemins /static/logos/ qui pointent vers LOGO_STORAGE_PATH
      if (header.logo.startsWith('/static/logos/')) {
        const logoFilename = path.basename(header.logo);
        const logoStoragePath = path.join(__dirname, LOGO_STORAGE_PATH, logoFilename);
        
        console.log(`🔍 Cherche logo: ${header.logo} -> ${logoStoragePath}`);
        if (fs.existsSync(logoStoragePath)) {
          console.log(`✅ Logo trouvé: ${logoStoragePath}`);
          logoBuffer = fs.readFileSync(logoStoragePath);
        } else {
          console.warn(`⚠️  Logo non trouvé à: ${logoStoragePath}`);
        }
      } else {
        // Ancienne méthode pour compatibilité
        const logoPath = path.join(__dirname, '../frontend/public', header.logo);
        const normalizedPath = path.normalize(logoPath);
        const basePath = path.normalize(path.join(__dirname, '../frontend/public'));
        
        if (normalizedPath.startsWith(basePath) && fs.existsSync(normalizedPath)) {
          logoBuffer = fs.readFileSync(normalizedPath);
        }
      }
      
      if (logoBuffer) {
        const x = getLogoXPosition(doc, width, position);
        doc.image(logoBuffer, x, doc.y, { width, height });
        
        // Déplacer le curseur en dessous du logo
        const logoBottom = doc.y + height;
        doc.y = logoBottom;
        doc.moveDown();
      } else {
        console.warn('⚠️  Logo non trouvé:', header.logo);
      }
    } catch (err) {
      console.warn('⚠️  Impossible de charger le logo:', err.message);
    }
  }

  // Titre
  const title = resolveVariables(
    header.title || context.formTitle || 'Form2Sign',
    formValues,
    context
  );
  if (title) {
    doc.fontSize(header.title_font_size || 20)
       .font('Helvetica-Bold')
       .fillColor(header.title_color || '#000000')
       .text(title, { align: 'center' });
    doc.moveDown();
  }

  // Sous-titre
  const subtitle = resolveVariables(
    header.subtitle || '',
    formValues,
    context
  );
  if (subtitle) {
    doc.fontSize(header.subtitle_font_size || 12)
       .font('Helvetica')
       .fillColor(header.subtitle_color || '#666666')
       .text(subtitle, { align: 'center' });
    doc.moveDown();
  }

  // Espacement après l'en-tête
  const spacing = header.spacing?.after_header || pdfOptions.spacing?.after_header || 1;
  for (let i = 0; i < spacing; i++) {
    doc.moveDown();
  }
}

/**
 * Rend le texte d'introduction
 * @param {PDFDocument} doc - Document PDFKit
 * @param {Object} pdfOptions - Options PDF validées
 * @param {Object} formValues - Valeurs des champs du formulaire
 * @param {Object} context - Contexte supplémentaire
 */
function renderIntroduction(doc, pdfOptions, formValues = {}, context = {}) {
  const introduction = pdfOptions.introduction || {};
  
  if (!introduction.text) {
    return;
  }

  // Résoudre les variables et les sauts de ligne
  const text = resolveVariables(introduction.text, formValues, context);
  
  // Appliquer le style
  doc.fontSize(introduction.font_size || 12)
     .font('Helvetica')
     .fillColor(introduction.color || '#333333');

  // Gérer les sauts de ligne (\n → nouvelle ligne)
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    if (index > 0) {
      doc.moveDown();
    }
    if (line.trim()) {
      doc.text(line.trim(), { align: 'left' });
    }
  });

  // Espacement après l'introduction
  const spacing = introduction.spacing_after || pdfOptions.spacing?.after_header || 1;
  for (let i = 0; i < spacing; i++) {
    doc.moveDown();
  }
}

/**
 * Rend une section personnalisée de type 'separator'
 * @param {PDFDocument} doc - Document PDFKit
 * @param {Object} section - Configuration de la section
 * @param {number} pageWidth - Largeur de la page (sans marges)
 */
function renderSeparator(doc, section, pageWidth) {
  const color = section.color || '#000000';
  const width = section.width || 1;
  const style = section.style || 'solid';

  doc.save();
  doc.strokeColor(color);
  doc.lineWidth(width);
  
  if (style === 'dashed') {
    doc.dash(5, { space: 5 });
  } else if (style === 'dotted') {
    doc.dash(2, { space: 3 });
  }
  
  const startX = section.align === 'right' ? pageWidth - 100 : 
                section.align === 'center' ? pageWidth / 2 - 50 : 
                0;
  
  doc.moveTo(startX, doc.y)
     .lineTo(startX + (section.length || pageWidth), doc.y)
     .stroke();
  
  doc.restore();
  doc.moveDown();
}

/**
 * Rend une section personnalisée de type 'text'
 * @param {PDFDocument} doc - Document PDFKit
 * @param {Object} section - Configuration de la section
 * @param {Object} formValues - Valeurs des champs du formulaire
 * @param {Object} context - Contexte supplémentaire
 */
function renderTextSection(doc, section, formValues = {}, context = {}) {
  const text = resolveVariables(section.content || '', formValues, context);
  const fontSize = section.font_size || 12;
  const color = section.color || '#000000';
  const align = section.align || 'left';
  const bold = section.bold || false;
  const italic = section.italic || false;

  doc.fontSize(fontSize)
     .fillColor(color);

  if (bold && italic) {
    doc.font('Helvetica-BoldOblique');
  } else if (bold) {
    doc.font('Helvetica-Bold');
  } else if (italic) {
    doc.font('Helvetica-Oblique');
  } else {
    doc.font('Helvetica');
  }

  doc.text(text, { align });
  
  // Espacement après
  if (section.spacing_after) {
    for (let i = 0; i < section.spacing_after; i++) {
      doc.moveDown();
    }
  }
}

/**
 * Rend une section personnalisée de type 'image'
 * @param {PDFDocument} doc - Document PDFKit
 * @param {Object} section - Configuration de la section
 */
function renderImageSection(doc, section) {
  try {
    // Protéger contre le path traversal
    const imagePath = path.join(__dirname, '../frontend/public', section.src);
    const normalizedPath = path.normalize(imagePath);
    
    const basePath = path.normalize(path.join(__dirname, '../frontend/public'));
    if (!normalizedPath.startsWith(basePath)) {
      console.warn('⚠️  Chemin de l\'image potentiellement dangereux, image ignorée');
      return;
    }
    
    if (!fs.existsSync(normalizedPath)) {
      console.warn(`⚠️  Image non trouvée: ${normalizedPath}`);
      return;
    }

    const imageBuffer = fs.readFileSync(normalizedPath);
    const width = section.width || 200;
    const height = section.height || 100;
    const align = section.align || 'center';

    const margins = doc._margins || { left: 50, right: 50 };
  const pageWidth = doc.page.width - margins.left - margins.right;
    let x = 0;
    
    if (align === 'center') {
      x = (pageWidth - width) / 2;
    } else if (align === 'right') {
      x = pageWidth - width;
    }

    doc.image(imageBuffer, x, doc.y, { width, height });
    doc.moveTo(x, doc.y + height);
    doc.moveDown();
    
    // Espacement après
    if (section.spacing_after) {
      for (let i = 0; i < section.spacing_after; i++) {
        doc.moveDown();
      }
    }
  } catch (err) {
    console.warn('⚠️  Impossible de charger l\'image:', err.message);
    doc.moveDown();
  }
}

/**
 * Rend une section personnalisée de type 'spacing'
 * @param {PDFDocument} doc - Document PDFKit
 * @param {Object} section - Configuration de la section
 */
function renderSpacingSection(doc, section) {
  const lines = section.lines || section.height || 1;
  for (let i = 0; i < lines; i++) {
    doc.moveDown();
  }
}

/**
 * Rend toutes les sections personnalisées
 * @param {PDFDocument} doc - Document PDFKit
 * @param {Object} pdfOptions - Options PDF validées
 * @param {Object} formValues - Valeurs des champs du formulaire
 * @param {Object} context - Contexte supplémentaire
 */
function renderCustomSections(doc, pdfOptions, formValues = {}, context = {}) {
  const sections = pdfOptions.custom_sections || [];
  
  if (sections.length === 0) {
    return;
  }

  const margins = doc._margins || { left: 50, right: 50 };
  const pageWidth = doc.page.width - margins.left - margins.right;

  sections.forEach(section => {
    // Espacement avant la section
    if (section.spacing_before) {
      for (let i = 0; i < section.spacing_before; i++) {
        doc.moveDown();
      }
    }

    switch (section.type) {
      case 'text':
        renderTextSection(doc, section, formValues, context);
        break;
      case 'separator':
        renderSeparator(doc, section, pageWidth);
        break;
      case 'image':
        renderImageSection(doc, section);
        break;
      case 'spacing':
        renderSpacingSection(doc, section);
        break;
      default:
        console.warn(`⚠️  Type de section inconnu: ${section.type}`);
    }
  });
}

/**
 * Rend le pied de page avec pagination
 * @param {PDFDocument} doc - Document PDFKit
 * @param {Object} pdfOptions - Options PDF validées
 * @param {number} pageNumber - Numéro de page actuel
 * @param {number} pageCount - Nombre total de pages
 * @param {Object} formValues - Valeurs des champs du formulaire
 * @param {Object} context - Contexte supplémentaire
 */
function renderFooter(doc, pdfOptions, pageNumber, pageCount, formValues = {}, context = {}) {
  const footer = pdfOptions.footer || {};
  
  if (!footer.text && !footer.show_pagination) {
    return;
  }

  // Sauvegarder la position actuelle
  const originalY = doc.y;
  const originalFontSize = doc._fontSize || 12;
  const originalFont = doc._font || 'Helvetica';
  const originalColor = doc._fillColor || '#000000';
  
  // Valider que originalFont est une police PDF valide
  const validFonts = ['Helvetica', 'Helvetica-Bold', 'Helvetica-Oblique', 'Helvetica-BoldOblique', 'Times-Roman', 'Times-Bold', 'Times-Italic', 'Times-BoldItalic', 'Courier', 'Courier-Bold', 'Courier-Oblique', 'Courier-BoldOblique', 'Symbol', 'ZapfDingbats'];
  const safeOriginalFont = validFonts.includes(originalFont) ? originalFont : 'Helvetica';

  // Se positionner en bas de page
  const margins = doc._margins || { bottom: 50 };
  const pageHeight = doc.page.height;
  doc.y = pageHeight - margins.bottom + 10;

  // Prépare le contexte avec la pagination
  const footerContext = {
    ...context,
    pageNumber: pageNumber,
    pageCount: pageCount
  };

  // Construire le texte du footer
  let footerText = '';
  
  if (footer.text) {
    footerText = resolveVariables(footer.text, formValues, footerContext);
  }

  // Ajouter la pagination si demandée
  if (footer.show_pagination !== false) {
    let paginationText = footer.pagination_format || 'Page {pageNumber} / {pageCount}';
    
    // Si pageCount est inconnu (0 ou non défini), utiliser un format simplifié
    if (!pageCount || pageCount <= 1) {
      paginationText = paginationText.replace('/ {pageCount}', '').replace(' sur {pageCount}', '');
    }
    
    const resolvedPagination = resolveVariables(paginationText, {}, footerContext);
    
    if (footerText) {
      footerText = `${footerText} | ${resolvedPagination}`;
    } else {
      footerText = resolvedPagination;
    }
  }

  if (footerText) {
    // Valider la police du footer
    const footerFont = footer.font || 'Helvetica';
    const safeFooterFont = validFonts.includes(footerFont) ? footerFont : 'Helvetica';
    
    doc.fontSize(footer.font_size || 8)
       .font(safeFooterFont)
       .fillColor(footer.color || '#999999');

    const align = footer.align || 'center';
    const margins = doc._margins || { left: 50, right: 50 };
    const width = doc.page.width - margins.left - margins.right;
    
    doc.text(footerText, { align, width });
  }

  // Restaurer la position et le style
  doc.y = originalY;
  doc.fontSize(originalFontSize);
  doc.font(safeOriginalFont);
  doc.fillColor(originalColor);
}

// ============================================================================
// ROUTES POUR LES FORMULAIRES
// ============================================================================

// Route pour charger un formulaire spécifique par son ID
app.get('/api/forms/:id', requireAuthRedirect, (req, res) => {
  try {
    const formId = req.params.id;
    const formsDir = path.join(__dirname, FORMS_DIRECTORY);
    
    // Trouver le fichier YAML correspondant
    const yamlFiles = fs.readdirSync(formsDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    const formFile = yamlFiles.find(file => path.parse(file).name === formId);
    
    if (!formFile) {
      return res.status(404).json({ 
        success: false, 
        error: 'Formulaire non trouvé' 
      });
    }
    
    // Lire et parser le fichier YAML
    const filePath = path.join(formsDir, formFile);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const formData = yaml.load(fileContent);
    
    // Extraire les données du formulaire
    const form = formData.form || formData;
    
    // Valider et normaliser les options PDF avec des valeurs par défaut
    const pdfOptions = validateAndNormalizePdfOptions(form.pdf);
    
    res.json({ 
      success: true, 
      form: {
        id: form.id || formId,
        title: form.title || formId,
        description: form.description || '',
        fields: form.fields || [],
        signature: form.signature || { required: true, label: 'Signature', instructions: 'Signez ici' },
        style: form.style || {},
        pdf: pdfOptions
      }
    });
  } catch (error) {
    console.error('Erreur lors du chargement du formulaire:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Impossible de charger le formulaire',
      message: NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// POST /api/forms/upload - Upload d'un nouveau formulaire
app.post('/api/forms/upload', requireAuthRedirect, upload.single('formFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier telecharge'
      });
    }

    const fileContent = req.file.buffer.toString('utf8');
    const formData = yaml.load(fileContent);
    
    if (!formData || !formData.form) {
      return res.status(400).json({
        success: false,
        error: 'Fichier YAML invalide - doit contenir une cle "form"'
      });
    }

    const formId = formData.form.id;
    if (!formId) {
      return res.status(400).json({
        success: false,
        error: 'Le formulaire doit avoir un identifiant (id)'
      });
    }

    // Verifier que l'id est unique
    const formsDir = path.join(__dirname, FORMS_DIRECTORY);
    const yamlFiles = fs.readdirSync(formsDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    const existingForm = yamlFiles.find(file => path.parse(file).name === formId);
    
    if (existingForm) {
      return res.status(409).json({
        success: false,
        error: `Un formulaire avec l\'id "${formId}" existe deja`
      });
    }

    // Sauvegarder le fichier
    const filename = `${formId}.yaml`;
    const filePath = path.join(formsDir, filename);
    fs.writeFileSync(filePath, req.file.buffer);

    console.log(`✅ Formulaire uploadé: ${filename}`);
    
    res.json({
      success: true,
      message: 'Formulaire téléchargé avec succès',
      form: {
        id: formId,
        title: formData.form.title || formId,
        filename: filename
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du formulaire:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de télécharger le formulaire',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/forms/:id - Supprimer un formulaire
app.delete('/api/forms/:id', requireAuthRedirect, (req, res) => {
  try {
    const formId = req.params.id;
    const formsDir = path.join(__dirname, FORMS_DIRECTORY);
    
    // Trouver le fichier correspondant
    const yamlFiles = fs.readdirSync(formsDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
    const formFile = yamlFiles.find(file => path.parse(file).name === formId);
    
    if (!formFile) {
      return res.status(404).json({
        success: false,
        error: 'Formulaire non trouvé'
      });
    }
    
    // Supprimer le fichier
    const filePath = path.join(formsDir, formFile);
    fs.unlinkSync(filePath);
    
    console.log(`🗑️  Formulaire supprimé: ${formFile}`);
    
    res.json({
      success: true,
      message: 'Formulaire supprimé avec succès',
      formId: formId
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du formulaire:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de supprimer le formulaire',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/generate-pdf - Generer un PDF a partir des donnees du formulaire
app.post('/api/generate-pdf', requireAuth, async (req, res) => {
  try {
    const { formId, formTitle, signature, ...formValues } = req.body;
    
    if (!formId) {
      return res.status(400).json({
        success: false,
        error: 'L\'identifiant du formulaire est requis'
      });
    }
    
    // Charger le formulaire complet pour accéder aux options PDF
    let formData = null;
    let fieldsOrder = [];
    let formPdfOptions = DEFAULT_PDF_OPTIONS;
    
    try {
      const formsDir = path.join(__dirname, FORMS_DIRECTORY);
      const yamlFiles = fs.readdirSync(formsDir).filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));
      const formFile = yamlFiles.find(file => path.parse(file).name === formId);
      
      if (formFile) {
        const filePath = path.join(formsDir, formFile);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        formData = yaml.load(fileContent);
        const form = formData.form || formData;
        
        if (form.fields && Array.isArray(form.fields)) {
          fieldsOrder = form.fields.map(field => field.id);
        }
        
        // Valider et normaliser les options PDF du formulaire
        formPdfOptions = validateAndNormalizePdfOptions(form.pdf);
      }
    } catch (err) {
      console.warn('Impossible de charger le formulaire:', err.message);
    }
    
    // Configuration PDF par défaut (peut être écrasée par les options du formulaire)
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '_'); // yyyy_mm_dd
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeStr = hours + minutes + seconds; // hhmmss
    const filename = `${dateStr}_${timeStr}_${formId}.pdf`;
    
    // Contexte pour la substitution de variables
    const context = {
      formId: formId,
      formTitle: formTitle || formData?.form?.title || formId,
      date: now.toLocaleDateString('fr-FR'),
      time: now.toLocaleTimeString('fr-FR')
    };
    
    const filePath = path.join(__dirname, PDF_STORAGE_PATH, filename);
    
    // Creer le document PDF avec les options personnalisées du formulaire
    const PDFDocument = require('pdfkit');
    
    // Utiliser les marges personnalisées si définies
    const margins = formPdfOptions.page?.margins || { top: 50, left: 50, right: 50, bottom: 50 };
    const pageSize = formPdfOptions.page?.size || 'A4';
    const pageOrientation = formPdfOptions.page?.orientation || 'portrait';
    
    const doc = new PDFDocument({
      size: pageSize,
      layout: pageOrientation,
      margins: margins
    });
    
    // Définir les métadonnées du PDF
    const resolvedTitle = resolveVariables(
      formPdfOptions.header?.title || context.formTitle || 'Form2Sign',
      formValues,
      context
    );
    doc.info['Title'] = resolvedTitle;
    
    // Creer un stream vers le fichier
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    // Suivi de la pagination
    let pageCount = 0;
    
    // Compter les pages
    doc.on('pageAdded', () => {
      pageCount++;
    });
    
    // Rendre l'en-tête
    renderHeader(doc, formPdfOptions, formValues, context);
    
    // Rendre l'introduction
    renderIntroduction(doc, formPdfOptions, formValues, context);
    
    // Afficher les champs dans l'ordre défini dans le formulaire
    const displayKeys = fieldsOrder.length > 0 ? fieldsOrder : Object.keys(formValues);
    const spacingBetweenFields = formPdfOptions.spacing?.between_fields || 0.5;
    
    doc.fontSize(formPdfOptions.styles?.font_size || 12)
       .font(formPdfOptions.styles?.font_family || 'Helvetica')
       .fillColor(formPdfOptions.styles?.text_color || '#000000');
    
    displayKeys.forEach(key => {
      if (formValues[key] !== undefined) {
        const value = formValues[key];
        doc.text(`${key}: ${value || 'N/A'}`);
        doc.moveDown(spacingBetweenFields);
      }
    });
    
    // Espacement avant les sections personnalisées
    if (formPdfOptions.custom_sections && formPdfOptions.custom_sections.length > 0) {
      const spacingBefore = formPdfOptions.spacing?.before_signature || 1;
      for (let i = 0; i < spacingBefore; i++) {
        doc.moveDown();
      }
      
      // Rendre les sections personnalisées (avant la signature)
      renderCustomSections(doc, formPdfOptions, formValues, context);
    }
    
    // Espacement avant la signature
    const spacingBeforeSignature = formPdfOptions.spacing?.before_signature || 2;
    for (let i = 0; i < spacingBeforeSignature; i++) {
      doc.moveDown();
    }
    
    // Separateur avant la signature
    doc.moveTo(margins.left, doc.y).lineTo(doc.page.width - margins.right, doc.y).stroke();
    doc.moveDown();
    
    // Section Signature
    doc.fontSize(14).font('Helvetica-Bold').text('Signature:', { underline: true });
    doc.moveDown();
    
    if (signature) {
      // La signature est en base64 (data URL)
      // Extraire la partie base64 de la data URL
      let base64Data = signature.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      
      try {
        // Decoder l'image de la signature
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Ajouter l'image de signature au PDF
        // Redimensionner pour s'adapter a la page - taille réduite pour éviter de couvrir toute la page
        const sigWidth = 200;
        const sigHeight = 60;
        const pageWidth = doc.page.width - margins.left - margins.right;
        const x = (pageWidth - sigWidth) / 2;
        
        // Ajouter l'image de signature directement
        doc.image(imageBuffer, x, doc.y, { width: sigWidth, height: sigHeight });
        
        doc.moveDown(2);
      } catch (err) {
        console.warn('Impossible de decoder la signature:', err);
        doc.fontSize(12).text('Signature: Impossible d\'afficher la signature');
        doc.moveDown();
      }
    } else {
      doc.fontSize(12).text('Aucune signature fournie');
      doc.moveDown();
    }
    
    // Rendre le footer sur la dernière page (avec le bon nombre total de pages)
    if (formPdfOptions.footer && formPdfOptions.footer.text && pageCount > 0) {
      renderFooter(doc, formPdfOptions, pageCount, pageCount, formValues, context);
    }
    
    // Finaliser le PDF
    doc.end();
    
    // Attendre que le stream soit termine
    await new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log(`✅ PDF genere: ${filename}`);
        resolve();
      });
      stream.on('error', (err) => {
        console.error('Erreur lors de l\'ecriture du PDF:', err);
        reject(err);
      });
    });
    
    // Retourner le chemin du PDF pour telechargement
    res.json({
      success: true,
      message: 'PDF genere avec succes',
      pdfUrl: `/api/pdfs/download/${filename}`,
      filename: filename,
      formId: formId
    });
    
  } catch (error) {
    console.error('Erreur lors de la generation du PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Impossible de generer le PDF',
      message: NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route pour lister les PDFs generes
app.get('/api/pdfs', requireAuth, (req, res) => {
  try {
    const pdfsDir = path.join(__dirname, PDF_STORAGE_PATH);
    
    // Lister tous les PDFs dans le repertoire
    const pdfs = [];
    const pdfFiles = fs.readdirSync(pdfsDir).filter(file => file.endsWith('.pdf'));
    
    pdfFiles.forEach(pdfFile => {
      const filePath = path.join(pdfsDir, pdfFile);
      const stat = fs.statSync(filePath);
      
      // Extraire le formId et la date complète du nom de fichier
      // Format: yyyy_mm_dd_hhmmss_formId.pdf
      const parts = path.parse(pdfFile).name.split('_');
      // Le formId est tout ce qui vient après les 4 premiers éléments (yyyy, mm, dd, hhmmss)
      const formId = parts.slice(4).join('_') || 'unknown';
      const formTitle = formId;
      
      // Extraire la date complète pour le tri (yyyy-mm-ddThh:mm:ss)
      const yyyy = parts[0];
      const mm = parts[1];
      const dd = parts[2];
      const hhmmss = parts[3];
      const hh = hhmmss.substring(0, 2);
      const minutes = hhmmss.substring(2, 4);
      const ss = hhmmss.substring(4, 6);
      const fullDateStr = `${yyyy}-${mm}-${dd}T${hh}:${minutes}:${ss}`;
      
      pdfs.push({
        id: path.parse(pdfFile).name,
        filename: pdfFile,
        formId: formId,
        formTitle: formTitle,
        date: '',
        fullDate: fullDateStr,
        size: stat.size,
        downloadUrl: `/api/pdfs/download/${pdfFile}`,
        viewUrl: `/api/pdfs/view/${pdfFile}`
      });
    });
    
    // Trier par date complete (la plus recente en premier)
    pdfs.sort((a, b) => new Date(b.fullDate) - new Date(a.fullDate));
    
    res.json({ success: true, pdfs });
  } catch (error) {
    console.error('Erreur lors de la lecture des PDFs:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Impossible de lister les PDFs' 
    });
  }
});

// Route pour supprimer un PDF
app.delete('/api/pdfs/:id', requireAuth, (req, res) => {
  try {
    const pdfId = req.params.id;
    const pdfsDir = path.join(__dirname, PDF_STORAGE_PATH);
    
    // Rechercher le PDF dans le repertoire
    let pdfFound = false;
    const pdfFiles = fs.readdirSync(pdfsDir);
    
    for (const pdfFile of pdfFiles) {
      if (path.parse(pdfFile).name === pdfId) {
        const pdfPath = path.join(pdfsDir, pdfFile);
        fs.unlinkSync(pdfPath);
        pdfFound = true;
        
        res.json({ success: true, message: 'PDF supprime avec succes' });
        return;
      }
    }
    
    if (!pdfFound) {
      res.status(404).json({ 
        success: false, 
        error: 'PDF non trouve' 
      });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Impossible de supprimer le PDF' 
    });
  }
});

// Route pour telecharger un PDF
app.get('/api/pdfs/download/:filename', requireAuth, (req, res) => {
  try {
    const { filename } = req.params;
    const pdfPath = path.join(__dirname, PDF_STORAGE_PATH, filename);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'PDF non trouve' 
      });
    }
    
    res.download(pdfPath, filename);
  } catch (error) {
    console.error('Erreur lors du telechargement du PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Impossible de telecharger le PDF' 
    });
  }
});

// Route pour visualiser un PDF
app.get('/api/pdfs/view/:filename', requireAuth, (req, res) => {
  try {
    const { filename } = req.params;
    const pdfPath = path.join(__dirname, PDF_STORAGE_PATH, filename);
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'PDF non trouve' 
      });
    }
    
    // Envoyer le PDF pour visualisation dans le navigateur
    const file = fs.readFileSync(pdfPath);
    res.contentType('application/pdf');
    res.send(file);
  } catch (error) {
    console.error('Erreur lors de la visualisation du PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Impossible de visualiser le PDF' 
    });
  }
});

// ============================================================================
// GESTION DES ERREURS
// ============================================================================

// Middleware pour les routes non trouvees
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route non trouvée',
    path: req.path
  });
});

// Middleware pour la gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Erreur serveur interne',
    message: NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================================
// DEMARRAGE DU SERVEUR
// ============================================================================

// Demarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║        🚀 Form2Sign - Serveur démarré avec succès          ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📌 Environnement: ${NODE_ENV}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔒 Auth: Utilisez les identifiants du fichier .env`);
  console.log('');
  console.log('📁 Répertoires:');
  console.log(`   - Formulaires: ${path.join(__dirname, FORMS_DIRECTORY)}`);
  console.log(`   - PDFs: ${path.join(__dirname, PDF_STORAGE_PATH)}`);
  console.log('');
  console.log('✨ Prêt à recevoir des connexions !');
  console.log('');
});

// Export de l'application pour les tests
module.exports = app;
