# Guide de Creation de Templates YAML - Form2Sign v2.0+

> **Version du document :** 1.0.0  
> **Derniere mise a jour :** 18 juillet 2026  
> **Systeme :** Form2Sign v2.0+ (Nouveau systeme de generation PDF via Puppeteer)

---

## Table des Matières

1. [Introduction](#introduction)
2. [Structure Generale du Fichier YAML](#structure-generale-du-fichier-yaml)
3. [Section `form`](#section-form)
4. [Section `template`](#section-template)
5. [Section `fields`](#section-fields)
6. [Section `signature`](#section-signature)
7. [Placeholders Disponibles](#placeholders-disponibles)
8. [Classes CSS Speciales](#classes-css-speciales)
9. [Options de Generation PDF](#options-de-generation-pdf)
10. [Types de Champs Supportes](#types-de-champs-supportes)
11. [Exemple Complet](#exemple-complet)
12. [Bonnes Pratiques](#bonnes-pratiques)
13. [Depannage](#depannage)

---

## Introduction

A partir de la version 2.0, Form2Sign utilise un **nouveau systeme** pour la generation de PDF :

- ✅ Le YAML definit une **page web complete** (HTML + CSS)
- ✅ Un apercu HTML est affiche a l'utilisateur avant generation
- ✅ Le PDF est une **capture exacte** de cette page via Puppeteer (Chromium)
- ❌ Plus de pdfkit : le rendu est delegue au navigateur

**Avantages :**
- Rendu HTML/CSS standard (meilleure compatibilite)
- Design personnalisable via CSS
- Apercu fideles avant impression
- Support des polices, couleurs, bordures, etc.

---

## Structure Generale du Fichier YAML

```yaml
form:
  # Metadata du formulaire
  id: identifiant-unique
  title: "Titre du formulaire"
  description: "Description du formulaire"
  version: "2.0.0"
  
  # Definition de la page web
  template:
    style: "... CSS ..."      # Styles CSS pour la page
    layout: "... HTML ..."    # Layout HTML avec placeholders
    pdf:                    # Options de generation PDF
      format: A4
      orientation: portrait
      margin: 10mm
  
  # Liste des champs du formulaire
  fields:
    - id: champ1
      label: "Libelle du champ"
      type: text
      required: true
      placeholder: "Texte d'aide"
      # ... autres proprietes selon le type
  
  # Configuration de la signature
  signature:
    required: true
    label: "Signature"
    instructions: "Instructions pour la signature"
```

---

## Section `form`

### Proprietes Obligatoires

| Propriete | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `id` | string | Identifiant unique du formulaire (utilise dans les URLs) | `contrat-web` |
| `title` | string | Titre affiche dans l'interface | `"Contrat de Service"` |
| `version` | string | Version du template | `"2.0.0"` |

### Proprietes Optionnelles

| Propriete | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `description` | string | Description du formulaire | `"Template pour contrats de service en ligne"` |

---

## Section `template`

C'est le **cœur du nouveau systeme**. Cette section definit comment le PDF sera genere.

### Sous-section `style` (CSS)

Definit les styles CSS qui seront appliques a la page HTML. Utilisez du CSS standard.

```yaml
template:
  style: |
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #007bff;
      padding-bottom: 20px;
    }
    .field-value {
      border: 1px solid #ddd;
      padding: 8px;
      background: white;
    }
```

**Conseils CSS :**
- Utilisez des **largeurs fixes ou max-width** pour un bon rendu PDF
- Evitez les positions `absolute` ou `fixed` (problemes de capture)
- Privilégiez les polices standard (Arial, Times New Roman, Courier) ou Google Fonts pre-chargees

### Sous-section `layout` (HTML)

Definit le **contenu HTML** de la page. Utilisez des **placeholders** pour injecter les valeurs.

```yaml
template:
  layout: |
    <div class="header">
      <img src="/static/logos/form2sign-logo.jpg" alt="Logo" />
      <h1>{form_title}</h1>
      <p>Date: {date}</p>
    </div>
    
    <div class="field-group">
      <span class="field-label">Nom</span>
      <div class="field-value">{full_name}</div>
    </div>
    
    <div class="signature-container">
      <img src="{signature}" alt="Signature" />
    </div>
```

### Sous-section `pdf`

Options de generation du PDF via Puppeteer.

| Propriete | Type | Valeurs possibles | Defaut | Description |
|-----------|------|-------------------|--------|-------------|
| `format` | string | A4, A5, A3, A6, Letter, Legal | A4 | Format du papier |
| `orientation` | string | portrait, landscape | portrait | Orientation |
| `margin` | string/object | Valeur unique (ex: `10mm`) ou objet | 10mm | Marges du document |

**Exemple avec marges personnalisees :**
```yaml
pdf:
  format: A4
  orientation: portrait
  margin:
    top: 15mm
    bottom: 15mm
    left: 20mm
    right: 20mm
```

---

## Section `fields`

Liste de tous les champs que l'utilisateur devra remplir dans le formulaire web.

### Proprietes Communes a Tous les Types

| Propriete | Type | Obligatoire | Description | Exemple |
|-----------|------|-------------|-------------|---------|
| `id` | string | ✅ | Identifiant unique du champ | `full_name` |
| `label` | string | ✅ | Libelle affiche dans le formulaire | `"Nom complet"` |
| `type` | string | ✅ | Type de champ (voir ci-dessous) | `text` |
| `required` | boolean | ❌ | Champ obligatoire | `true` |
| `placeholder` | string | ❌ | Texte d'aide dans le champ | `"Entrez votre nom"` |
| `validation` | string | ❌ | Type de validation | `"email"` |

### Types de Champs Supportes

#### 1. Champ texte (`text`)
```yaml
- id: full_name
  label: "Nom complet"
  type: text
  required: true
  placeholder: "Entrez votre nom et prenom"
```

#### 2. Champ email (`email`)
```yaml
- id: email
  label: "Adresse email"
  type: email
  required: true
  placeholder: "exemple@domaine.com"
  validation: "email"
```

#### 3. Champ telephone (`tel`)
```yaml
- id: phone
  label: "Numero de telephone"
  type: tel
  required: false
  placeholder: "+33 1 23 45 67 89"
```

#### 4. Champ nombre (`number`)
```yaml
- id: amount
  label: "Montant"
  type: number
  required: false
  placeholder: "1000"
```

#### 5. Zone de texte (`textarea`)
```yaml
- id: address
  label: "Adresse"
  type: textarea
  required: false
  placeholder: "Votre adresse complete"
  rows: 3
```

#### 6. Liste deroulante (`select`)
```yaml
- id: country
  label: "Pays"
  type: select
  required: true
  placeholder: "Selectionnez un pays"
  options:
    - label: "France"
      value: "FR"
    - label: "Belgique"
      value: "BE"
    - label: "Suisse"
      value: "CH"
```

#### 7. Champ date (`date`)
```yaml
- id: birth_date
  label: "Date de naissance"
  type: date
  required: false
```

#### 8. Bouton radio (`radio`)
```yaml
- id: gender
  label: "Genre"
  type: radio
  required: false
  options:
    - label: "Homme"
      value: "M"
    - label: "Femme"
      value: "F"
```

#### 9. Case a cocher (`checkbox`)
```yaml
- id: accept_terms
  label: "J'accepte les conditions"
  type: checkbox
  required: true
```

---

## Section `signature`

Configuration de la zone de signature.

| Propriete | Type | Obligatoire | Description | Exemple |
|-----------|------|-------------|-------------|---------|
| `required` | boolean | ✅ | Signature obligatoire | `true` |
| `label` | string | ✅ | Libelle de la signature | `"Signature"` |
| `instructions` | string | ❌ | Instructions pour l'utilisateur | `"Signez avec votre doigt ou un stylet"` |

**Exemple :**
```yaml
signature:
  required: true
  label: "Signature"
  instructions: "Signez avec votre doigt ou un stylet sur l'ecran tactile."
```

---

## Placeholders Disponibles

Les placeholders permettent d'injecter des valeurs dynamiques dans le layout HTML.

| Placeholder | Description | Format | Exemple |
|-------------|-------------|--------|---------|
| `{field_id}` | Valeur d'un champ du formulaire | Depends du type | `{full_name}` → "Jean Dupont" |
| `{date}` | Date du jour | JJ/MM/AAAA | `{date}` → "18/07/2026" |
| `{time}` | Heure actuelle | HH:MM:SS | `{time}` → "14:30:45" |
| `{form_id}` | Identifiant du formulaire | string | `{form_id}` → "contrat-web" |
| `{form_title}` | Titre du formulaire | string | `{form_title}` → "Contrat de Service" |
| `{signature}` | Image de la signature (base64 PNG) | data URL | `<img src="{signature}" />` |

---

## Classes CSS Speciales

Form2Sign definit des classes CSS speciales avec des styles pre-definis :

| Classe | Description | Utilisation |
|--------|-------------|-------------|
| `.signature-container` | Conteneur pour la signature | `width: 300px; height: 100px;` recommande |
| `.no-print` | Elements exclus du PDF | Pour les boutons, elements d'apercu |
| `.field-value` | Valeur d'un champ | Style des valeurs affichees |
| `.field-label` | Libelle d'un champ | Style des libelles |

**Exemple d'utilisation de `.signature-container` :**
```html
<div class="signature-container">
  <img src="{signature}" alt="Signature" />
</div>
```

---

## Options de Generation PDF

### Format de Papier

| Format | Dimensions | Utilisation |
|--------|------------|-------------|
| A0 | 841 × 1189 mm | Très grands documents |
| A1 | 594 × 841 mm | Grands plans |
| A2 | 420 × 594 mm | Plans moyens |
| A3 | 297 × 420 mm | Documents techniques |
| **A4** | **210 × 297 mm** | **Standard (defaut)** |
| A5 | 148 × 210 mm | Petits documents |
| Letter | 216 × 279 mm | Standard US |
| Legal | 216 × 356 mm | Documents juridiques US |

### Orientation

- **`portrait`** : Vertical (defaut)
- **`landscape`** : Horizontal

### Marges

Peut être spécifie de plusieurs manières :

```yaml
# Marges uniformes
margin: 10mm

# Marges differentes
margin:
  top: 15mm
  bottom: 15mm
  left: 20mm
  right: 20mm
```

---

## Exemple Complet

Voici un exemple complet de template YAML fonctionnel :

```yaml
# =============================================================================
# Form2Sign - Template de Contrat
# =============================================================================

form:
  id: contrat-service
  title: "Contrat de Service"
  description: "Template pour la creation de contrats de service."
  version: "2.0.0"

  template:
    style: |
      body {
        font-family: 'DejaVu Sans', Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        color: #333;
        line-height: 1.6;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #2c3e50;
        padding-bottom: 20px;
      }
      
      .header h1 {
        color: #2c3e50;
        margin: 0;
      }
      
      .field-group {
        margin-bottom: 15px;
      }
      
      .field-label {
        font-weight: bold;
        display: block;
        margin-bottom: 5px;
      }
      
      .field-value {
        padding: 10px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .signature-container {
        width: 300px;
        height: 100px;
        border: 2px solid #2c3e50;
        margin: 20px auto;
        background: white;
      }
      
      .signature-container img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 12px;
        color: #666;
        padding-top: 20px;
        border-top: 1px solid #eee;
      }
    
    layout: |
      <div class="header">
        <h1>{form_title}</h1>
        <p>Reference: {form_id} | Date: {date}</p>
      </div>
      
      <div class="field-group">
        <span class="field-label">Client</span>
        <div class="field-value">{client_name}</div>
      </div>
      
      <div class="field-group">
        <span class="field-label">Prestataire</span>
        <div class="field-value">{prestataire_name}</div>
      </div>
      
      <div class="field-group">
        <span class="field-label">Objet du contrat</span>
        <div class="field-value">{objet}</div>
      </div>
      
      <div class="field-group">
        <span class="field-label">Montant</span>
        <div class="field-value">{montant} €</div>
      </div>
      
      <div class="field-group">
        <span class="field-label">Date de début</span>
        <div class="field-value">{date_debut}</div>
      </div>
      
      <div class="field-group">
        <span class="field-label">Date de fin</span>
        <div class="field-value">{date_fin}</div>
      </div>
      
      <p style="margin: 30px 0; text-align: center;">
        Fait à {lieu}, le {date}<br>
        En deux exemplaires originaux.
      </p>
      
      <div class="signature-container">
        <img src="{signature}" alt="Signature" />
      </div>
      
      <p style="text-align: center; font-size: 12px;">
        Signature du client: {client_name}
      </p>
      
      <div class="footer">
        <p>Document genere via Form2Sign - {form_id} | Page 1/1</p>
      </div>
    
    pdf:
      format: A4
      orientation: portrait
      margin: 15mm

  fields:
    - id: client_name
      label: "Nom du client"
      type: text
      required: true
      placeholder: "Nom et prenom du client"

    - id: prestataire_name
      label: "Nom du prestataire"
      type: text
      required: true
      placeholder: "Nom du prestataire"

    - id: objet
      label: "Objet du contrat"
      type: textarea
      required: true
      placeholder: "Decrivez l'objet du contrat"
      rows: 3

    - id: montant
      label: "Montant (€)"
      type: number
      required: true
      placeholder: "0.00"

    - id: date_debut
      label: "Date de début"
      type: date
      required: true

    - id: date_fin
      label: "Date de fin"
      type: date
      required: true

    - id: lieu
      label: "Lieu"
      type: text
      required: true
      placeholder: "Ville"

  signature:
    required: true
    label: "Signature"
    instructions: "Signez pour valider le contrat."
```

---

## Bonnes Pratiques

### 1. Organisation du YAML

✅ **Faites :**
- Utilisez des **commentaires** pour separer les sections
- Indentez correctement (2 espaces recommandes)
- Regroupez les champs logiquement dans le layout HTML

❌ **Evitez :**
- Des lignes extremement longues (> 120 caracteres)
- Des IDs de champs avec des espaces ou caracteres speciaux
- Des placeholders non defines

### 2. Design CSS

✅ **Faites :**
- Utilisez des **polices standard** (Arial, Times, Courier)
- Definissez une **largeur maximale** pour le contenu
- Utilisez des **couleurs contrastées** pour le texte
- Testez l'aperçu avant de generer le PDF

❌ **Evitez :**
- Les positions `absolute` ou `fixed`
- Les `overflow: hidden` qui peuvent couper du contenu
- Les animations CSS (ne seront pas capturees)

### 3. Accessibilite

✅ **Faites :**
- Ajoutez des attributs `alt` aux images
- Utilisez des contrastes de couleurs suffisants
- Structurez le HTML avec des balises semantiques (`<h1>`, `<h2>`, `<p>`, etc.)

### 4. Nommage

✅ **Utilisez des IDs clairs :**
- `client_first_name` plutot que `cfn`
- `contract_start_date` plutot que `date1`
- `total_amount_ht` plutot que `amount`

---

## Depannage

### Probleme : Le PDF est vide

**Causes possibles :**
- Le layout HTML est vide
- Erreur de syntaxe YAML
- Le conteneur a une hauteur de 0

**Solution :**
- Verifiez la syntaxe YAML avec un validateur en ligne
- Ajoutez un `min-height` au body dans le CSS

### Probleme : Les images ne s'affichent pas

**Causes possibles :**
- Chemin incorrect dans `src`
- Image non accessible depuis le serveur

**Solution :**
- Utilisez des chemins absolus : `/static/logos/form2sign-logo.jpg`
- Verifiez que le fichier existe dans `backend/uploads/logos/`

### Probleme : Les polices ne sont pas correctes

**Causes possibles :**
- Police non disponible dans Chromium
- Erreur dans le nom de la police

**Solution :**
- Utilisez des polices standard : Arial, Times New Roman, Courier New
- Ou utilisez Google Fonts pre-chargees

### Probleme : Les marges du PDF ne sont pas respectees

**Causes possibles :**
- Conflit entre les marges CSS et les marges PDF
- Contenu qui depasse

**Solution :**
- Ajustez les marges dans la section `pdf`
- Ajoutez `overflow: hidden` au body si necessaire

### Probleme : La signature ne s'affiche pas

**Causes possibles :**
- Le placeholder `{signature}` est mal orthographie
- La signature n'est pas requise mais pas fournie

**Solution :**
- Verifiez que `signature.required: true` est present
- Assurez-vous que le champ signature est bien signe

### Probleme : Erreur "Formulaire non trouve"

**Causes possibles :**
- L'ID du formulaire dans le YAML ne correspond pas a l'URL
- Le fichier YAML n'est pas dans le bon dossier

**Solution :**
- Verifiez que le fichier est dans `backend/forms/`
- Verifiez que l'ID dans le YAML est unique et correct

### Probleme : Erreur de syntaxe YAML

**Outils pour valider votre YAML :**
- [YAML Validator](https://yaml-validator.cloudapp.net/)
- [YAML Lint](http://www.yamllint.com/)

---

## Ressources Utiles

- [Specifications YAML 1.2](https://yaml.org/spec/1.2/spec.html)
- [CSS pour PDF](https://developer.mozilla.org/en-US/docs/Web/CSS/Printing)
- [Puppeteer PDF Generation](https://pptr.dev/#?product=Puppeteer&version=v21.6.0&show=api-page-pdf-options)

---

## Historique des Versions

| Version | Date | Modifications |
|---------|------|---------------|
| 1.0.0 | 18/07/2026 | Creation du document |
