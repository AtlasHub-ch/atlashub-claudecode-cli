# Questionnaire d'Élicitation Adaptatif - Business Analyse

> Questions adaptées à la complexité de la fonctionnalité.
> Basé sur BABOK v3 - Approche pragmatique.

---

## Principe : Questions Adaptatives

**NE PAS poser 44 questions pour un CRUD simple !**

| Complexité | Questions | Durée estimée |
|------------|-----------|---------------|
| CRUD simple | 6-8 | 5-10 min |
| Standard | 12-15 | 15-20 min |
| Complexe | 20-25 | 30-45 min |
| Critique | 30+ | 1h+ |

---

## Évaluation de la Complexité

**Poser cette question EN PREMIER :**

> Quelle est la nature de cette fonctionnalité ?
> - CRUD simple (entité basique)
> - Standard (quelques règles métier)
> - Complexe (workflows, intégrations)
> - Critique (sécurité, finance, légal)

---

## Questions ESSENTIELLES (6 questions - TOUJOURS posées)

| # | Question | Objectif |
|---|----------|----------|
| 1 | **Quel problème** résout cette fonctionnalité ? | Comprendre le besoin |
| 2 | **Qui** l'utilise ? (rôles) | Identifier les users |
| 3 | **Quelles données** ? (entités CRUD) | Modèle de données |
| 4 | **Quelles permissions** ? (qui fait quoi) | Sécurité |
| 5 | **Scope** : IN et OUT ? | Délimiter |
| 6 | **Règles métier** spécifiques ? | Logique métier |

---

## Questions STANDARD (+4 si complexité >= Standard)

| # | Question | Condition |
|---|----------|-----------|
| 7 | Quel est le **flux principal** ? | Toujours si Standard+ |
| 8 | **Validations** particulières ? | Toujours si Standard+ |
| 9 | Quels **messages** (succès/erreur) ? | Toujours si Standard+ |
| 10 | **Audit trail** requis ? | Toujours si Standard+ |

---

## Questions COMPLEXES (+5 si complexité >= Complexe)

| # | Question | Condition |
|---|----------|-----------|
| 11 | Quelles **intégrations** ? | Si systèmes externes |
| 12 | **Concurrence** (2 users) ? | Si données partagées |
| 13 | **Volumétrie** attendue ? | Si données massives |
| 14 | **Flux alternatifs** ? | Si processus complexe |
| 15 | **Edge cases** à anticiper ? | Toujours si Complexe+ |

---

## Questions CRITIQUES (+5 si complexité = Critique)

| # | Question | Condition |
|---|----------|-----------|
| 16 | **Données sensibles** (RGPD) ? | Si données personnelles |
| 17 | **Contraintes légales** ? | Si réglementé |
| 18 | **Performance** requise ? | Si SLA stricts |
| 19 | **Opérations irréversibles** ? | Si actions critiques |
| 20 | **Rollback** possible ? | Si transactions critiques |

---

## Questions OPTIONNELLES (proposer d'approfondir)

Après les questions principales, demander :

> Voulez-vous approfondir certains aspects ?
> - Non, c'est suffisant
> - Évolution future
> - Cas limites détaillés
> - Performance/Scalabilité

### Si "Évolution future" :
- Comment ça évolue dans 6 mois ?
- Phases de déploiement (MVP, v1, v2) ?

### Si "Cas limites" :
- Annulation à mi-parcours ?
- Données invalides ?
- Timeouts ?

### Si "Performance" :
- Temps de réponse cible ?
- Pics d'utilisation ?
- Cache nécessaire ?

---

## Exemples par Type

### CRUD Simple (ex: Gestion des catégories)

Questions posées :
1. Problème → "Organiser les produits par catégorie"
2. Users → "Admin uniquement"
3. Données → "Catégorie: nom, description, parent"
4. Permissions → "Admin: CRUD complet"
5. Scope → "IN: CRUD catégories, OUT: gestion produits"
6. Règles → "Nom unique, pas de suppression si produits liés"

**Total : 6 questions, 5 minutes**

### Standard (ex: Gestion des commandes)

Questions 1-6 + :
7. Flux → "Panier → Validation → Paiement → Confirmation"
8. Validations → "Stock disponible, adresse valide"
9. Messages → "Commande confirmée #XXX"
10. Audit → "Oui, historique des changements de statut"

**Total : 10 questions, 15 minutes**

### Complexe (ex: Workflow d'approbation)

Questions 1-10 + :
11. Intégrations → "API comptabilité, notifications email"
12. Concurrence → "Verrouillage optimiste"
13. Volumétrie → "1000 approbations/jour"
14. Flux alt → "Rejet, Demande d'info, Escalade"
15. Edge cases → "Approbateur absent, délai dépassé"

**Total : 15 questions, 30 minutes**

---

## Anti-patterns

### À éviter :

- Poser 44 questions pour un CRUD simple
- Questions techniques trop tôt (avant de comprendre le besoin)
- Questions fermées uniquement (oui/non)
- Accepter "on verra" comme réponse

### Bonnes pratiques :

- Adapter au contexte
- Reformuler si réponse floue
- Proposer des exemples
- Documenter les "je ne sais pas" comme risques

---

## Référence Complète (44 questions)

Pour les fonctionnalités CRITIQUES nécessitant une élicitation exhaustive, voir le fichier complet :

[questions-elicitation-complete.md](./_archive/questions-elicitation-complete.md)

---

*Approche pragmatique basée sur BABOK v3*
