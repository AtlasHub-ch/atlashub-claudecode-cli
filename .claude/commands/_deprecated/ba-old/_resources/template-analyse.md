# Analyse Fonctionnelle : {{FEATURE_NAME}}

**Date** : {{DATE}}
**Version** : 1.0
**Status** : Draft

## Resume executif
{{RESUME}}

## Contexte et objectifs

### Probleme adresse
{{PROBLEME}}

### Utilisateurs cibles
{{USERS}}

### Valeur business
{{VALEUR}}

### Scope
- **Inclus** : {{IN_SCOPE}}
- **Exclus** : {{OUT_SCOPE}}

---

## Modele de donnees

### Entites impactees

| Action | Entite | Description |
|--------|--------|-------------|
{{ENTITIES_TABLE}}

### Schema relationnel

```mermaid
erDiagram
{{MERMAID_ER}}
```

### Migration EF Core prevue
{{MIGRATION_NAME}}

---

## API

### Endpoints

| Method | Route | Roles | Description |
|--------|-------|-------|-------------|
{{ENDPOINTS_TABLE}}

### DTOs (specification)

| DTO | Proprietes | Usage |
|-----|------------|-------|
{{DTOS_TABLE}}

---

## Interface utilisateur

### Navigation
{{NAV_SCHEMA}}

### Ecrans

#### {{PAGE_NAME}}
**URL** : {{URL}}
**Roles** : {{ROLES}}

```
{{ASCII_WIREFRAME}}
```

**Fonctionnalites** :
{{FEATURES_LIST}}

---

## Permissions

| Action | API | UI | Roles |
|--------|-----|-----|-------|
{{PERMISSIONS_TABLE}}

---

## Considerations techniques

### Performance
{{PERF}}

### Securite
{{SECURITY}}

---

## Risques et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
{{RISKS_TABLE}}

---

## Questions ouvertes
{{OPEN_QUESTIONS}}
