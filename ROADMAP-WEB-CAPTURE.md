# Roadmap : Refactorisation Capture Web vers PDF

> **Version** : 2.1.0  
> **Statut** : TERMINE  
> **Date** : 18 juillet 2026  
> **Auteur** : SHARKYBLUSTER (avec Mistral Vibe)

## Objectif
Transformer Form2Sign : passer de la generation PDF directe (pdfkit) a la capture de page web en PDF.

### Problème Actuel (avant v2.0.0)
- YAML definissait la structure PDF via pdfkit
- Formulaire web et PDF generes separement
- L'utilisateur voulait une capture EXACTE de la page web remplie

### Nouveau Système (v2.0.0+)
- YAML definit une page web (HTML) avec placeholders pour les champs
- Aperçu HTML obligatoire avant generation PDF
- PDF = capture exacte de la page web via Puppeteer
- Configuration PDF entierement dans le YAML (plus dans .env)

---

## Decisions Validées
| Decision | Valeur | Justification |
|----------|--------|---------------|
| Bibliothéque | Puppeteer | Rendu fidéle avec Chrome |
| Aperçu | Obligatoire | Validation visuelle avant generation |
| Rétrocompatibilité | NON | Migration complète vers le nouveau système |
| Configuration PDF | Dans YAML | Plus flexible, configuration par formulaire |

---

# Roadmap en 6 Phases

## Phase 1 : Préparation (TERMINEE)
- Ajouter puppeteer a package.json
- Configurer Dockerfile avec dependances Chrome (Alpine)
- Creer template-web.yaml (exemple)
- Nettoyer ancien code pdfkit
- **Statut** : TERMINE

## Phase 2 : Backend Noyau (TERMINEE)
- Implémenter generateHtmlFromTemplate()
- Implémenter captureHtmlToPdf()
- Creer route GET /api/forms/:id/preview
- Modifier POST /api/generate-pdf
- **Statut** : TERMINE

## Phase 3 : Frontend Aperçu (TERMINEE)
- Créer preview.html
- Modifier form.html (submit -> preview)
- Adapter JavaScript pour l'aperçu
- **Statut** : TERMINE

## Phase 4 : Migration (TERMINEE)
- Convertir contrat-enrichi.yaml vers contrat-enrichi-web.yaml
- Créer template-simple.yaml
- Créer template-avance.yaml
- Mettre a jour tous les formulaires existants
- **Statut** : TERMINE

## Phase 5 : Tests (SUPPRIMEE)
- Tests effectues directement par l'utilisateur en production
- Pas de procedure de test automatisee dans le code
- **Statut** : NON APPLICABLE (tests manuels par l'utilisateur)

## Phase 6 : Documentation (TERMINEE)
- Mettre a jour README.md
- Mettre a jour DEV_LOG.md
- Nettoyer les anciennes roadmaps (ROADMAP-PDF-ENRICHMENT.md)
- Nettoyer la documentation obsolète (README-PDF-CUSTOMIZATION.md)
- **Statut** : TERMINE

---

# Nouvelle Structure YAML (v2.0.0+)

```yaml
form:
  id: mon_contrat
  title: "Contrat Client"
  description: "Description du formulaire"
  
  template:
    # Styles CSS pour la page
    style: |
      body { font-family: Arial; max-width: 800px; margin: 0 auto; }
      .header { text-align: center; }
      .signature-area { border: 2px dashed #ccc; width: 300px; height: 100px; }
      
    # Layout HTML avec placeholders
    layout: |
      <div class="header">
        <img src="/static/logos/logo.jpg" width="120"/>
        <h1>CONTRAT</h1>
        <p>Entre {company_name} et {client_name}</p>
      </div>
      <p><strong>Date:</strong> {date}</p>
      <p><strong>Client:</strong> {client_name}</p>
      <p><strong>Email:</strong> {client_email}</p>
      <div class="signature-area">
        <img src="{signature}" alt="Signature" />
      </div>
    
    # Options PDF pour Puppeteer
    pdf:
      format: A4
      orientation: portrait
      margin: 15mm
  
  fields:
    - id: company_name
      label: "Nom de l'entreprise"
      type: text
      required: true
    - id: client_name
      label: "Nom du client"
      type: text
      required: true
    - id: client_email
      label: "Email du client"
      type: email
      required: true
      validation: "email"
  
  signature:
    required: true
    label: "Signature"
    instructions: "Signez avec votre doigt ou un stylet"
```

---

# Nouveau Flux Utilisateur

```
Formulaire Web (form.html)
    [Saisir les champs]
    [Capturer la signature]
    ↓ [Cliquer sur Aperçu]
Aperçu HTML (preview.html)  ← NOUVEAU
    ↓ [Vérifier le rendu]
    ↓ [Cliquer sur Approuver]
Generation PDF (Puppeteer)
    ↓
Redirection vers /pdfs.html
    ↓
Liste des PDFs (pdf-list.html)
```

---

# Fonctionnalites Disponibles

## Placeholders Dynamiques
- `{field_id}` - Valeur du champ avec l'ID specifie
- `{date}` - Date du jour (format: JJ/MM/AAAA)
- `{time}` - Heure actuelle (format: HH:MM:SS)
- `{form_id}` - ID du formulaire
- `{form_title}` - Titre du formulaire
- `{signature}` - Image de la signature (PNG base64)

## Options PDF (dans template.pdf)
- **format** : A4, A5, Letter, Legal (defaut: A4)
- **orientation** : portrait, landscape (defaut: portrait)
- **margin** : Marges en mm ou pixels (defaut: 15mm)
  - Peut etre une chaine: "15mm", "10mm 20mm"
  - Ou un objet: {top: "10mm", right: "15mm", bottom: "10mm", left: "15mm"}

## CSS Supporté
- Tous les styles CSS standard sont supportes
- Media queries pour l'impression
- Flexbox, Grid, etc.

## Images et Logos
- Utilisation via `<img src="/static/logos/[filename]">`
- Les logos doivent etre uploades via l'interface Configuration
- Stockes dans backend/uploads/logos/

---

# Checklist Finale

## Avant Production
- [x] Puppeteer fonctionne dans Docker
- [x] Signature visible dans PDF
- [x] CSS respecté dans PDF
- [x] Format A4 correct avec marges
- [x] Flux utilisateur fluide
- [x] Documentation a jour
- [x] Tous exemples fonctionnels

---

# Statut Global

## Implémentation
- [x] Plan validé
- [x] Decisions prises
- [x] Phase 1 (Préparation) - **TERMINEE**
- [x] Phase 2 (Backend Noyau) - **TERMINEE**
- [x] Phase 3 (Frontend Aperçu) - **TERMINEE**
- [x] Phase 4 (Migration) - **TERMINEE**
- [ ] Phase 5 (Tests) - **SUPPRIMEE** (tests manuels par l'utilisateur)
- [x] Phase 6 (Documentation) - **TERMINEE**

## Production Ready
- [x] Toutes les fonctionnalites implementees
- [x] Documentation nettoyee (anciennes roadmaps supprimees)
- [x] Configuration Docker finalisee
- [x] Formulaires migrés vers le nouveau format
- [x] Logo fonctionnel dans les PDFs
- [x] Boutons et flux utilisateur finalises

**Statut global** : PRODUCTION READY - Tout est termine et pret pour le deploiement.

---

## Historique des Modifications

### 18/07/2026 - Migration Complete
- Passage complet de pdfkit a Puppeteer
- Nouvelle structure YAML avec template (style + layout)
- Aperçu HTML obligatoire
- Bouton "Approuver" dans preview.html
- Redirection vers /pdfs.html apres generation

### 18/07/2026 - Nettoyage Documentation
- Suppression de ROADMAP-PDF-ENRICHMENT.md (obsolète, jamais cree)
- Suppression de README-PDF-CUSTOMIZATION.md (obsolète, systeme pdfkit)
- Suppression de toutes les references a pdfkit
- Suppression de la configuration PDF centralisee via .env
- Mise a jour de README.md et DEV_LOG.md

### 18/07/2026 - Finalisation
- Correction du logo dans les PDFs
- Bouton telecharger YAML sur les cartes formulaires
- Modifications de preview.html (suppression Telecharger HTML, renommage boutons)
- Suppression de la section Configuration PDF dans config.html

---

*Derniere mise a jour : 18/07/2026*
*Projet : Form2Sign*
