# Roadmap: Enrichissement PDF - Solution 1

**Projet:** Form2Sign - Personnalisation avancée des PDF via template YAML  
**Solution:** Section `pdf` complète dans le template YAML  
**Date:** 17 juillet 2026  
**Statut:** À démarrer  

---

## 🎯 Objectifs

Permettre aux utilisateurs de personnaliser l'apparence des PDF générés directement depuis le fichier YAML de chaque formulaire, avec les fonctionnalités suivantes :

- ✅ Ajout d'un logo en en-tête (haut à gauche, centré ou à droite)
- ✅ Texte d'introduction avec sauts de ligne
- ✅ Sections personnalisées (texte, séparateurs, images, espacements)
- ✅ Pied de page personnalisé avec pagination
- ✅ Contrôle des styles (polices, couleurs, tailles)
- ✅ Contrôle des marges et espacements
- ✅ Variables dynamiques (noms de champs, date, etc.)

---

## 📊 Priorités

### 🔴 Priorité Élevée (MVP - Version Minimale Viable)
1. **Logo en en-tête** - Fonctionnalité la plus demandée
2. **Texte d'introduction** avec sauts de ligne
3. **Variables de substitution** basiques ({date}, {champs})
4. **Espacement personnalisé** entre sections

### 🟡 Priorité Moyenne (Améliorations)
5. **Sections personnalisées** (texte, séparateurs, espacements)
6. **Pied de page personnalisé** avec pagination
7. **Styles de base** (taille de police)

### 🟢 Priorité Faible (Bonus)
8. **Images additionnelles** (watermark, etc.)
9. **Couleurs de texte**
10. **Marges personnalisées** par page
11. **Polices personnalisées**
12. **interface d'administration** pour configurer via le web

---

## 📅 Phases d'Implémentation

---

### Phase 1: Préparation et Design ✅
**Durée:** 1 jour  
**Statut:** Terminé (plan établi)  
**Responsable:** Développeur  

#### Tâches :
- [x] Analyser l'architecture actuelle
- [x] Identifier les capacités de pdfkit utilisées/non-utilisées
- [x] Définir la structure du template YAML
- [x] Créer le plan d'implémentation
- [x] Rédiger cette roadmap

#### Livrables :
- [x] Structure YAML définie
- [x] Plan technique détaillé
- [x] Exemples de templates

---

### Phase 2: Mise à jour du Template YAML 📝
**Durée:** 1-2 jours  
**Statut:** Non démarré  
**Responsable:** Développeur  

#### Tâches :
- [ ] Mettre à jour `backend/forms/template.yaml` avec la nouvelle structure
- [ ] Ajouter des exemples complets pour chaque option
- [ ] Documenter toutes les options disponibles dans le template
- [ ] Créer un fichier `README-PDF-CUSTOMIZATION.md` avec la documentation
- [ ] Valider le schema YAML (optionnel: ajouter un schema JSON pour validation)

#### Livrables :
- [ ] `template.yaml` mis à jour avec section `pdf`
- [ ] `README-PDF-CUSTOMIZATION.md` créé
- [ ] Exemples de formulaires YAML enrichis

#### Fichiers modifiés :
```
backend/forms/template.yaml
backend/forms/README-PDF-CUSTOMIZATION.md (nouveau)
```

---

### Phase 3: Backend - Lecture des Options PDF 📖
**Durée:** 1-2 jours  
**Statut:** Non démarré  
**Responsable:** Développeur  

#### Tâches :
- [ ] Modifier `GET /api/forms/:id` pour inclure `form.pdf` dans la réponse
- [ ] Ajouter une validation basique des options PDF
- [ ] Gérer les valeurs par défaut pour les options manquantes
- [ ] S'assurer de la rétrocompatibilité (formulaires sans section pdf)

#### Code à modifier :
**Fichier:** `backend/app.js`  
**Lignes:** 494-538 (route GET /api/forms/:id)

```javascript
// Ajouter form.pdf dans la réponse
res.json({ 
  success: true, 
  form: {
    id: form.id || formId,
    title: form.title || formId,
    description: form.description || '',
    fields: form.fields || [],
    signature: form.signature || { required: true, label: 'Signature' },
    style: form.style || {},
    pdf: form.pdf || {}  // NOUVEAU
  }
});
```

#### Tests :
- [ ] Vérifier que les formulaires existants fonctionnent toujours
- [ ] Vérifier que les nouvelles options sont bien retournées
- [ ] Tester avec un formulaire ayant une section pdf

---

### Phase 4: Backend - Fonctions de Rendering 🎨
**Durée:** 3-5 jours  
**Statut:** Non démarré  
**Responsable:** Développeur  

#### Sous-phase 4.1: Fonctions Utilitaires
**Tâches :**
- [ ] Créer `resolveVariables(text, formValues, context)` pour gérer les variables
- [ ] Créer `loadFormPdfOptions(formId)` pour charger les options PDF d'un formulaire
- [ ] Créer `validatePdfOptions(options)` pour valider les options

#### Sous-phase 4.2: Fonction renderHeader()
**Tâches :**
- [ ] Implémenter l'affichage du logo (top-left, top-center, top-right)
- [ ] Implémenter le titre et sous-titre
- [ ] Gérer les marges et positions
- [ ] Gérer les erreurs (logo non trouvé)

**Code exemple :**
```javascript
function renderHeader(doc, options, pdfConfig) {
  const header = options.header || {};
  
  // Logo
  if (header.logo) {
    const logoPath = path.join(__dirname, '../frontend/public', header.logo);
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const width = header.logo_width || 100;
      const height = header.logo_height || 50;
      const position = header.logo_position || 'top-left';
      const x = getXPosition(doc, width, position);
      doc.image(logoBuffer, x, doc.y, { width, height });
      doc.moveDown();
    }
  }
  
  // Titre
  const title = resolveVariables(header.title || pdfConfig.title || 'Form2Sign', formValues);
  doc.fontSize(header.title_font_size || 20)
     .font('Helvetica-Bold')
     .text(title, { align: 'center' });
  
  // Espacement
  const spacing = header.spacing?.after_header || 1;
  for (let i = 0; i < spacing; i++) doc.moveDown();
}
```

#### Sous-phase 4.3: Fonction renderIntroduction()
**Tâches :**
- [ ] Remplacer les variables dans le texte
- [ ] Gérer les sauts de ligne (`\n`)
- [ ] Appliquer les styles (taille de police)
- [ ] Gérer l'espacement après

#### Sous-phase 4.4: Fonction renderCustomSections()
**Tâches :**
- [ ] Implémenter le type `text` avec styles
- [ ] Implémenter le type `separator` avec couleur et largeur
- [ ] Implémenter le type `image` avec position
- [ ] Implémenter le type `spacing`
- [ ] Remplacer les variables dans le contenu

#### Sous-phase 4.5: Fonction renderFooter()
**Tâches :**
- [ ] Gérer le positionnement absolu en bas de page
- [ ] Implémenter left/center/right
- [ ] Gérer la pagination ({pageNumber}, {pageCount})
- [ ] Remplacer les variables

#### Fichiers modifiés :
```
backend/app.js (modifications majeures)
```

---

### Phase 5: Backend - Intégration dans la Génération PDF 🔄
**Durée:** 2-3 jours  
**Statut:** Non démarré  
**Responsable:** Développeur  

#### Tâches :
- [ ] Charger les options PDF du formulaire dans `POST /api/generate-pdf`
- [ ] Appeler `renderHeader()` au bon endroit
- [ ] Appeler `renderIntroduction()` après l'en-tête
- [ ] Modifier l'affichage des champs pour utiliser l'espacement personnalisé
- [ ] Appeler `renderCustomSections()` avant la signature
- [ ] Appeler `renderFooter()` pour chaque page
- [ ] Appliquer les marges personnalisées si définies

#### Code à modifier :
**Fichier:** `backend/app.js`  
**Lignes:** 644-851 (route POST /api/generate-pdf)

#### Exemple d'intégration :
```javascript
// Dans POST /api/generate-pdf
const formPdfOptions = await loadFormPdfOptions(formId);

// Appliquer les marges personnalisées
const margins = formPdfOptions.page?.margins || { top: 50, left: 50, right: 50, bottom: 50 };
const doc = new PDFDocument({
  size: formPdfOptions.page?.size || 'A4',
  layout: formPdfOptions.page?.orientation || 'portrait',
  margins: margins
});

// Rendre l'en-tête
renderHeader(doc, formPdfOptions, pdfConfig);

// Rendre l'introduction
renderIntroduction(doc, formPdfOptions, formValues);

// Afficher les champs avec espacement personnalisé
const spacing = formPdfOptions.spacing?.between_fields || 0.5;
// ...

// Rendre les sections personnalisées
renderCustomSections(doc, formPdfOptions, formValues);

// Rendre le footer sur chaque page
doc.on('pageAdded', () => {
  const pages = doc.bufferedPageRange();
  renderFooter(doc, formPdfOptions, pages.count, pages.total);
});
```

---

### Phase 6: Frontend - Interface Utilisateur 💻
**Durée:** 2-3 jours  
**Statut:** Non démarré  
**Responsable:** Développeur  

#### Tâches :
- [ ] Mettre à jour `config.html` pour permettre la configuration PDF
- [ ] Ajouter un onglet "Options PDF" dans la configuration
- [ ] Créer un formulaire pour configurer : logo, introduction, footer, etc.
- [ ] Permettre le preview des options
- [ ] Valider les entrées utilisateur

#### Fichiers modifiés :
```
frontend/views/config.html
frontend/views/config.js (si existe, ou ajouter dans config.html)
```

---

### Phase 7: Tests ✅
**Durée:** 2-3 jours  
**Statut:** Non démarré  
**Responsable:** Développeur / Testeur  

#### Tâches par catégorie :

**Tests Unitaires (Backend):**
- [ ] Tester `resolveVariables()` avec différentes variables
- [ ] Tester `renderHeader()` avec/sans logo
- [ ] Tester `renderIntroduction()` avec texte simple et multi-ligne
- [ ] Tester `renderCustomSections()` pour chaque type de section
- [ ] Tester `renderFooter()` avec pagination
- [ ] Tester la validation des options PDF

**Tests d'Intégration:**
- [ ] Générer un PDF avec logo
- [ ] Générer un PDF avec introduction
- [ ] Générer un PDF avec sections personnalisées
- [ ] Générer un PDF avec footer personnalisé
- [ ] Générer un PDF avec toutes les options combinées

**Tests Frontend:**
- [ ] Configurer un formulaire via l'interface
- [ ] Prévisualiser les options PDF
- [ ] Générer un PDF via l'interface

**Tests de Rétrocompatibilité:**
- [ ] Formulaire sans section pdf → utilise les valeurs par défaut
- [ ] Formulaire avec section pdf incomplète → pas d'erreur
- [ ] Options invalides → gestion des erreurs

**Tests de Sécurité:**
- [ ] Path traversal dans le chemin du logo → bloqué
- [ ] Images trop grandes → erreur gérée
- [ ] Variables manquantes → texte vide au lieu d'erreur

#### Outils de test :
- Tests manuels avec différents navigateurs
- Tests automatiques (Jest/Mocha) si configuré
- Vérification visuelle des PDF générés

---

### Phase 8: Documentation 📚
**Durée:** 1-2 jours  
**Statut:** Non démarré  
**Responsable:** Développeur  

#### Tâches :
- [ ] Mettre à jour le README principal avec un lien vers la documentation PDF
- [ ] Créer `docs/pdf-customization.md` avec :
  - Guide de démarrage rapide
  - Référence complète des options
  - Exemples complets
  - Bonnes pratiques
  - Limites connues
- [ ] Documenter les variables disponibles
- [ ] Documenter les chemins des images
- [ ] Ajouter des screenshots d'exemples

#### Livrables :
```
docs/pdf-customization.md (nouveau)
README.md (mis à jour)
```

---

### Phase 9: Déploiement et Validation 🚀
**Durée:** 1 jour  
**Statut:** Non démarré  
**Responsable:** DevOps / Développeur  

#### Tâches :
- [ ] Faire un backup de l'application actuelle
- [ ] Déployer sur l'environnement de test
- [ ] Exécuter tous les tests
- [ ] Valider manuellement avec plusieurs formulaires
- [ ] Corriger les bugs éventuels
- [ ] Déployer sur l'environnement de production
- [ ] Former les utilisateurs si nécessaire

---

## 📅 Timeline Estimée

| Phase | Durée | Début | Fin | Statut |
|-------|-------|-------|-----|--------|
| Phase 1: Préparation | 1 jour | 17/07 | 17/07 | ✅ Terminé |
| Phase 2: Template YAML | 1-2 jours | 18/07 | 19/07 | ⏳ Non démarré |
| Phase 3: Lecture Options | 1-2 jours | 20/07 | 21/07 | ⏳ Non démarré |
| Phase 4: Fonctions Rendering | 3-5 jours | 22/07 | 26/07 | ⏳ Non démarré |
| Phase 5: Intégration PDF | 2-3 jours | 27/07 | 29/07 | ⏳ Non démarré |
| Phase 6: Frontend UI | 2-3 jours | 30/07 | 01/08 | ⏳ Non démarré |
| Phase 7: Tests | 2-3 jours | 02/08 | 04/08 | ⏳ Non démarré |
| Phase 8: Documentation | 1-2 jours | 05/08 | 06/08 | ⏳ Non démarré |
| Phase 9: Déploiement | 1 jour | 07/08 | 07/08 | ⏳ Non démarré |

**Date de livraison estimée:** 7 août 2026  
**Durée totale:** ~14-19 jours ouvrés

---

## 🎯 Milestones (Jalons)

### Milestone 1: MVP (Version Minimale Viable) - **26 juillet**
**Objectif:** Fonctionnalités de base opérationnelles
- Logo en en-tête
- Texte d'introduction
- Variables de substitution
- Espacement personnalisé

**Livrables:**
- Template YAML mis à jour
- Backend fonctionnel pour les options de base
- Tests manuels réussis

### Milestone 2: Version Complète - **4 août**
**Objectif:** Toutes les fonctionnalités implémentées
- Toutes les options de la Solution 1
- Frontend d'administration
- Documentation complète

**Livrables:**
- Code complet et testé
- Documentation utilisateur
- Exemples de formulaires

### Milestone 3: Production Ready - **7 août**
**Objectif:** Prêt pour la production
- Tous les tests passés
- Déploiement sur production
- Formation utilisateur

---

## 📦 Livrables par Phase

| Phase | Livrables |
|-------|-----------|
| Phase 1 | Plan technique, Structure YAML |
| Phase 2 | template.yaml, README-PDF-CUSTOMIZATION.md |
| Phase 3 | Route API modifiée, Validation des options |
| Phase 4 | Fonctions de rendering (header, intro, sections, footer) |
| Phase 5 | Génération PDF intégrée, Tests unitaires |
| Phase 6 | Interface utilisateur mise à jour |
| Phase 7 | Suite de tests, Rapport de tests |
| Phase 8 | Documentation complète |
| Phase 9 | Application déployée, Guide de déploiement |

---

## 💰 Ressources Nécessaires

### Ressources Humaines
- 1 Développeur Full-stack (principal)
- 1 Testeur (optionnel, peut être le développeur)
- 1 DevOps (pour le déploiement)

### Temps Total Estimé
- **Développement:** ~14-16 jours
- **Tests:** ~2-3 jours
- **Documentation:** ~1-2 jours
- **Déploiement:** ~1 jour
- **Total:** ~14-19 jours ouvrés

### Coût (si facturé)
- À estimer selon le tarif horaire/journalier

---

## ⚠️ Risques et Atténuation

| Risque | Impact | Probabilité | Atténuation |
|--------|--------|-------------|-------------|
| Complexité accrue de pdfkit | Moyen | Faible | Bien documenter l'API pdfkit, tester chaque fonction |
| Problèmes de chemin des images | Élevé | Moyen | Valider les chemins, utiliser path.join(), gérer les erreurs |
| Performance avec images | Faible | Faible | Limiter la taille des images, utiliser du caching |
| Incompatibilité rétroactive | Élevé | Faible | Implémenter des valeurs par défaut, tester avec anciens formulaires |
| Délais dépassés | Moyen | Moyen | Prioriser le MVP, reporter les fonctionnalités bonus |
| Bugs de rendering PDF | Moyen | Moyen | Tests visuels approfondis, comparer avec outils existants |
| Problèmes de déploiement | Moyen | Faible | Backup avant déploiement, rollback plan |

---

## 📊 Indicateurs de Succès

### Critères de Réussite
- [ ] Tous les formulaires existants continuent de fonctionner
- [ ] Les nouvelles options PDF sont fonctionnelles
- [ ] La documentation permet à un utilisateur de configurer son PDF
- [ ] Les PDF générés sont visuellement corrects
- [ ] Aucune régression majeure identifiée

### Métriques
- **Taux de couverture des tests:** > 80%
- **Temps de génération PDF:** < 2 secondes (avec logo)
- **Satisfaction utilisateur:** À évaluer après déploiement

---

## 🔄 Maintenance et Évolution

### Post-déploiement
- Monitorer les logs pour détecter les erreurs
- Collecter les feedbacks utilisateurs
- Corriger les bugs rapportés

### Améliorations Futures (hors scope)
- Support des polices personnalisées (TTF)
- Support des tableaux
- Support du HTML dans les sections
- Génération de PDF en arrière-plan (queue)
- Preview PDF avant génération
- Export des templates PDF en tant que modèles réutilisables

---

## 📞 Contacts et Communication

| Rôle | Personne | Email | Responsabilités |
|------|---------|-------|------------------|
| Développeur | - | - | Implémentation, tests |
| DevOps | - | - | Déploiement |
| Product Owner | - | - | Validation, priorisation |

**Canal de communication:** 
- Issues GitHub pour les bugs
- Discussions GitHub pour les questions
- Réunions hebdomadaires de suivi

---

## 📌 Annexes

### Annexe A: Structure Complète du Template YAML
Voir `backend/forms/template.yaml` pour la structure complète.

### Annexe B: Exemple de Formulaire Enrichi
Voir `backend/forms/examples/contrat-enrichi.yaml` (à créer).

### Annexe C: Variables Disponibles
- `{full_name}` - Nom complet (si champ existe)
- `{date}` - Date du jour (format fr-FR)
- `{time}` - Heure actuelle (format fr-FR)
- `{form_id}` - ID du formulaire
- `{form_title}` - Titre du formulaire
- `{pageNumber}` - Numéro de page actuel
- `{pageCount}` - Nombre total de pages
- `{<field_id>}` - Valeur de n'importe quel champ (ex: `{company_name}`)

### Annexe D: Chemins des Images
- Relatifs à `/frontend/public/`
- Exemple: `/static/images/logo.png` → `/frontend/public/static/images/logo.png`
- Peut aussi être en base64 (à implémenter si besoin)

---

## ✅ Checklist de Lancement

Avant de commencer l'implémentation :
- [ ] Roadmap validée par toutes les parties prenantes
- [ ] Ressources disponibles (développeur, temps)
- [ ] Environnement de développement prêt
- [ ] Backup de l'application actuelle
- [ ] Accès aux logs et monitoring
- [ ] Plan de rollback en cas de problème

---

**Document créé le:** 17 juillet 2026  
**Dernière mise à jour:** 17 juillet 2026  
**Version:** 1.0  
**Auteur:** Mistral Vibe (avec supervision humaine)
