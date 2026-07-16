# Journal de Developpement - Form2Sign

## 📅 Chronologie du Projet

---

### 16/07/2026 - Initialisation du Projet (Phase 0)
- **Phase 0** : Creation de la structure complete du projet
- Creation de l'arborescence des dossiers (backend, frontend, config, etc.)
- Creation du fichier `package.json` avec toutes les dependances
- Creation des fichiers de configuration Docker :
  - `Dockerfile` (multi-stage build avec Node.js 20-alpine)
  - `docker-compose.yml` (avec services app et app-dev)
  - `.dockerignore`
- Creation des fichiers de documentation :
  - `README.md` (guide complet d'installation et utilisation)
  - `DEV_LOG.md` (ce fichier)
- Creation des fichiers de configuration Git :
  - `.gitignore`
- **Problemes rencontrés** : Aucun pour l'instant
- **Statut** : ✅ Termine

---

### 16/07/2026 - Authentification (Phase 1)
- **Phase 1** : Implementation du systeme d'authentification
- Configuration de express-session avec cookies securises
- Hash des mots de passe avec bcrypt (10 rounds)
- Auto-hashage du mot de passe au premier demarrage
- Creation des routes :
  - POST /api/login
  - GET /api/logout
  - GET /api/auth/status
- Creation des controleurs :
  - `authController.js`
- Creation du middleware d'authentification :
  - `authMiddleware.js`
- Integration dans app.js :
  - Montage des routes /api
  - Protection des routes frontales (form-list.html, form.html, pdf-list.html)
  - Protection de l'API /api/forms
  - Redirection automatique si deja connecte
- Page frontend existante :
  - `frontend/views/login.html` (deja presente)
- **Problemes rencontrés** : Aucun - implementation fluide
- **Statut** : ✅ Termine

---

### 16/07/2026 - Formulaires Dynamiques (Phase 2)
- **Phase 2** : Parsing YAML et rendu frontend
- Implementation directe dans app.js (sans service separat pour l'instant)
- Implementation des endpoints API :
  - GET /api/forms (liste des formulaires)
  - GET /api/forms/:id (details d'un formulaire) - **FIX 1**: Ajoute pour resoudre "Route non trouvee"
- Utilisation de js-yaml pour parser les fichiers YAML
- Pages frontend existantes :
  - `frontend/views/form-list.html`
  - `frontend/views/form.html`
- Template YAML :
  - `backend/forms/template.yaml`
- **FIX 2** : Ajout de `credentials: 'include'` a tous les appels fetch() pour envoyer les cookies de session httpOnly
- **FIX 3** : Ajout des routes pour la page Mes PDFs
- **Problemes rencontrés** : 
  - Route /api/forms/:id manquante -> erreur "Route non trouvée" lors du clic sur "Remplir"
  - **Solution 1**: Ajout de la route dans app.js avec parsing YAML via js-yaml
  - Les requetes fetch n'envoyaient pas les cookies -> session non reconnue
  - **Solution 2**: Ajout de `credentials: 'include'` dans tous les fetch() des pages HTML
  - Bouton "Mes PDFs" dans la navbar pointait vers /pdfs.html au lieu de /pdf-list.html
  - **Solution 3**: Ajout de la route /pdfs.html dans app.js (redirection vers pdf-list.html) + implementation complete des API PDFs
- **Statut** : ✅ Termine (affichage, telechargement, visualisation et suppression des PDFs fonctionnels)

---

### 16/07/2026 - Upload de formulaires (Phase 2.5)
- **Nouvelle fonctionnalite** : Permettre aux utilisateurs d'uploader de nouveaux formulaires via l'interface web
- Implementation backend :
  - Configuration de multer pour l'upload de fichiers (limite: 1MB)
  - Creation de la route POST /api/forms/upload avec protection requireAuthRedirect
  - Validation du type de fichier (acceptation uniquement des .yaml et .yml)
  - Validation du contenu YAML (doit contenir une cle "form" avec un id)
  - Verification de l'unicite de l'id du formulaire
  - Sauvegarde du fichier dans backend/forms/
- Implementation frontend :
  - Ajout d'un bouton "Ajouter Formulaire" dans la navbar de form-list.html
  - Creation d'une modal avec selection de fichier et feedback visuel
  - Integration du JavaScript pour gerer l'upload via fetch()
  - Rechargement automatique de la liste des formulaires apres upload
- **Fichiers modifies** :
  - `backend/app.js` : Ajout de la configuration multer et de la route POST /api/forms/upload
  - `frontend/views/form-list.html` : Ajout du bouton, de la modal et du JavaScript
  - `README.md` : Documentation de la nouvelle route API et methode d'upload
  - `DEV_LOG.md` : Journal de cette implementation
- **Problemes rencontrés** : Aucun - implementation fluide
- **Statut** : ✅ Termine

---

### [Date a venir] - Interface Mobile et Signature (Phase 3)
- **Phase 3** : Interface optimisee mobile avec capture de signature
- Creation du layout responsive avec Bootstrap 5 :
  - `frontend/public/css/style.css`
- Optimisation pour ecrans tactiles :
  - Boutons et champs suffisamment grands (>48x48px)
  - Desactivation du zoom sur les champs
- Integration de Signature Pad :
  - `frontend/public/js/signature.js`
- Creation du canvas de signature :
  - Composant HTML dans `form.html`
- Fonctions clear/redo pour la signature
- Capture de la signature comme image (Data URL PNG)
- Envoi de la signature + donnees formulaire au backend
- **Problemes rencontrés** : [A completer]
- **Statut** : ⏳ En attente

---

### [Date a venir] - Generation de PDF (Phase 4)
- **Phase 4** : Generation de PDF avec formulaire + signature + date
- Creation du template de PDF :
  - `backend/services/pdfGenerator.js`
- Integration des donnees du formulaire dans le PDF
- Ajout de la signature (image) au PDF
- Ajout de la date et heure de generation
- Creation de l'API endpoint :
  - POST /api/generate-pdf
- Gestion des erreurs de generation
- **Problemes rencontrés** : [A completer]
- **Statut** : ⏳ En attente

---

### [Date a venir] - Stockage des PDFs (Phase 5)
- **Phase 5** : Stockage organise des PDFs generes
- Creation du service de stockage :
  - `backend/services/storageService.js`
- Organisation des PDFs par date (YYYY-MM-DD)
- Generation de noms de fichiers uniques (timestamp + user)
- Sauvegarde des metadonnees (qui, quand, quel formulaire)
- Creation des endpoints API :
  - GET /api/pdfs (liste des PDFs)
  - GET /api/pdfs/:id (telechargement d'un PDF)
- **Problemes rencontrés** : [A completer]
- **Statut** : ⏳ En attente

---

### [Date a venir] - Tests et Validation (Phase 6)
- **Phase 6** : Verification complete du projet
- Tests unitaires backend :
  - Tests d'authentification
  - Tests de parsing YAML
  - Tests de generation PDF
- Tests frontend :
  - Responsive design
  - Capture de signature
  - Validation des formulaires
- Test complet (formulaire -> PDF)
- Test sur differents appareils mobiles (iOS/Android)
- Correction des bugs identifies
- **Problemes rencontrés** : [A completer]
- **Statut** : ⏳ En attente

---

### [Date a venir] - Conteneurisation Docker (Phase 7)
- **Phase 7** : Finalisation de la configuration Docker
- Test du conteneur en production
- Verification des volumes persistents
- Configuration des variables d'environnement Docker
- Creation du Dockerfile pour le developpement (avec nodemon)
- **Problemes rencontrés** : [A completer]
- **Statut** : ⏳ En attente

---

### [Date a venir] - Deployment et Documentation Finale (Phase 8)
- **Phase 8** : Mise en production et finalisation de la documentation
- Finalisation du README.md avec toutes les sections
- Finalisation du DEV_LOG.md avec l'historique complet
- Creation du .env.example final
- Preparation des scripts de deployment
- Configuration pour l'hebergement (ex: Docker sur VPS)
- **Problemes rencontrés** : [A completer]
- **Statut** : ⏳ En attente

---

## 🎯 Tableau de Suivi des Objectifs

| Phase | Objectif | Statut | Date Debut | Date Fin | Notes |
|-------|----------|--------|------------|----------|-------|
| 0 | Initialisation projet | ✅ Termine | 16/07/2026 | 16/07/2026 | Structure complete creee |
| 1 | Authentification | ✅ Termine | 16/07/2026 | 16/07/2026 | Systeme d'auth complet avec bcrypt et express-session |
| 2 | Formulaires dynamiques | ✅ Termine | 16/07/2026 | 16/07/2026 | Chargement et upload des formulaires fonctionnels |
| 2.5 | Upload de formulaires | ✅ Termine | 16/07/2026 | 16/07/2026 | Interface web pour uploader de nouveaux formulaires YAML |
| 3 | Interface Mobile + Signature | ⏳ En attente | - | - | |
| 4 | Generation PDF | ⏳ En attente | - | - | |
| 5 | Stockage PDFs | ⏳ En attente | - | - | |
| 6 | Tests | ⏳ En attente | - | - | |
| 7 | Conteneurisation Docker | ⏳ En attente | - | - | |
| 8 | Deployment | ⏳ En attente | - | - | |

---

## 🔧 Decisions Techniques

### Architecture Generale
- **Backend** : Node.js + Express
  - **Justification** : Ecosysteme riche, facile a deployer avec Docker, bonne performance
  - **Alternatives considerees** : Python/Flask, PHP/Laravel
  - **Choix** : Node.js pour sa rapidite de developpement et sa compatibilite avec Docker

- **Frontend** : Vanilla JS + Bootstrap 5
  - **Justification** : Pas de build requis, compatible avec tous les navigateurs mobiles, framework CSS mature
  - **Alternatives considerees** : React, Vue.js, Svelte
  - **Choix** : Vanilla JS pour la simplicite et l'absence de dependance de build

- **Formulaires** : Fichiers YAML
  - **Justification** : Plus lisible que XML, facile a parser avec js-yaml, structure claire
  - **Alternatives considerees** : JSON, XML
  - **Choix** : YAML pour la lisibilite humaine

- **Signature** : Signature Pad (librairie JavaScript)
  - **Justification** : Librairie mature, optimisee pour mobile, capture precise
  - **Alternatives considerees** : Implementation custom avec Canvas API
  - **Choix** : Signature Pad pour gagner du temps et avoir une solution fiable

- **PDF** : pdfkit (Node.js)
  - **Justification** : Generation serveur, bonne integration avec Node.js, support des images
  - **Alternatives considerees** : jsPDF (frontend), reportlab (Python), pdf-lib
  - **Choix** : pdfkit pour la generation serveur et la qualite du rendu

- **Authentification** : express-session + bcrypt
  - **Justification** : Solution simple et securisee pour une application interne
  - **Alternatives considerees** : JWT, Passport.js
  - **Choix** : express-session pour la simplicite avec les cookies

### Docker
- **Image** : node:20-alpine
  - **Justification** : Image officielle, legere, basee sur Alpine Linux (securisee et minimale)
  - **Alternatives** : node:20-slim, node:20

- **Multi-stage build** : Oui
  - **Justification** : Reduit la taille de l'image finale en excluant les dependances de build

- **Volumes** : Persistance des PDFs et formulaires
  - **Justification** : Permet de conserver les PDFs generes entre les redemarrages du conteneur

- **Ports** : 3000
  - **Justification** : Port standard pour les applications Node.js en developpement

---

## 💡 Notes et Astuces

### Astuce 1: Development avec Docker
Pour developper avec auto-reload tout en utilisant Docker, utilisez :
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Astuce 2: Debugging des conteneurs
Pour acceder au shell du conteneur pour debugger :
```bash
docker exec -it form2sign-app sh
```

### Astuce 3: Verification des volumes
Pour voir les fichiers dans un volume :
```bash
# Trouver l'ID du volume
docker volume ls

# Inspecter le volume pour trouver le chemin sur l'hote
docker volume inspect [volume_id]
```

### Astuce 4: Nettoyage Docker
Pour nettoyer les ressources Docker inutilisees :
```bash
# Supprimer les conteneurs arretes
docker container prune

# Supprimer les images non utilisees
docker image prune

# Supprimer les volumes non utilises (ATTENTION : cela supprime les donnees)
docker volume prune
```

---

## 📦 Dependances Utilisees

### Backend (Node.js)

| Dependance | Version | Utilisation | Date Ajout |
|------------|---------|-------------|------------|
| express | ^4.18.2 | Framework web | 16/07/2026 |
| express-session | ^1.17.3 | Gestion des sessions | 16/07/2026 |
| bcryptjs | ^2.4.3 | Hashage des mots de passe | 16/07/2026 |
| dotenv | ^16.3.1 | Chargement des variables d'environnement | 16/07/2026 |
| pdfkit | ^0.15.0 | Generation des PDFs | 16/07/2026 |
| js-yaml | ^4.1.0 | Parsing des fichiers YAML | 16/07/2026 |
| cors | ^2.8.5 | Gestion CORS | 16/07/2026 |
| multer | ^1.4.5-lts.1 | Upload de fichiers | 16/07/2026 |

### Frontend (JavaScript)

| Librairie | Version | Utilisation | Date Ajout |
|-----------|---------|-------------|------------|
| Signature Pad | ^4.1.4 | Capture de signature | [A completer] |
| Bootstrap | 5.x | Framework CSS | [A completer] |

### Developpement

| Outil | Version | Utilisation | Date Ajout |
|-------|---------|-------------|------------|
| nodemon | ^3.0.1 | Auto-reload en developpement | 16/07/2026 |
| jest | ^29.7.0 | Tests unitaires | 16/07/2026 |
| supertest | ^6.3.3 | Tests HTTP | 16/07/2026 |

---

## 👤 Contributeurs

| Nom | Role | Contributions | Date Debut |
|-----|------|---------------|------------|
| [Votre Nom] | Developpeur principal | Architecture, implementation complete | 16/07/2026 |

---

## 📝 Changelog

### v1.0.0 - Initialisation (16/07/2026)
- Creation de la structure complete du projet
- Configuration Docker
- Documentation initiale
- Preparation pour le developpement

### v1.0.1 - Fix chargement formulaires (16/07/2026)
- **FIX 1**: Ajout de la route API /api/forms/:id pour charger un formulaire specifique
- Integration de js-yaml pour le parsing des fichiers YAML
- Correction du bug "Route non trouvée" lors du clic sur le bouton "Remplir"

### v1.0.2 - Fix cookies de session (16/07/2026)
- **FIX 2**: Ajout de `credentials: 'include'` a tous les appels fetch()
- Correction du bug de session non reconnue (cookies httpOnly non envoyes)
- Tous les appels API authentifies fonctionnent maintenant correctement

### v1.0.3 - Fix bouton Mes PDFs (16/07/2026)
- **FIX 3**: Ajout des routes pour la page Mes PDFs
- Ajout de la route /pdfs.html dans app.js
- Implementation complete des API PDFs:
  - GET /api/pdfs - Liste tous les PDFs generes
  - DELETE /api/pdfs/:id - Supprime un PDF
  - GET /api/pdfs/download/:date/:filename - Telecharge un PDF
  - GET /api/pdfs/view/:date/:filename - Visualise un PDF
- Organisation des PDFs par date (YYYY-MM-DD)

---

*Derniere mise a jour : 16/07/2026 - v1.0.3 (Gestion complete des PDFs)
*Projet : Form2Sign*
*Projet : Form2Sign*
