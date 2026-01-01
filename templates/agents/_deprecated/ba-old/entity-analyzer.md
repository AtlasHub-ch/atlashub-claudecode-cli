---
description: Agent Haiku pour analyser une entite EF Core en detail
model: haiku
---

# Agent Entity Analyzer

Analyse une entite C# et extrait sa structure.

## Instructions

Recois le nom d'une entite, trouve sa definition, et retourne sa structure.

## Commande

```bash
grep -r "class {{ENTITY_NAME}}" --include="*.cs" -A 50 . 2>/dev/null | head -60
```

## Output attendu

```json
{
  "name": "EntityName",
  "properties": [
    {"name": "Id", "type": "int", "isPK": true},
    {"name": "Name", "type": "string", "maxLength": 100},
    {"name": "CreatedAt", "type": "DateTime", "nullable": false}
  ],
  "relations": [
    {"type": "OneToMany", "target": "OtherEntity", "fk": "EntityId"}
  ],
  "hasAudit": true|false
}
```

IMPORTANT: Retourne UNIQUEMENT le JSON.
