# Form2Sign

## 📌 Description

Form2Sign est une application web **mobile-first** qui permet de :
- Remplir des formulaires dynamiques definis via des fichiers YAML
- Capturer une signature via l'ecran tactile d'un telephone mobile
- Generer un PDF contenant le formulaire rempli, la signature et la date
- Stocker les PDFs generes dans un repertoire dedie
- Proteger l'acces par authentification (login/mot de passe via .env)

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
git clone https://github.com/[ton-user]/form2sign.git
cd form2sign

# Copier et configurer le fichier d'environnement
cp backend/config/.env.example backend/config/.env

# Editer .env avec vos identifiants (voir section Configuration)
nano backend/config/.env  # ou utilisez votre editeur prefere

# Demarrer l'application avec Docker Compose
docker-compose up -d

# Verifier que le conteneur est en cours d'execution
docker-compose ps

# Voir les logs
docker-compose logs -f

# Acceder a l'application
# Ouvrez votre navigateur : http://localhost:3000
```

### Methode 2: Sans Docker (pour le developpement)

```bash
# Cloner le depot
git clone https://github.com/[ton-user]/form2sign.git
cd form2sign

# Installer les dependances
npm install

# Copier et configurer le fichier d'environnement
cp backend/config/.env.example backend/config/.env

# Editer .env avec vos identifiants
nano backend/config/.env

# Demarrer l'application en mode developpement (avec auto-reload)
npm run dev

# Acceder a l'application
# Ouvrez votre navigateur : http://localhost:3000
```

---

## 🛠️ Configuration

### Variables d'environnement (.env)

Copiez le fichier `.env.example` vers `.env` et adaptez les valeurs :

```bash
cp backend/config/.env.example backend/config/.env
```

| Variable | Description | Exemple | Requise |
|----------|-------------|---------|---------|
| APP_USER | Nom d'utilisateur pour la connexion | `admin` | ✅ Oui |
| APP_PASSWORD | Mot de passe (sera hashe automatiquement) | `monmotdepasse` | ✅ Oui |
| SESSION_SECRET | Cle secrete pour les cookies de session | `ma_cle_secrete_aleatoire_12345` | ✅ Oui |
| PORT | Port sur lequel l'application ecoute | `3000` | ✅ Oui |
| NODE_ENV | Environnement (development/production) | `development` | ❌ Non |
| PDF_STORAGE_PATH | Chemin de stockage des PDFs | `./backend/uploads/pdfs` | ❌ Non |
| FORMS_DIRECTORY | Repertoire des formulaires YAML | `./backend/forms` | ❌ Non |

> ⚠️ **IMPORTANT** : Ne commitez JAMAIS le fichier `.env` dans Git. Il contient des informations sensibles.

---

## 📱 Utilisation

### Etape 1: Connexion
1. Accedez a l'application via votre navigateur : `http://localhost:3000`
2. Utilisez les identifiants configures dans le fichier `.env` (APP_USER / APP_PASSWORD)

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
2. Les PDFs sont aussi stockes dans `backend/uploads/pdfs/[date]/`

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

---

## 📁 Structure du Projet

```
form2sign/
├── backend/                          # Backend Node.js + Express
│   ├── app.js                        # Point d'entree de l'application
│   ├── config/
│   │   ├── .env                      # Variables d'environnement (SECRETE)
│   │   └── .env.example              # Template pour .env
│   ├── controllers/                  # Controleurs Express
│   │   ├── authController.js
│   │   ├── formController.js
│   │   └── pdfController.js
│   ├── models/                       # Modeles de donnees
│   ├── services/                    # Services metiers
│   │   ├── formParser.js            # Parse les fichiers YAML
│   │   ├── pdfGenerator.js          # Genere les PDFs
│   │   └── storageService.js        # Gestion du stockage
│   ├── routes/                      # Routes Express
│   │   ├── authRoutes.js
│   │   ├── formRoutes.js
│   │   └── apiRoutes.js
│   ├── middlewares/                 # Middlewares Express
│   │   └── authMiddleware.js        # Verification d'authentification
│   ├── forms/                       # Formulaires dynamiques
│   │   ├── template.yaml            # Template de base
│   │   └── [nom_du_formulaire].yaml
│   └── uploads/                     # Stockage des fichiers
│       └── pdfs/                    # PDFs generes
│
├── frontend/                        # Frontend HTML/CSS/JS
│   ├── index.html                   # Page principale
│   ├── views/
│   │   ├── login.html               # Page de connexion
│   │   ├── form-list.html           # Liste des formulaires
│   │   ├── form.html                # Formulaire a remplir
│   │   └── success.html             # Page de succes
│   └── public/
│       ├── css/
│       │   └── style.css            # Styles CSS
│       ├── js/
│       │   ├── app.js               # Application frontend
│       │   ├── signature.js          # Gestion de la signature
│       │   └── formRenderer.js       # Rendu des formulaires
│       └── images/                  # Images statiques
│
├── Dockerfile                       # Definition de l'image Docker
├── docker-compose.yml               # Configuration Docker Compose
├── .dockerignore                    # Fichiers a exclure du build Docker
├── .gitignore                       # Fichiers a exclure de Git
├── package.json                     # Dependances Node.js
├── README.md                        # Documentation (ce fichier)
└── DEV_LOG.md                       # Journal de developpement
```

---

## 👨‍💻 Developpement

### Commandes utiles

#### Avec Docker
```bash
# Builder l'image
docker-compose build

# Demarrer les services
docker-compose up -d

# Arreter les services
docker-compose down

# Redemarrer les services
docker-compose restart

# Voir les logs
docker-compose logs -f

# Acceder au conteneur (pour deboguer)
docker exec -it form2sign-app sh

# Mettre a jour apres modification
docker-compose down && docker-compose up -d --build
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

1. Creez un fichier `.yaml` dans le repertoire `backend/forms/`
2. Suivez le format definis dans `backend/forms/template.yaml`
3. Exemple minimal :

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
docker-compose logs

# Vérifier les volumes
docker volume ls

# Verifier les conteneurs en cours
docker ps -a
```

**Solutions courantes :**
- Verifiez que le port 3000 est disponible
- Verifiez les permissions sur les fichiers `.env`
- Verifiez que le fichier `.env` existe et contient les variables requises

### Erreur de connexion

**Probleme :** "Identifiants incorrects"

**Solutions :**
- Verifiez que `APP_USER` et `APP_PASSWORD` sont correctement definis dans `.env`
- Verifiez que le mot de passe n'est pas deja hashe (le systeme le hashe automatiquement)
- Verifiez les majuscules/minuscules (la connexion est sensible a la casse)

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
- Verifiez les logs du backend : `docker-compose logs app`

---

## 📦 Dependances

### Backend (Node.js)

| Dependances | Version | Utilisation |
|-------------|---------|-------------|
| express | ^4.18.2 | Framework web |
| express-session | ^1.17.3 | Gestion des sessions |
| bcryptjs | ^2.4.3 | Hashage des mots de passe |
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

## 📝 Changelog

### v1.1.0 - Authentification (16/07/2026)
- Implementation complete du systeme d'authentification
- Creation de `authController.js` avec bcrypt pour le hashage des mots de passe
- Creation de `authRoutes.js` (POST /api/login, GET /api/logout, GET /api/auth/status)
- Creation de `authMiddleware.js` pour la protection des routes
- Integration dans `app.js` avec protection des routes frontales et API
- Auto-hashage du mot de passe au premier demarrage
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
