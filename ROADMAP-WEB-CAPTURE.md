# Roadmap : Refactorisation Capture Web vers PDF

> **Version** : 2.0.0  
> **Statut** : Planifié  
> **Date** : 18 juillet 2026  
> **Auteur** : SHARKYBLUSTER (avec Mistral Vibe)

## Objectif
Transformer Form2Sign : passer de la génération PDF directe (pdfkit) à la capture de page web en PDF.

### Problème Actuel
- YAML définit la structure PDF via pdfkit
- Formulaire web et PDF générés séparément
- L'utilisateur veut une capture EXACTE de la page web remplie

### Nouveau Système
- YAML définit une page web (HTML) avec placeholders pour les champs
- Aperçu HTML obligatoire avant génération PDF
- PDF = capture exacte de la page web via Puppeteer

---

## Decisions Validées
| Decision | Valeur | Justification |
|----------|--------|---------------|
| Bibliothèque | Puppeteer | Rendu fidèle avec Chrome |
| Aperçu | Obligatoire | Validation visuelle |
| Rétrocompatibilité | NON | Migration complète |

---

# Roadmap en 6 Phases

## Phase 1 : Préparation (2-4h)
- Ajouter puppeteer à package.json
- Configurer Dockerfile avec dépendances Chrome
- Créer template-web.yaml (exemple)
- Nettoyer ancien code pdfkit

## Phase 2 : Backend Noyau (4-6h)
- ✅ Implémenter generateHtmlFromTemplate()
- ✅ Implémenter captureHtmlToPdf()
- ✅ Créer route GET /api/forms/:id/preview
- ✅ Modifier POST /api/generate-pdf

## Phase 3 : Frontend Aperçu (3-4h)
- Créer preview.html
- Modifier form.html (submit -> preview)
- Adapter JavaScript

## Phase 4 : Migration (2-3h)
- Convertir contrat-enrichi.yaml
- Créer template-simple.yaml
- Créer template-avance.yaml

## Phase 5 : Tests (2-3h)
- Tests backend (20 scenarios)
- Tests frontend (10 scenarios)
- Tests integration

## Phase 6 : Documentation (1-2h)
- Mettre à jour README.md
- Mettre à jour DEV_LOG.md
- Créer guide de migration

---

# Nouvelle Structure YAML

```yaml
form:
  id: mon_contrat
  title: "Contrat"
  
  template:
    style: |
      body { font-family: Arial; }
      .signature-area { border: 2px dashed #ccc; width: 300px; height: 100px; }
    
    layout: |
      <div class="header">
        <img src="/static/logos/logo.jpg" width="120"/>
        <h1>CONTRAT</h1>
        <p>Entre {company_name} et {client_name}</p>
      </div>
      <p><strong>Client:</strong> {client_name}</p>
      <p><strong>Email:</strong> {client_email}</p>
      <div class="signature-area" data-signature="true"></div>
    
    pdf:
      format: A4
      orientation: portrait
      margin: 10mm
  
  fields:
    - id: company_name
      label: "Nom entreprise"
      type: text
      required: true
    - id: client_name
      label: "Nom client"
      type: text
      required: true
    - id: client_email
      label: "Email client"
      type: email
      required: true
  
  signature:
    required: true
    label: "Signature"
```

---

# Nouveau Flux Utilisateur
```
Formulaire Web (form.html)
    ↓ [Soumettre]
Aperçu HTML (preview.html)  ← NOUVEAU
    ↓ [Modifier] → Retour formulaire
    ↓ [Générer PDF]
Génération PDF (Puppeteer)
    ↓
Téléchargement
```

---

# Dependances Docker

```dockerfile
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils
```

---

# Checklist Finale

## Avant Production
- [ ] Puppeteer fonctionne dans Docker
- [ ] Signature visible dans PDF
- [ ] CSS respecté dans PDF
- [ ] Format A4 correct avec marges
- [ ] Flux utilisateur fluide
- [ ] Documentation à jour
- [ ] Tous exemples fonctionnels

---

# Statut
- ✅ Plan validé
- ✅ Decisions prises
- ✅ Implémentation: Phase 1 (Préparation) - **TERMINEE**
- ✅ Implémentation: Phase 2 (Backend Noyau) - **TERMINEE**

**Prochaine etape** : Commencer Phase 3 (Frontend Aperçu)
