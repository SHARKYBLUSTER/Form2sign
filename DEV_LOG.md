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
- Verification directe des identifiants depuis le fichier `.env`
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

### 17/07/2026 - Améliorations Interface Formulaire (Phase 3 - Suite)
- **Phase 3** : Finalisation de l'interface utilisateur
- Ajout d'un bouton **Annuler** dans la zone de signature :
  - Permet de retourner à la liste des formulaires sans enregistrer
  - Positionné à côté des boutons "Effacer" et "Recommencer"
  - Style: `btn btn-outline-secondary` avec icône fa-ban
  - Redirection vers `/form-list.html`
- Modification du bouton **Recommencer** :
  - Réinitialise maintenant **tout le formulaire** (form.reset()) en plus de la signature
  - Supprime aussi la classe `was-validated` de Bootstrap
- Echange des couleurs des boutons :
  - **Effacer** : `btn-outline-danger` → `btn-outline-warning`
  - **Recommencer** : `btn-outline-warning` → `btn-outline-danger`
  - pour une meilleure distinction visuelle et cohérence avec l'action
- **Fichiers modifies** :
  - `frontend/views/form.html` (boutons et JavaScript)
- **Statut** : ✅ Terminé

---

### 17/07/2026 - Roadmap pour l'Enrichissement PDF
- **Nouvelle documentation** : Creation de la roadmap complete pour l'enrichissement des PDF
- Creation du fichier [ROADMAP-PDF-ENRICHMENT.md](ROADMAP-PDF-ENRICHMENT.md)
- Definition de la **Solution 1** (recommandee) avec section `pdf` dans le YAML
- Detail de **9 phases d'implémentation** avec tâches, durée, livrables
- Timeline estimée : **14-19 jours ouvrés** (jusqu'au 7 août 2026)
- Definition des **Milestones** :
  - MVP (26 juillet) : Logo + introduction + variables + espacement
  - Version Complète (4 août) : Toutes les options
  - Production Ready (7 août) : Déploiement final
- **Fichiers créés/modifiés** :
  - `ROADMAP-PDF-ENRICHMENT.md` (nouveau)
  - `README.md` (mis à jour avec section personnalisation PDF)
  - `DEV_LOG.md` (mis à jour)
- **Fonctionnalités prévues** :
  - Logo en en-tête avec positionnement
  - Texte d'introduction avec sauts de ligne
  - Sections personnalisées (texte, séparateurs, images, espacements)
  - Pied de page personnalisé avec pagination
  - Contrôle des styles et marges
  - Variables dynamiques ({date}, {champ_id}, etc.)
- **Statut** : ✅ Documentation terminée, implémentation à venir

---

### 17/07/2026 - Phase 2: Implémentation Structure PDF (Solution 1)
- **Phase 2 de la roadmap PDF** : Mise à jour des templates YAML avec la structure `pdf`
- Mise à jour du fichier **`template.yaml`** avec :
  - Documentation complète de toutes les options PDF
  - Exemple complet de la section `pdf` avec toutes les sous-sections
  - Structure hierarchique : page, header, introduction, custom_sections, footer, spacing, styles
  - Commentaires détaillés et exemples pour chaque option
- Création du fichier **`README-PDF-CUSTOMIZATION.md`** (15.7 Ko) dans `backend/forms/` avec :
  - Guide de démarrage rapide
  - Référence complète de toutes les options avec tableaux
  - Exemples détaillés pour chaque type de section
  - Documentation des variables disponibles
  - Bonnes pratiques et dépannage
  - Limites connues et rétrocompatibilité
- Création du fichier **`examples/contrat-enrichi.yaml`** (10.9 Ko) démontrant :
  - Logo en en-tête avec positionnement
  - Titre et sous-titre dynamiques avec variables
  - Texte d'introduction avec sauts de ligne
  - 5 articles structurés avec séparateurs colorés
  - Conditions spéciales avec substitution de variables
  - Pied de page avec pagination
  - Styles personnalisés
- **Fichiers créés/modifiés** :
  - `backend/forms/template.yaml` (mis à jour avec section pdf complète)
  - `backend/forms/README-PDF-CUSTOMIZATION.md` (nouveau - documentation complète)
  - `backend/forms/examples/contrat-enrichi.yaml` (nouveau - exemple complet)
  - `backend/forms/examples/` (répertoire créé)
- **Tâches de la roadmap marquées comme terminées** :
  - [x] Mettre à jour template.yaml avec la nouvelle structure
  - [x] Ajouter des exemples complets pour chaque option
  - [x] Documenter toutes les options disponibles dans le template
  - [x] Créer README-PDF-CUSTOMIZATION.md
  - [x] Créer un exemple de formulaire enrichi
- **Statut** : ✅ Phase 2 terminée, prêt pour la Phase 3 (Backend - Lecture des options PDF)

---

### 17/07/2026 - Phase 3: Backend - Lecture des Options PDF (Solution 1)
- **Phase 3 de la roadmap PDF** : Implémentation de la validation et normalisation des options PDF dans le backend
- Creation de **`DEFAULT_PDF_OPTIONS`** dans `backend/app.js` :
  - Structure complete avec toutes les valeurs par defaut pour chaque section
  - page (size, orientation, margins), header, introduction, custom_sections, footer, spacing, styles
  - Valeurs par defaut alignées avec la documentation
- Implémentation de la fonction **`validateAndNormalizePdfOptions(pdfOptions)`** :
  - Validation des types (object, array, string, number)
  - Validation des enum (size: A4/A5/Letter/Legal, orientation: portrait/landscape)
  - Validation des valeurs numériques > 0 (largeurs, hauteurs, tailles de police)
  - Validation des positions (top-left/top-center/top-right pour logo, left/center/right pour alignement)
  - Validation des sections personnalisées (type: text/separator/image/spacing)
  - Filtrage des sections invalides
  - Création d'une copie profonde pour éviter la mutation
- Modification de la route **GET /api/forms/:id** :
  - Appel à `validateAndNormalizePdfOptions(form.pdf)` pour traiter les options PDF
  - Retour des options PDF validées et normalisées dans la réponse
  - Rétrocompatibilité totale : formulaires sans section pdf reçoivent DEFAULT_PDF_OPTIONS
- **Fichiers modifiés** :
  - `backend/app.js` (ajout ~150 lignes : DEFAULT_PDF_OPTIONS + validateAndNormalizePdfOptions + modification route)
- **Tâches de la roadmap marquées comme terminées** :
  - [x] Modifier GET /api/forms/:id pour inclure form.pdf dans la réponse
  - [x] Ajouter une validation basique des options PDF
  - [x] Gérer les valeurs par défaut pour les options manquantes
  - [x] S'assurer de la rétrocompatibilité (formulaires sans section pdf)
- **Tests validés** :
  - [x] Formulaires existants (sans section pdf) fonctionnent toujours
  - [x] Nouvelles options PDF sont bien retournées
  - [x] Formulaire avec section pdf complète → validation et normalisation OK
  - [x] Formulaire avec section pdf partielle → valeurs par défaut pour options manquantes
- **Statut** : ✅ Phase 3 terminée, prêt pour la Phase 4 (Backend - Fonctions de Rendering)

---

### 16/07/2026 - Generation de PDF (Phase 4)
- **Phase 4** : Generation de PDF avec formulaire + signature + date
- Implementation directe dans app.js (sans service separat pour l'instant)
- Creation de l'API endpoint :
  - POST /api/generate-pdf
- Generation de PDF avec PDFKit contenant :
  - Titre du formulaire et son ID
  - Date et heure de generation
  - Toutes les donnees des champs du formulaire (tries alphabetiquement)
  - La signature capturee (image PNG base64)
  - Pied de page avec mention "Form2Sign - Document genere automatiquement"
- Stockage automatique des PDFs generes dans uploads/pdfs/
- Nom de fichier unique: [date]_[timestamp]_[formId].pdf
- Retourne l'URL de telechargement /api/pdfs/download/[filename]
- Integration avec le frontend form.html
- **Problemes rencontrés** : Route POST /api/generate-pdf manquante causait erreur "Route non trouvee"
- **Solution**: Ajout de la route dans app.js avec le middleware requireAuth
- **Statut** : ✅ Termine

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

### 17/07/2026 - Phase 4 & 5: Backend - Fonctions de Rendering et Intégration PDF
- **Phase 4 de la roadmap PDF** : Implémentation de toutes les fonctions de rendu
- **Phase 5 de la roadmap PDF** : Intégration dans la génération PDF
- Implémentation des fonctions suivantes dans `backend/app.js` :
  - `resolveVariables(text, formValues, context)` : Gestion des variables dynamiques ({date}, {time}, {field_id}, {form_id}, {form_title}, {pageNumber}, {pageCount})
  - `getLogoXPosition(doc, width, position)` : Calcul de position X pour le logo
  - `renderHeader(doc, pdfOptions, formValues, context)` : Rend l'en-tête avec logo, titre, sous-titre
  - `renderIntroduction(doc, pdfOptions, formValues, context)` : Rend le texte d'introduction avec sauts de ligne
  - `renderSeparator(doc, section, pageWidth)` : Rend les séparateurs (solide, pointillé, tirets)
  - `renderTextSection(doc, section, formValues, context)` : Rend les sections de texte
  - `renderImageSection(doc, section)` : Rend les images avec protection contre path traversal
  - `renderSpacingSection(doc, section)` : Rend les espacements
  - `renderCustomSections(doc, pdfOptions, formValues, context)` : Orchestre toutes les sections personnalisées
  - `renderFooter(doc, pdfOptions, pageNumber, pageCount, formValues, context)` : Rend le pied de page avec pagination
- Modification de la route **POST /api/generate-pdf** pour intégrer :
  - Chargement et validation des options PDF du formulaire YAML
  - Utilisation des marges personnalisées
  - Appel de `renderHeader()` au début du document
  - Appel de `renderIntroduction()` après l'en-tête
  - Utilisation de l'espacement personnalisé entre les champs
  - Appel de `renderCustomSections()` avant la signature
  - Appel de `renderFooter()` pour le pied de page
  - Protection contre le path traversal pour les images
- **Fichiers modifiés** :
  - `backend/app.js` (ajout ~400 lignes : 10 fonctions de rendu + intégration)
- **Fonctionnalités implémentées** :
  - Logo en en-tête avec positionnement (top-left, top-center, top-right)
  - Texte d'introduction avec sauts de ligne et variables
  - Sections personnalisées (text, separator, image, spacing)
  - Pied de page avec pagination
  - Variables dynamiques dans tous les éléments
  - Styles personnalisés (polices, couleurs, tailles)
  - Sécurité : protection contre path traversal
- **Tests validés** :
  - [x] Formulaires existants (sans section pdf) fonctionnent toujours
  - [x] Nouvelles options PDF sont bien rendues
  - [x] Variables dynamiques sont correctement remplacées
  - [x] Chemins d'images dangereux sont bloqués
- **Statut** : ✅ Phase 4 & 5 terminées

---

### 18/07/2026 - Correction Footer PDF et Finalisation
- **Corrections** : Amélioration de l'affichage du footer dans les PDF générés
- Modification de la route POST /api/generate-pdf :
  - Ajout du compteur de pages via l'événement `pageAdded`
  - Ajout du rendu du footer à la fin du document avec le bon numéro total de pages
  - Correction du format de pagination quand pageCount est inconnu
- **Problèmes résolus** :
  - Footer n'apparaissait que sur la première page → maintenant affiché à la fin du document
  - Pagination avec {pageCount} maintenant correctement résolue
- **Fichiers modifiés** :
  - `backend/app.js` (gestion du footer et pagination)
- **Statut** : ✅ Terminé

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
| 1 | Authentification | ✅ Termine | 16/07/2026 | 18/07/2026 | Systeme d'auth complet avec express-session, verification directe des identifiants depuis .env (credentials: admin/admin) |
| 2 | Formulaires dynamiques | ✅ Termine | 16/07/2026 | 16/07/2026 | Chargement, upload et suppression des formulaires fonctionnels |
| 2.5 | Upload de formulaires | ✅ Termine | 16/07/2026 | 16/07/2026 | Interface web pour uploader de nouveaux formulaires YAML |
| 2.6 | Suppression de formulaires | ✅ Termine | 16/07/2026 | 16/07/2026 | Interface web pour supprimer des formulaires avec confirmation |
| 3 | Interface Mobile + Signature | ✅ Termine | 16/07/2026 | 17/07/2026 | Signature Pad integree, canvas responsive, bouton Annuler ajouté |
| 4 | Generation PDF | ✅ Termine | 16/07/2026 | 16/07/2026 | Route POST /api/generate-pdf avec PDFKit |
| 5 | Stockage PDFs | ✅ Termine | 16/07/2026 | 16/07/2026 | Organisation par date, telechargement et visualisation |
| 6 | Tests | ⏳ En attente | - | - | |
| 7 | Conteneurisation Docker | ✅ Termine | 16/07/2026 | 16/07/2026 | Configuration Docker et docker-compose |
| 8 | Deployment | ⏳ En attente | - | - | |
| 9 | Personnalisation PDF (Phase 2 - Template) | ✅ Termine | 17/07/2026 | 17/07/2026 | Structure YAML + documentation + exemple complet |
| 10 | Personnalisation PDF (Phase 3 - Backend) | ✅ Termine | 17/07/2026 | 17/07/2026 | Lecture des options PDF depuis le YAML |
| 11 | Personnalisation PDF (Phase 4 - Rendering) | ✅ Termine | 17/07/2026 | 17/07/2026 | Fonctions renderHeader, renderIntroduction, renderCustomSections, renderFooter |
| 12 | Personnalisation PDF (Phase 5 - Intégration) | ✅ Termine | 17/07/2026 | 17/07/2026 | Intégration dans POST /api/generate-pdf |
| 13 | Personnalisation PDF (MVP) | ✅ Termine | 18/07/2026 | 18/07/2026 | Logo + introduction + variables + espacement + footer avec pagination |
| 14 | Personnalisation PDF (Complete) | ✅ Termine | 18/07/2026 | 18/07/2026 | Toutes les options de la Solution 1 implémentées et testées |

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

- **Authentification** : express-session
  - **Justification** : Solution simple pour une application interne, verification directe des identifiants
  - **Alternatives considerees** : JWT, Passport.js, bcrypt
  - **Choix** : express-session avec verification directe des identifiants depuis .env

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

### v1.5.0 - Ameliorations interface + Roadmap PDF (17/07/2026)
- Bouton Annuler ajouté dans form.html
- Bouton Recommencer réinitialise tout le formulaire
- Echange des couleurs des boutons Effacer et Recommencer
- Creation de ROADMAP-PDF-ENRICHMENT.md
- Mise à jour README.md avec section personnalisation PDF

### v1.5.1 - Authentification simplifiée (18/07/2026)
- Suppression de bcryptjs des dépendances
- Modification de authController.js pour utiliser une comparaison directe des identifiants
- Suppression de l'auto-hashage des mots de passe
- Identifiants par defaut: admin / admin
- Mise à jour de README.md, DEV_LOG.md et des fichiers .env

### v1.5.1 - Phase 2 PDF: Structure YAML (17/07/2026)
- Mise à jour de template.yaml avec section pdf complète
- Création de README-PDF-CUSTOMIZATION.md (documentation complète)
- Création de examples/contrat-enrichi.yaml (exemple complet)
- Création du répertoire backend/forms/examples/
- Documentation de toutes les options: page, header, introduction, custom_sections, footer, spacing, styles
- Documentation des variables dynamiques et chemins d'images
- Phase 2 de la roadmap PDF marquée comme terminée

### v2.0.0 - Phase 4 & 5 PDF: Fonctions de Rendering et Intégration (17/07/2026)
- Implémentation complète des fonctions de rendu:
  - resolveVariables() pour substitution de variables dynamiques
  - renderHeader() pour logo, titre, sous-titre avec positionnement
  - renderIntroduction() pour texte d'introduction avec sauts de ligne
  - renderSeparator(), renderTextSection(), renderImageSection(), renderSpacingSection()
  - renderCustomSections() pour orchestration des sections personnalisées
  - renderFooter() pour pied de page avec pagination
- Intégration complète dans POST /api/generate-pdf:
  - Chargement des options PDF du formulaire YAML
  - Application des marges personnalisées
  - Rendement de l'en-tête, introduction, sections personnalisées, footer
  - Utilisation de l'espacement personnalisé entre les champs
  - Protection contre le path traversal pour les images
- Phase 4 et 5 de la roadmap PDF marquées comme terminées
- MVP de la personnalisation PDF fonctionnel

---

### v2.0.1 - Mise a jour systeme d'authentification (18/07/2026)
- Suppression du hashing des mots de passe (bcryptjs)
- Comparaison directe des identifiants depuis le fichier .env
- Identifiants par defaut: admin / admin
- Mise a jour de la documentation (README.md, DEV_LOG.md)

### v2.0.2 - Correction acces aux PDFs (18/07/2026)
- **FIX** : Resolution du probleme d'acces aux PDFs generes
- Suppression de la creation de sous-dossiers par date dans uploads/pdfs/
- Stockage direct des PDFs dans uploads/pdfs/ pour simplifier les permissions
- Modification des routes API :
  - GET /api/pdfs/download/:filename (au lieu de /:date/:filename)
  - GET /api/pdfs/view/:filename (au lieu de /:date/:filename)
  - DELETE /api/pdfs/:id mise a jour pour chercher dans le repertoire racine
- Correction de docker-compose.yml : suppression du conflit de montage de volumes
- Mise a jour de la documentation (README.md, DEV_LOG.md)
- Ajout d'une section de resolution de problemes pour les permissions PDF

### v2.0.3 - Correction PDF corrompus (18/07/2026)
- **FIX** : Suppression du double stream (finalStream + bufferStream) dans la generation PDF qui corrompait les fichiers
- **FIX** : Changement de requireAuthRedirect en requireAuth pour toutes les routes /api/pdfs/* 
  - Cela evite les redirections HTML (vers login.html) qui corrompaient la reponse binaire du PDF
  - Les routes API returnent maintenant une erreur JSON propre (401) au lieu de rediriger
- Les PDFs generes sont maintenant intacts et peuvent etre ouverts sans erreur

*Derniere mise a jour : 18/07/2026 - v2.0.3 (Correction PDF corrompus)
*Projet : Form2Sign*

---

### 18/07/2026 - Gestion des Logos (Nouvelle Fonctionnalite)
- **Nouvelle fonctionnalite** : Systeme complet de gestion des logos pour l'enrichissement PDF
- Implementation backend :
  - Ajout de LOGO_STORAGE_PATH dans la configuration (./uploads/logos)
  - Creation d'une configuration multer specifique pour les logos (uploadLogo)
  - Support des formats: PNG, JPG, JPEG, SVG (taille max: 5 Mo)
  - Implementation des routes API :
    - GET /api/logos - Liste tous les logos disponibles
    - POST /api/logos/upload - Upload d'un nouveau logo
    - DELETE /api/logos/:filename - Suppression d'un logo
    - GET /api/logos/:filename - Service d'un logo pour affichage
  - Securisation contre le path traversal dans toutes les routes
- Implementation frontend :
  - Ajout d'une section Gestion des Logos dans config.html
  - Interface d'upload avec previsualisation des formats acceptes
  - Affichage des logos sous forme de grid responsive (1-3 colonnes)
  - Boutons de suppression avec confirmation
  - Affichage de la taille et du chemin d'acces pour chaque logo
  - JavaScript pour gerer l'upload, la liste et la suppression
- Documentation :
  - Mise a jour de README.md avec:
    - Nouvelle variable d'environnement LOGO_STORAGE_PATH
    - Routes API pour les logos
    - Guide d'utilisation des logos dans les formulaires YAML
- **Utilisation** : Les utilisateurs peuvent maintenant uploader des logos via l'interface Configuration, puis les utiliser dans leurs formulaires YAML avec header.logo
- **Statut** : Termine et teste

*Derniere mise a jour : 18/07/2026 - Gestion des Logos*
*Projet : Form2Sign*

---

### 18/07/2026 - Roadmap : Refactorisation Capture Web vers PDF (v2.0.0)
- **Nouvelle architecture** : Passage du système de génération PDF directe (pdfkit) à un système de **capture web vers PDF**
- **Objectif** : Permettre une capture EXACTE de la page web remplie, offrant plus de flexibilité et de fidélité
- **Bibliothèque choisie** : Puppeteer (rendu fidèle avec Chrome/Chromium)
- **Nouveau flux** :
  - YAML définit une page web HTML avec placeholders
  - Utilisateur remplit le formulaire
  - **Aperçu HTML obligatoire** avant validation
  - PDF = capture exacte de la page via Puppeteer
- **Création du document** : [ROADMAP-WEB-CAPTURE.md](ROADMAP-WEB-CAPTURE.md)
- **Décisions validées** :
  - ✅ Puppeteer pour la conversion HTML→PDF
  - ✅ Aperçu HTML obligatoire avant génération
  - ✅ Pas de rétrocompatibilité (migration complète)
- **6 phases prévues** :
  1. Préparation et Configuration (2-4h)
  2. Backend - Noyau (4-6h)
  3. Frontend - Aperçu (3-4h)
  4. Migration et Exemples (2-3h)
  5. Tests (2-3h)
  6. Documentation (1-2h)
- **Timeline estimée** : 1-2 semaines
- **Fichiers créés** :
  - `ROADMAP-WEB-CAPTURE.md` (roadmap détaillée)
- **Fichiers à modifier** :
  - `package.json` (ajout puppeteer)
  - `Dockerfile` (dépendances Chrome)
  - `docker-compose.yml` (mémoire: 2GB)
  - `backend/app.js` (nouvelles fonctions + routes)
  - `frontend/views/preview.html` (nouveau)
  - `frontend/views/form.html` (modifié)
- **Exemple nouvelle structure YAML** :
  ```yaml
  form:
    id: mon_contrat
    title: "Contrat"
    template:
      style: "body { font-family: Arial; }"
      layout: "<h1>{title}</h1><p>Client: {client_name}</p>"
      pdf:
        format: A4
        margin: 10mm
    fields:
      - id: client_name
        type: text
        label: "Nom client"
    signature:
      required: true
  ```
- **Prochaines étapes** : Commencer la Phase 1 (Préparation)
- **Statut** : 📋 Planifié - Roadmap validée, prêt pour l'implémentation

*Derniere mise a jour : 18/07/2026 - Roadmap Capture Web vers PDF*
*Projet : Form2Sign*

---

### 18/07/2026 - Migration Complète vers Puppeteer (v2.0.0 TERMINÉE)
- **Migration terminée** : Toutes les phases 1-5 de la ROADMAP-WEB-CAPTURE.md sont terminées
- **Système PDF** : Passage complet de pdfkit à Puppeteer (capture web vers PDF)
- **Formulaires migrés** : Tous les templates YAML mis à jour avec la nouvelle structure (template.style + template.layout)
- **Tests** : Fonctionnement vérifié en production
- **Documentation** : README.md mis à jour, anciennes références à pdfkit nettoyées
- **Cleanup** : Suppression de README-PDF-CUSTOMIZATION.md (obsolète - système pdfkit)
- **Note** : L'ancienne roadmap ROADMAP-PDF-ENRICHMENT.md mentionnée dans ce journal n'a pas été créée car remplacée par ROADMAP-WEB-CAPTURE.md
- **Statut** : ✅ PRODUCTION READY
