---
description: Phase 2 - Analyse fonctionnelle avec challenge agressif
---

# BA Analyse

Expert BA senior. Challenge agressif du besoin, qualite maximale.

## Pre-requis

```bash
cat .claude/ba/config.json 2>/dev/null || echo "Executer /ba:1-init d'abord"
```

## Etape 1 : Besoin initial

> **Decrivez la fonctionnalite souhaitee** (contexte, utilisateurs, objectif)

## Etape 2 : Challenge AGRESSIF

Charge les questions et pose-les TOUTES :

```bash
cat templates/commands/ba/_resources/questions-challenge.md
```

**IMPORTANT** :
- Ne pas accepter de reponses vagues
- Reformuler si ambiguite
- Proposer des alternatives
- Identifier les risques

### Synthese critique

Apres les reponses, presenter :

```
ANALYSE CRITIQUE
────────────────────────────────
POINTS DE VIGILANCE :
• <point_1>
• <point_2>

ALTERNATIVES SUGGEREES :
1. <alt_1> : avantage / inconvenient
2. <alt_2> : avantage / inconvenient

RISQUES :
• <risque> → Mitigation: <solution>

QUESTION DECISIVE :
> <question_bloquante>
────────────────────────────────
```

## Etape 3 : Modelisation

### Analyse entites existantes (HAIKU)

Si besoin de comprendre entites existantes :

```
Task(subagent_type="explore-codebase", model="haiku", prompt="
Analyse les entites EF Core existantes liees a: {domaine}
Cherche dans Domain/Entities/
Retourne: proprietes, relations, patterns utilises
")
```

### Schema donnees

Genere schema Mermaid erDiagram base sur les specs.

### Endpoints API

| Method | Route | Roles | Description |
|--------|-------|-------|-------------|

### Permissions

Matrice roles/actions basee sur config.json.

## Etape 4 : Interface Blazor

### Wireframes ASCII

Pour chaque ecran : schema + URL + roles + fonctionnalites.

### Flux navigation (Mermaid flowchart)

## Etape 5 : Generation document

Generer le document d'analyse directement (pas d'agent necessaire).

Sauvegarde : `.claude/ba/analyses/YYYY-MM-DD-<feature>.md`

## Resume

```
ANALYSE COMPLETE
────────────────────────────────
Feature:    <NOM>
Complexite: <FAIBLE|MOYENNE|HAUTE>

Donnees:    <X> entites
API:        <X> endpoints
UI:         <X> pages
Permissions: <X> roles impactes

Document: .claude/ba/analyses/<FILE>
────────────────────────────────
Prochain: /ba:3-validate
```
