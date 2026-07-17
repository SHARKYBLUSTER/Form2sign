# Form2Sign - Personnalisation PDF

**Solution 1: Personnalisation via section `pdf` dans le template YAML**  
**Version:** 1.0  
**Date:** 17 juillet 2026

---

## 📖 Introduction

Ce guide explique comment personnaliser l'apparence des PDF générés par Form2Sign en utilisant la section `pdf` dans vos fichiers YAML de formulaires.

Cette solution permet d'enrichir vos PDF avec :
- ✅ Logo en en-tête
- ✅ Texte d'introduction avec sauts de ligne
- ✅ Sections personnalisées (texte, séparateurs, images, espacements)
- ✅ Pied de page personnalisé avec pagination
- ✅ Contrôle des styles (polices, couleurs, tailles)
- ✅ Contrôle des marges et espacements
- ✅ Variables dynamiques (noms de champs, date, etc.)

---

## 🚀 Guide de Démarrage Rapide

### 1. Structure de base

Ajoutez une section `pdf` à votre formulaire YAML :

```yaml
form:
  id: mon_formulaire
  title: "Mon Formulaire"
  fields:
    - id: full_name
      label: "Nom complet"
      type: text
    # ... autres champs
  
  # NOUVEAU: Personnalisation PDF
  pdf:
    header:
      logo: /static/images/logo.png
      logo_position: top-left
      title: "Contrat - {full_name}"
    
    introduction:
      text: "Ce document est un contrat.\n\nSigné le {date}."
      font_size: 12
    
    footer:
      text: "Page {pageNumber} sur {pageCount}"
```

### 2. Exemple complet

Voir le fichier `template.yaml` pour un exemple complet avec toutes les options.

---

## 📝 Référence Complète des Options

### Structure Globale

```yaml
form:
  id: mon_formulaire
  title: "Mon Formulaire"
  fields: [...]
  signature: {...}
  style: {...}
  pdf:                          # Section de personnalisation PDF
    page: {...}                 # Configuration de la page
    header: {...}               # Configuration de l'en-tête
    introduction: {...}         # Texte d'introduction
    custom_sections: [...]       # Sections personnalisées
    footer: {...}                # Pied de page
    spacing: {...}               # Espacements
    styles: {...}               # Styles globaux
```

---

### 📄 Configuration de la Page (`page`)

| Option | Type | Valeurs possibles | Défaut | Description |
|--------|------|-------------------|--------|-------------|
| `size` | string | A4, A5, Letter, Legal | A4 | Taille du papier |
| `orientation` | string | portrait, landscape | portrait | Orientation |
| `margins` | object | {top, bottom, left, right} | {top:50, bottom:50, left:50, right:50} | Marges en points |

**Exemple :**
```yaml
pdf:
  page:
    size: A4
    orientation: portrait
    margins:
      top: 60
      bottom: 60
      left: 40
      right: 40
```

---

### 🎯 Configuration de l'En-tête (`header`)

| Option | Type | Valeurs possibles | Défaut | Description |
|--------|------|-------------------|--------|-------------|
| `logo` | string | Chemin vers l'image | null | Chemin relatif à `/frontend/public/` |
| `logo_position` | string | top-left, top-center, top-right | top-left | Position du logo |
| `logo_width` | number | > 0 | 100 | Largeur du logo en points |
| `logo_height` | number | > 0 | 50 | Hauteur du logo en points |
| `title` | string | Texte | Titre du formulaire | Titre de l'en-tête (supporte variables) |
| `title_font_size` | number | > 0 | 20 | Taille de la police du titre |
| `title_color` | string | Code hex ou nom | #000000 | Couleur du titre |
| `subtitle` | string | Texte | null | Sous-titre optionnel |
| `subtitle_font_size` | number | > 0 | 12 | Taille de la police du sous-titre |
| `subtitle_color` | string | Code hex ou nom | #666666 | Couleur du sous-titre |

**Exemple :**
```yaml
pdf:
  header:
    logo: /static/images/mon-logo.png
    logo_position: top-center
    logo_width: 150
    logo_height: 75
    title: "Contrat de service - {full_name}"
    title_font_size: 24
    title_color: "#2c3e50"
    subtitle: "Document confidentiel"
    subtitle_font_size: 14
    subtitle_color: "#7f8c8d"
```

---

### 📝 Texte d'Introduction (`introduction`)

| Option | Type | Valeurs possibles | Défaut | Description |
|--------|------|-------------------|--------|-------------|
| `text` | string | Texte | null | Texte d'introduction (supporte `\n` et variables) |
| `font_size` | number | > 0 | 12 | Taille de la police |
| `color` | string | Code hex ou nom | #333333 | Couleur du texte |
| `spacing_after` | number | >= 0 | 1 | Nombre de lignes vides après |

**Exemple :**
```yaml
pdf:
  introduction:
    text: |
      Ce contrat est établi entre {company_name} (ci-après "le fournisseur")
      et {full_name} (ci-après "le client").
      
      Signé le {date} à {time}.
      
      Veuillez lire attentivement avant de signer.
    font_size: 12
    color: "#34495e"
    spacing_after: 2
```

---

### 🧩 Sections Personnalisées (`custom_sections`)

Tableau de sections à insérer avant la signature. Chaque section peut être de type : `text`, `separator`, `image`, ou `spacing`.

#### Type: `text`

| Option | Type | Valeurs possibles | Défaut | Description |
|--------|------|-------------------|--------|-------------|
| `type` | string | text | requis | Type de section |
| `content` | string | Texte | requis | Contenu (supporte variables et `\n`) |
| `style` | object | {font_size, font, color, align} | null | Styles |
| `spacing_before` | number | >= 0 | 0 | Espacement avant en lignes |
| `spacing_after` | number | >= 0 | 0 | Espacement après en lignes |

**Exemple :**
```yaml
custom_sections:
  - type: text
    content: "ARTICLE 1: OBJET"
    style:
      font_size: 16
      font: Helvetica-Bold
      color: "#2c3e50"
      align: left
    spacing_after: 1
```

#### Type: `separator`

| Option | Type | Valeurs possibles | Défaut | Description |
|--------|------|-------------------|--------|-------------|
| `type` | string | separator | requis | Type de section |
| `color` | string | Code hex ou nom | #cccccc | Couleur de la ligne |
| `width` | number | > 0 | 500 | Largeur de la ligne en points |
| `height` | number | > 0 | 1 | Hauteur de la ligne en points |
| `spacing_before` | number | >= 0 | 0 | Espacement avant |
| `spacing_after` | number | >= 0 | 0 | Espacement après |

**Exemple :**
```yaml
custom_sections:
  - type: separator
    color: "#bdc3c7"
    width: 550
    height: 2
    spacing_before: 1
    spacing_after: 1
```

#### Type: `image`

| Option | Type | Valeurs possibles | Défaut | Description |
|--------|------|-------------------|--------|-------------|
| `type` | string | image | requis | Type de section |
| `content` | string | Chemin | requis | Chemin vers l'image (relatif à `/frontend/public/`) |
| `width` | number | > 0 | null | Largeur de l'image en points |
| `height` | number | > 0 | null | Hauteur de l'image en points |
| `align` | string | left, center, right | center | Alignement horizontal |
| `spacing_before` | number | >= 0 | 0 | Espacement avant |
| `spacing_after` | number | >= 0 | 0 | Espacement après |

**Exemple :**
```yaml
custom_sections:
  - type: image
    content: /static/images/watermark.png
    width: 200
    height: 100
    align: center
    spacing_after: 1
```

#### Type: `spacing`

| Option | Type | Valeurs possibles | Défaut | Description |
|--------|------|-------------------|--------|-------------|
| `type` | string | spacing | requis | Type de section |
| `lines` | number | >= 0 | 1 | Nombre de lignes vides à ajouter |

**Exemple :**
```yaml
custom_sections:
  - type: spacing
    lines: 2
```

---

### 👣 Pied de Page (`footer`)

| Option | Type | Valeurs possibles | Défaut | Description |
|--------|------|-------------------|--------|-------------|
| `text` | string | Texte | null | Texte du pied de page (supporte variables spéciales) |
| `font_size` | number | > 0 | 8 | Taille de la police |
| `color` | string | Code hex ou nom | #999999 | Couleur du texte |
| `align` | string | left, center, right | center | Alignement |

**Variables spéciales disponibles dans le footer :**
- `{pageNumber}` - Numéro de la page actuelle
- `{pageCount}` - Nombre total de pages
- `{date}` - Date du jour
- `{time}` - Heure actuelle
- `{full_name}` - Nom complet (si champ existe)
- `{form_id}` - ID du formulaire
- `{form_title}` - Titre du formulaire

**Exemple :**
```yaml
pdf:
  footer:
    text: "Page {pageNumber}/{pageCount} - {form_title} - Généré le {date}"
    font_size: 8
    color: "#7f8c8d"
    align: center
```

---

### 📏 Espacements (`spacing`)

| Option | Type | Valeurs possibles | Défaut | Description |
|--------|------|-------------------|--------|-------------|
| `between_fields` | number | >= 0 | 0.5 | Espacement entre les champs du formulaire (en lignes) |
| `after_header` | number | >= 0 | 1 | Lignes vides après l'en-tête |
| `before_signature` | number | >= 0 | 2 | Lignes vides avant la section signature |

**Exemple :**
```yaml
pdf:
  spacing:
    between_fields: 1
    after_header: 2
    before_signature: 3
```

---

### 🎨 Styles Globaux (`styles`)

| Option | Type | Valeurs possibles | Défaut | Description |
|--------|------|-------------------|--------|-------------|
| `font_family` | string | Nom de police | Helvetica | Famille de police par défaut |
| `text_color` | string | Code hex ou nom | #000000 | Couleur de texte par défaut |
| `title_color` | string | Code hex ou nom | #000000 | Couleur des titres par défaut |

**Exemple :**
```yaml
pdf:
  styles:
    font_family: Helvetica
    text_color: "#333333"
    title_color: "#2c3e50"
```

---

## 🔧 Variables Disponibles

Vous pouvez utiliser des variables dans les textes (titre, introduction, sections, footer) :

### Variables de contexte
| Variable | Description | Format |
|----------|-------------|--------|
| `{full_name}` | Nom complet | Texte |
| `{date}` | Date du jour | fr-FR (ex: 17/07/2026) |
| `{time}` | Heure actuelle | fr-FR (ex: 14:30:45) |
| `{form_id}` | ID du formulaire | Texte |
| `{form_title}` | Titre du formulaire | Texte |
| `{pageNumber}` | Numéro de page | Nombre |
| `{pageCount}` | Nombre total de pages | Nombre |

### Variables de champs

Vous pouvez accéder à la valeur de n'importe quel champ du formulaire en utilisant `{<field_id>}` :

```yaml
introduction:
  text: "Bonjour {full_name},\nVotre email: {email}"
```

Si le champ `company_name` existe dans votre formulaire, vous pouvez l'utiliser :
```yaml
header:
  title: "Contrat avec {company_name}"
```

---

## 📁 Chemins des Images

Les chemins des images (logo, images dans custom_sections) sont **relatifs à `/frontend/public/`**.

**Exemples :**
- `/static/images/logo.png` → `/frontend/public/static/images/logo.png`
- `/assets/my-logo.jpg` → `/frontend/public/assets/my-logo.jpg`

**Formats supportés :**
- PNG
- JPEG/JPG
- GIF (animations non supportées)
- BMP

**Bonnes pratiques :**
- Utilisez des images de taille raisonnable (max 2000x2000px)
- Préférez le format PNG pour les logos (transparence supportée)
- Placez vos images dans `/frontend/public/static/images/` ou un sous-dossier

---

## ✨ Bonnes Pratiques

### 1. Commencez simple

Ne personnalisez pas tout d'un coup. Testez avec une seule option à la fois.

### 2. Utilisez des sections modulaire

Organisez vos `custom_sections` de manière logique :
```yaml
custom_sections:
  # En-tête de section
  - type: text
    content: "INFORMATIONS CLIENT"
    style:
      font: Helvetica-Bold
      font_size: 14
    spacing_after: 0.5
  
  # Séparateur
  - type: separator
    spacing_after: 0.5
  
  # Contenu
  - type: text
    content: "Nom: {full_name}\nEmail: {email}"
    spacing_after: 1
```

### 3. Testez avec différents navigateurs

La génération PDF utilise pdfkit, mais l'affichage peut varier selon le visualiseur PDF.

### 4. Gérez les erreurs

Si une image n'existe pas, le PDF sera généré sans erreur mais sans l'image.  
Vérifiez toujours que vos chemins sont corrects.

### 5. Sauvegardez vos templates

Conservez une copie de vos templates YAML avant modification.

---

## ⚠️ Limites Connues

### Limites de pdfkit
- Pas de support natif pour le HTML/CSS dans les textes
- Les polices personnalisées (TTF) ne sont pas encore supportées
- Pas de support pour les tableaux
- Les images doivent être disponibles localement (pas d'URL distantes)

### Limites de Form2Sign
- Maximum 10 Mo par PDF généré
- Maximum 50 pages par PDF (configurable)
- Les variables non définies sont remplacées par une chaîne vide

---

## 🔄 Rétrocompatibilité

- Les formulaires **sans** section `pdf` continueront à fonctionner avec les valeurs par défaut
- Les formulaires avec une section `pdf` **partielle** utiliseront les valeurs par défaut pour les options manquantes
- Les options inconnues sont ignorées (pas d'erreur)

---

## 📚 Exemples Complets

### Exemple 1: Logo + Titre + Footer

```yaml
form:
  id: simple_contract
  title: "Contrat Simple"
  fields: [...]
  pdf:
    header:
      logo: /static/images/logo.png
      logo_position: top-center
      title: "CONTRAT"
    footer:
      text: "Page {pageNumber}/{pageCount}"
```

### Exemple 2: Introduction avec Variables

```yaml
form:
  id: client_contract
  title: "Contrat Client"
  fields:
    - id: company_name
      label: "Nom de l'entreprise"
      type: text
    - id: client_name
      label: "Nom du client"
      type: text
  pdf:
    introduction:
      text: |
        Contrat entre {company_name} et {client_name}
        
        Date: {date}
      font_size: 12
      spacing_after: 2
```

### Exemple 3: Sections Personnalisées Complexes

```yaml
form:
  id: detailed_contract
  title: "Contrat Détaillé"
  fields: [...]
  pdf:
    custom_sections:
      - type: text
        content: "ARTICLE 1: PRÉAMBULE"
        style:
          font: Helvetica-Bold
          font_size: 14
        spacing_after: 0.5
      
      - type: separator
        color: "#3498db"
        width: 500
        height: 2
        spacing_after: 1
      
      - type: text
        content: |
          Le présent contrat a pour objet de définir les conditions de collaboration
          entre les parties.
        style:
          font_size: 11
          color: "#34495e"
        spacing_after: 1
      
      - type: spacing
        lines: 1
      
      - type: text
        content: "ARTICLE 2: DURÉE"
        style:
          font: Helvetica-Bold
          font_size: 14
```

### Exemple 4: Tout Compris

Voir le fichier `template.yaml` pour un exemple complet avec toutes les options.

---

## 🛠️ Dépannage

### Le logo n'apparaît pas
- Vérifiez que le chemin est correct
- Vérifiez que le fichier existe dans `/frontend/public/`
- Vérifiez que le format est supporté (PNG, JPG, GIF)
- Essayez avec un chemin absolu pour tester

### Les variables ne sont pas remplacées
- Vérifiez que le nom du champ existe dans votre formulaire
- Vérifiez la casse (sensible à la casse)
- Les champs vides sont remplacés par une chaîne vide

### Le PDF est trop grand
- Réduisez la taille de vos images
- Limitez le nombre de sections personnalisées
- Utilisez des polices plus petites

### Erreur lors de la génération
- Vérifiez la syntaxe YAML (indentation, deux-points, etc.)
- Utilisez un validateur YAML en ligne pour vérifier votre fichier
- Consultez les logs du serveur pour plus de détails

---

## 📞 Support

Pour toute question ou problème :
1. Vérifiez ce guide et les exemples
2. Consultez les logs du serveur (`backend/logs/` si configuré)
3. Ouvrez une issue sur GitHub avec :
   - Le contenu de votre fichier YAML
   - La description du problème
   - Les logs d'erreur

---

**Document créé le:** 17 juillet 2026  
**Dernière mise à jour:** 17 juillet 2026  
**Version:** 1.0  
**Solution:** Solution 1 - Section `pdf` dans YAML
