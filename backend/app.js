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
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  Fichier .env non trouvé. Utilisation des variables par défaut.');
  dotenv.config();
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

// Creer les repertoires s'ils n'existent pas
const directories = [
  PDF_STORAGE_PATH,
  FORMS_DIRECTORY,
  path.join(PDF_STORAGE_PATH, new Date().toISOString().split('T')[0])
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

// Configuration de multer pour l'upload de fichiers
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
const { requireAuthRedirect } = require('./middlewares/authMiddleware');

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
    
    res.json({ 
      success: true, 
      form: {
        id: form.id || formId,
        title: form.title || formId,
        description: form.description || '',
        fields: form.fields || [],
        signature: form.signature || { required: true, label: 'Signature', instructions: 'Signez ici' },
        style: form.style || {},
        pdf: form.pdf || {}
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

// Route pour lister les PDFs generes
app.get('/api/pdfs', requireAuthRedirect, (req, res) => {
  try {
    const pdfsDir = path.join(__dirname, PDF_STORAGE_PATH);
    
    // Lister tous les PDFs dans les sous-repertoires
    const pdfs = [];
    const dates = fs.readdirSync(pdfsDir);
    
    dates.forEach(date => {
      const dateDir = path.join(pdfsDir, date);
      if (fs.existsSync(dateDir) && fs.statSync(dateDir).isDirectory()) {
        const pdfFiles = fs.readdirSync(dateDir).filter(file => file.endsWith('.pdf'));
        
        pdfFiles.forEach(pdfFile => {
          const pdfPath = path.join(dateDir, pdfFile);
          const stat = fs.statSync(pdfPath);
          
          // Extraire le formId et formTitle du nom de fichier
          // Format: formId_formTitle_timestamp.pdf
          const parts = path.parse(pdfFile).name.split('_');
          const formId = parts[0] || 'unknown';
          const formTitle = parts.slice(1, -1).join('_') || formId;
          
          pdfs.push({
            id: path.parse(pdfFile).name,
            filename: pdfFile,
            formId: formId,
            formTitle: formTitle,
            date: date,
            size: stat.size,
            downloadUrl: `/api/pdfs/download/${date}/${pdfFile}`,
            viewUrl: `/api/pdfs/view/${date}/${pdfFile}`
          });
        });
      }
    });
    
    // Trier par date (la plus recente en premier)
    pdfs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
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
app.delete('/api/pdfs/:id', requireAuthRedirect, (req, res) => {
  try {
    const pdfId = req.params.id;
    const pdfsDir = path.join(__dirname, PDF_STORAGE_PATH);
    
    // Rechercher le PDF dans les sous-repertoires
    let pdfFound = false;
    const dates = fs.readdirSync(pdfsDir);
    
    for (const date of dates) {
      const dateDir = path.join(pdfsDir, date);
      if (fs.existsSync(dateDir) && fs.statSync(dateDir).isDirectory()) {
        const pdfFiles = fs.readdirSync(dateDir);
        
        for (const pdfFile of pdfFiles) {
          if (path.parse(pdfFile).name === pdfId) {
            const pdfPath = path.join(dateDir, pdfFile);
            fs.unlinkSync(pdfPath);
            pdfFound = true;
            
            // Nettoyer le repertoire de date s'il est vide
            if (fs.readdirSync(dateDir).length === 0) {
              fs.rmdirSync(dateDir);
            }
            
            res.json({ success: true, message: 'PDF supprime avec succes' });
            return;
          }
        }
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
app.get('/api/pdfs/download/:date/:filename', requireAuthRedirect, (req, res) => {
  try {
    const { date, filename } = req.params;
    const pdfPath = path.join(__dirname, PDF_STORAGE_PATH, date, filename);
    
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
app.get('/api/pdfs/view/:date/:filename', requireAuthRedirect, (req, res) => {
  try {
    const { date, filename } = req.params;
    const pdfPath = path.join(__dirname, PDF_STORAGE_PATH, date, filename);
    
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
