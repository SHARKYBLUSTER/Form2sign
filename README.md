# Form2Sign

## 📌 Description

Form2Sign est une application web **mobile-first** qui permet de :
- Remplir des formulaires dynamiques definis via des fichiers YAML
- Capturer une signature via l'ecran tactile d'un telephone mobile
- Generer un PDF contenant le formulaire rempli, la signature et la date
- Stocker les PDFs generes dans un repertoire dedie
- Proteger l'acces par authentification (login/mot de passe via .env - **admin/admin** par defaut)

L'application est entierement conteneurisee avec **Docker** pour un deploiement facile.

---

## ⚙️ Prerequis

### Pour le developpement local (sans Docker)
- Node.js 18+ (recommande : 20 LTS)
- npm 9+
- Git

### Pour le deploiement (recommande)
- Docker 20.10+
- Docker Compose 2.0+

---

## 🚀 Installation & Demarrage

### Methode 1: Avec Docker (recommande pour la production)

```bash
# Cloner le depot
git clone https://github.com/SHARKYBLUSTER/Form2sign.git
cd Form2sign

# Copier et configurer le fichier d'environnement
cp backend/config/.env.example backend/config/.env

# Editer .env avec vos identifiants (voir section Configuration)
nano backend/config/.env  # ou utilisez votre editeur prefere

# Creer les repertoires de stockage et configurer les permissions pour Docker
# Le conteneur Docker s'execute sous l'utilisateur UID 1001
# Cette commande detecte si un utilisateur avec UID 1001 existe sur votre systeme,
# sinon elle utilise directement UID 1001. Cela permet au conteneur d'ecrire dans les volumes montes.
awk -F: '{ if ($3 == 1001) print $1 }' /etc/passwd | xargs -I {} sudo chown -R {}:{} ./backend/uploads ./backend/forms ./backend/config 2>/dev/null || sudo chown -R 1001:1001 ./backend/uploads ./backend/forms ./backend/config

# Permissions pour le fichier .env (necessaire pour l'interface de configuration)
sudo chown 1001:1001 ./backend/config/.env
sudo chmod 666 ./backend/config/.env

# Demarrer l'application avec Docker Compose (rebuild automatique)
docker compose up -d --build

# Verifier que le conteneur est en cours d'execution
docker compose ps

# Voir les logs
docker compose logs -f

# Acceder a l'application
# Ouvrez votre navigateur : http://localhost:3000
```

### Methode 2: Sans Docker (pour le developpement)

```bash
# Cloner le depot
git clone https://github.com/SHARKYBLUSTER/Form2sign.git
cd Form2sign

# Installer les dependances
npm install

# Copier et configurer le fichier d'environnement
cp backend/config/.env.example backend/config/.env

# Editer .env avec vos identifiants
nano backend/config/.env

# Demarrer l'application en mode developpement (avec auto-reload)
npm run dev

# Ou en mode production
npm start

# Acceder a l'application
# Ouvrez votre navigateur : http://localhost:3000
```

### Mise a jour du projet

#### Avec Docker
```bash
# Arreter les conteneurs
docker compose down

# Tirer les dernieres modifications
git pull origin main

# Reconstruire et redemarrer (les modifications du code seront prises en compte)
docker compose up -d --build
```

#### Sans Docker
```bash
# Tirer les dernieres modifications
git pull origin main

# Mettre a jour les dependances (si package.json a change)
npm install

# Redemarrer l'application
npm restart  # ou Ctrl+C puis npm start
```

---

## 📄 Documentation Additionnelle

- [ROADMAP-PDF-ENRICHMENT.md](ROADMAP-PDF-ENRICHMENT.md) - Roadmap pour l'enrichissement des PDF
- [DEV_LOG.md](DEV_LOG.md) - Journal de développement complet

---

## 🛠️ Configuration

### Variables d'environnement (.env)

Copiez le fichier `.env.example` vers `.env` et adaptez les valeurs :

```bash
cp backend/config/.env.example backend/config/.env
```

| Variable | Description | Valeur par defaut | Requise |
|----------|-------------|------------------|---------|
| APP_USER | Nom d'utilisateur pour la connexion | `admin` | ✅ Oui |
| APP_PASSWORD | Mot de passe | `admin` | ✅ Oui |
| SESSION_SECRET | Cle secrete pour les cookies de session | `super_secret_key_form2sign_2026_change_me` | ✅ Oui |
| PORT | Port sur lequel l'application ecoute | `3000` | ✅ Oui |
| NODE_ENV | Environnement (development/production) | `development` | ❌ Non |
| PDF_STORAGE_PATH | Chemin de stockage des PDFs | `./backend/uploads/pdfs` | ❌ Non |
| FORMS_DIRECTORY | Repertoire des formulaires YAML | `./backend/forms` | ❌ Non |

> ⚠️ **IMPORTANT** : Ne commitez JAMAIS le fichier `.env` dans Git. Il contient des informations sensibles.
>
> **Identifiants par defaut :**
> - Nom d'utilisateur : `admin`
> - Mot de passe : `admin`
>
> Pour modifier les identifiants, editez le fichier `.env` et changez les valeurs des variables `APP_USER` et `APP_PASSWORD`, puis redemarrez l'application.

---

## 📱 Utilisation

### Etape 1: Connexion
1. Accedez a l'application via votre navigateur : `http://localhost:3000`
2. Utilisez les identifiants configures dans le fichier `.env` (par defaut: **admin** / **admin**)

### Etape 2: Selectionner un formulaire
1. Une fois connecte, vous verrez la liste des formulaires disponibles
2. Les formulaires sont definis dans des fichiers YAML dans `backend/forms/`

### Etape 3: Remplir le formulaire
1. Selectionnez un formulaire
2. Remplissez tous les champs requis
3. Certains champs peuvent avoir des validations (email, date, etc.)

### Etape 4: Capturer la signature
1. Utilisez la zone de signature pour dessiner avec votre doigt ou un stylet
2. Vous pouvez effacer avec le bouton "Effacer" ou recommencer avec "Recommencer"

### Etape 5: Valider et generer le PDF
1. Cliquez sur le bouton "Valider" ou "Generer PDF"
2. Le systeme va generer un PDF contenant :
   - Les donnees du formulaire rempli
   - Votre signature
   - La date et heure de generation

### Etape 6: Telecharger le PDF
1. Une fois le PDF genere, vous pourrez le telecharger
2. Les PDFs sont stockes dans `backend/uploads/pdfs/`

---

## 🔌 Routes API

⚠️ **Important** : Pour toutes les requetes vers les endpoints authentifies, utilisez `credentials: 'include'` dans vos appels fetch() pour envoyer le cookie de session.

### Authentification
| Methode | Endpoint | Description | Authentification requise |
|---------|----------|-------------|--------------------------|
| POST | `/api/login` | Connexion avec identifiants | ❌ Non |
| GET | `/api/logout` | Deconnexion | ✅ Oui |
| GET | `/api/auth/status` | Verifie le statut de connexion | ❌ Non |

### Formulaires
| Methode | Endpoint | Description | Authentification requise |
|---------|----------|-------------|--------------------------|
| GET | `/api/forms` | Liste les formulaires disponibles | ✅ Oui |
| GET | `/api/forms/:id` | Charge un formulaire specifique par son ID | ✅ Oui |
| POST | `/api/forms/upload` | Telecharge un nouveau formulaire YAML | ✅ Oui |
| DELETE | `/api/forms/:id` | Supprime un formulaire | ✅ Oui |
| POST | `/api/generate-pdf` | Genere un PDF a partir des donnees du formulaire | ✅ Oui |

### PDFs
| Methode | Endpoint | Description | Authentification requise |
|---------|----------|-------------|--------------------------|
| GET | `/api/pdfs` | Liste tous les PDFs generes | ✅ Oui |
| DELETE | `/api/pdfs/:id` | Supprime un PDF | ✅ Oui |
| GET | `/api/pdfs/download/:filename` | Telecharge un PDF | ✅ Oui |
| GET | `/api/pdfs/view/:filename` | Visualise un PDF dans le navigateur | ✅ Oui |

---

## 📁 Structure du Projet

```
Form2sign/
├── backend/                          # Backend Node.js + Express
│   ├── app.js                        # Point d'entree principal de l'application
│   │                                # (routes API, configuration Express, middleware)
│   ├── config/
│   │   ├── .env                      # Variables d'environnement (SECRETE)
│   │   └── .env.example              # Template pour .env
│   ├── controllers/                  # Controleurs Express
│   │   └── authController.js        # Gestion de l'authentification
│   ├── routes/                      # Routes Express
│   │   └── authRoutes.js             # Routes d'authentification
│   ├── middlewares/                 # Middlewares Express
│   │   └── authMiddleware.js        # Verification d'authentification
│   ├── forms/                       # Formulaires dynamiques (fichiers YAML)
│   │   ├── template.yaml            # Template de base
│   │   └── [nom_du_formulaire].yaml
│   └── uploads/                     # Stockage des fichiers
│       └── pdfs/                    # PDFs generes
│
├── frontend/                        # Frontend HTML/CSS/JS
│   ├── views/
│   │   ├── login.html               # Page de connexion
│   │   ├── form-list.html           # Liste des formulaires
│   │   ├── form.html                # Formulaire a remplir
│   │   ├── pdf-list.html            # Liste des PDFs generes
│   │   └── logout.html              # Page de deconnexion
│   └── public/
│       └── css/
│           └── style.css            # Styles CSS
│
├── Dockerfile                       # Definition de l'image Docker
├── docker-compose.yml               # Configuration Docker Compose
├── .dockerignore                    # Fichiers a exclure du build Docker
├── .gitignore                       # Fichiers a exclure de Git
├── package.json                     # Dependances Node.js
├── README.md                        # Documentation (ce fichier)
└── DEV_LOG.md                       # Journal de developpement
```

> ⚠️ **Note** : Certains repertoires mentionnes dans la structure (models, services, js/) sont prevus pour une evolution future mais ne sont pas encore implémentes. Le code actuel est concentre dans app.js pour simplifier.

---

## 👨‍💻 Developpement

### Commandes utiles

#### Avec Docker
```bash
# Builder l'image
docker compose build

# Demarrer les services
docker compose up -d

# Arreter les services
docker compose down

# Redemarrer les services
docker compose restart

# Voir les logs
docker compose logs -f

# Acceder au conteneur (pour deboguer)
docker exec -it form2sign-app sh

# Mettre a jour apres modification
docker compose down && docker compose up -d --build
```

#### Sans Docker
```bash
# Installer les dependances
npm install

# Demarrer en mode developpement (avec auto-reload)
npm run dev

# Demarrer en mode production
npm start

# Lancer les tests
npm test
```

### Ajouter un nouveau formulaire

**Methodes possibles :**

**Via l'interface web (recommande) :**
1. Connectez-vous a l'application
2. Cliquez sur le bouton "Ajouter Formulaire" dans la navbar
3. Selectionnez votre fichier YAML (.yaml ou .yml)
4. Cliquez sur "Televerser"
5. Le formulaire sera automatiquement disponible dans la liste

**Via le systeme de fichiers (manuel) :**
1. Creez un fichier `.yaml` dans le repertoire `backend/forms/`
2. Suivez le format definis dans `backend/forms/template.yaml`
3. Exemple minimal :

### Supprimer un formulaire
Via l'interface web :
1. Dans la liste des formulaires, cliquez sur l'icône poubelle (🗑️) sur la carte du formulaire
2. Confirmez la suppression dans la modal
3. Le formulaire est supprimé et la liste est rechargée automatiquement

**Attention** : Cette action est irreversible. Le fichier YAML est définitivement supprimé du serveur.

```yaml
form:
  id: mon_formulaire
  title: "Mon Super Formulaire"
  description: "Description du formulaire"
  fields:
    - id: nom
      label: "Nom complet"
      type: text
      required: true
      placeholder: "Entrez votre nom"
    
    - id: email
      label: "Adresse email"
      type: email
      required: true
      validation: "email"
    
    - id: date_naissance
      label: "Date de naissance"
      type: date
      required: false

  signature:
    required: true
    label: "Signature"
    instructions: "Signez avec votre doigt ou un stylet"
```

3. Redemarrez l'application pour prendre en compte le nouveau formulaire

---

## 🐛 Resolution des problemes

### Le conteneur ne demarre pas

```bash
# Vérifier que Docker est installe
docker --version

# Vérifier les logs
docker compose logs

# Vérifier les volumes
docker volume ls

# Verifier les conteneurs en cours
docker compose ps -a
```

**Solutions courantes :**
- Verifiez que le port 3000 est disponible
- Verifiez les permissions sur les fichiers `.env`
- Verifiez que le fichier `.env` existe et contient les variables requises

### Erreur de permissions EACCES: permission denied

**Probleme :** Le conteneur ne peut pas ecrire dans les volumes montes (uploads/pdfs, forms, config)

**Solution :**
```bash
# Donner les permissions a l'utilisateur du conteneur (UID 1001)
sudo chown -R 1001:1001 ./backend/uploads ./backend/forms ./backend/config

# Pour le fichier .env specifiquement (si vous avez des problemes de sauvegarde via l'interface Configuration)
sudo chown 1001:1001 ./backend/config/.env
sudo chmod 666 ./backend/config/.env

# Puis redemarrer les conteneurs
docker compose down
docker compose up -d
```

**Explication :** Le Dockerfile cree un utilisateur `nodejs` avec UID 1001 pour des raisons de securite. Les volumes montes depuis l'hote doivent etre accessibles par cet utilisateur. Pour l'interface de configuration (page Configuration), le fichier `.env` doit etre accessible en ecriture par le conteneur.

### Erreur de connexion

**Probleme :** "Identifiants incorrects"

**Solutions :**
- Verifiez que `APP_USER` et `APP_PASSWORD` sont correctement definis dans `.env`
- Verifiez les majuscules/minuscules (la connexion est sensible a la casse)
- Les identifiants par defaut sont: **admin** / **admin**
- Si vous avez perdu le mot de passe, réinitialisez-le avec :
  ```bash
  sudo sed -i 's/^APP_PASSWORD=.*/APP_PASSWORD=admin/' backend/config/.env
  ```
  Puis redémarrez l'application.

### Le formulaire ne s'affiche pas

**Probleme :** La liste des formulaires est vide

**Solutions :**
- Verifiez que les fichiers `.yaml` sont dans `backend/forms/`
- Verifiez que les fichiers YAML sont valides (utilisez un validateur YAML en ligne)
- Verifiez les permissions sur le repertoire `backend/forms/`

### La signature ne se capture pas

**Probleme :** Impossible de dessiner sur l'ecran tactile

**Solutions :**
- Verifiez que vous utilisez un navigateur mobile compatible (Chrome, Safari, Firefox)
- Verifiez que JavaScript est active dans votre navigateur
- Essayez de recharger la page

### Le PDF n'est pas genere

**Probleme :** Cliquer sur "Generer PDF" ne fait rien

**Solutions :**
- Verifiez que tous les champs requis sont remplis
- Verifiez que la signature a ete capturee
- Verifiez les logs du backend : `docker compose logs app`

### Impossible d'acceder au PDF genere

**Probleme :** Le PDF est genere mais impossible de le telecharger ou de l'afficher

**Solutions :**
- Verifiez les permissions sur le dossier `backend/uploads/pdfs/` :
  ```bash
  sudo chown -R 1001:1001 ./backend/uploads
  docker compose restart
  ```
- Verifiez que le PDF existe dans le dossier : `ls -la backend/uploads/pdfs/`
- Verifiez les logs : `docker compose logs app`

---

## 📦 Dependances

### Backend (Node.js)

| Dependances | Version | Utilisation |
|-------------|---------|-------------|
| express | ^4.18.2 | Framework web |
| express-session | ^1.17.3 | Gestion des sessions |
| dotenv | ^16.3.1 | Chargement des variables d'environnement |
| pdfkit | ^0.15.0 | Generation des PDFs |
| js-yaml | ^4.1.0 | Parsing des fichiers YAML |
| cors | ^2.8.5 | Gestion CORS |
| multer | ^1.4.5-lts.1 | Upload de fichiers |

### Frontend (JavaScript)

| Librairie | Version | Utilisation |
|-----------|---------|-------------|
| Signature Pad | ^4.1.4 | Capture de signature |
| Bootstrap | 5.x | Framework CSS |

---

## 🎨 Personnalisation des PDF

Form2Sign permet de personnaliser l'apparence des PDF generes directement depuis le fichier YAML de chaque formulaire.

### Fonctionnalites disponibles (via la section `pdf` dans le YAML) :
- **Logo** : Ajout d'un logo en en-tête (haut à gauche, centré ou à droite)
- **Texte d'introduction** : Texte avec sauts de ligne avant les champs
- **Sections personnalisées** : Ajout de texte, séparateurs, images, espacements
- **Pied de page personnalisé** : Avec pagination automatique
- **Styles** : Contrôle des polices, couleurs, tailles
- **Marges** : Personnalisation des marges de la page
- **Variables dynamiques** : Utilisation de `{date}`, `{champ_id}`, etc.

### Exemple minimal :
```yaml
form:
  id: mon_contrat
  title: "Contrat Client"
  pdf:
    header:
      logo: "/static/images/logo.png"
      logo_position: "top-left"
      title: "CONTRAT OFFICIEL"
    introduction: "Ce document officialise votre accord.\n\nDate: {date}"
    footer:
      left: "© 2024 Entreprise"
      center: "Page {pageNumber} de {pageCount}"
      right: "Généré le {date}"
  fields:
    - id: nom_client
      label: "Nom du client"
      type: text
      required: true
```

> ⚠️ **Pour plus de détails**, consultez [ROADMAP-PDF-ENRICHMENT.md](ROADMAP-PDF-ENRICHMENT.md)

---

## 📝 Changelog

### v1.5.0 - Améliorations Interface Formulaire (17/07/2026)
- Ajout d'un bouton **Annuler** dans la zone de signature pour retourner à la liste des formulaires
- Echange des couleurs des boutons **Effacer** (orange) et **Recommencer** (rouge) pour meilleure visibilité
- Bouton **Recommencer** réinitialise maintenant tout le formulaire

### v1.5.1 - Authentification simplifiée (18/07/2026)
- Suppression du hashing des mots de passe (bcryptjs)
- Comparaison directe des identifiants depuis le fichier .env
- Identifiants par defaut: **admin / admin**
- Mise a jour de la documentation (pas seulement la signature)

### v1.4.0 - Generation de PDF (16/07/2026)
- Implementation de l'API POST /api/generate-pdf
- Generation de PDF avec PDFKit contenant les donnees du formulaire, la signature et la date
- Stockage automatique des PDFs generes dans uploads/pdfs/
- Nom de fichier unique: [date]_[timestamp]_[formId].pdf
- Retourne l'URL de telechargement du PDF au frontend

### v1.3.0 - Suppression de formulaires (16/07/2026)
- Ajout d'une icône poubelle sur chaque carte de formulaire
- Implementation d'une modal de confirmation de suppression
- Implementation de l'API DELETE /api/forms/:id
- Suppression physique du fichier YAML du serveur
- Rechargement automatique de la liste apres suppression

### v1.2.0 - Upload de formulaires (16/07/2026)
- Ajout d'un bouton "Ajouter Formulaire" dans la navbar
- Creation d'une modal d'upload avec selection de fichier YAML
- Implementation de l'API POST /api/forms/upload avec multer
- Validation du type de fichier (YAML seulement)
- Validation du contenu YAML (structure avec cle "form")
- Verification de l'unicite de l'id du formulaire
- Feedback visuel pendant le telechargement
- Rechargement automatique de la liste des formulaires apres upload
- Limite de taille de fichier: 1MB

### v1.1.0 - Authentification (16/07/2026)
- Implementation complete du systeme d'authentification
- Creation de `authController.js` pour la verification des identifiants
- Creation de `authRoutes.js` (POST /api/login, GET /api/logout, GET /api/auth/status)
- Creation de `authMiddleware.js` pour la protection des routes
- Integration dans `app.js` avec protection des routes frontales et API
- Identifiants configures directement dans le fichier `.env` (admin/password123 par defaut)
- Gestion des sessions avec express-session

### v1.0.0 - Initialisation (16/07/2026)
- Creation de la structure complete du projet
- Configuration Docker
- Documentation initiale
- Preparation pour le developpement

---

## 📜 Licence

MIT License - Voir le fichier [LICENSE](LICENSE) pour plus de details.

---

## 👤 Contributeurs

- [Votre Nom] - Developpeur principal

---

## 📞 Support

Pour toute question ou problème, consultez :
1. Le fichier [DEV_LOG.md](DEV_LOG.md) pour l'historique du developpement
2. Les issues GitHub du projet
3. La documentation officielle des dependances utilisees
