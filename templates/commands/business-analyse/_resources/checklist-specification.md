# Completeness Checklist - Specifications (FRD)

> Validation threshold: **85% minimum (26/30)**
> Based on IEEE 830 and FRD best practices

---

## Scoring

| Score | Status | Action |
|-------|--------|--------|
| 90-100% | ✅ Excellent | Ready for development |
| 85-89% | ✅ Acceptable | Ready with minor notes |
| 70-84% | ⚠️ Insufficient | Complete before handoff |
| < 70% | ❌ Incomplete | Return to analysis |

---

## Category 1: Context (4 points)

| # | Criterion | Weight | ✓/✗ |
|---|---------|-------|-----|
| 1.1 | Business objective clearly documented | 1 | |
| 1.2 | Scope (IN/OUT) explicitly defined | 1 | |
| 1.3 | Stakeholders and roles identified | 1 | |
| 1.4 | Priority established (MoSCoW) | 1 | |

**Subtotal**: _/4

---

## Category 2: Use Cases (6 points)

| # | Criterion | Weight | ✓/✗ |
|---|---------|-------|-----|
| 2.1 | Complete happy path (all steps) | 1 | |
| 2.2 | Extensions/alternative flows documented | 1 | |
| 2.3 | Preconditions defined | 1 | |
| 2.4 | Postconditions (success/failure) defined | 1 | |
| 2.5 | Actors clearly identified | 1 | |
| 2.6 | Business rules linked to UCs | 1 | |

**Subtotal**: _/6

---

## Category 3: User Interface (6 points)

| # | Criterion | Weight | ✓/✗ |
|---|---------|-------|-----|
| 3.1 | Wireframes/mockups present | 1 | |
| 3.2 | URLs/routes defined | 1 | |
| 3.3 | Authorized roles per screen | 1 | |
| 3.4 | Interactive elements documented | 1 | |
| 3.5 | Messages (success/error) specified | 1 | |
| 3.6 | Front-end validations defined | 1 | |

**Subtotal**: _/6

---

## Category 4: Data (5 points)

| # | Criterion | Weight | ✓/✗ |
|---|---------|-------|-----|
| 4.1 | All fields specified | 1 | |
| 4.2 | Data types defined | 1 | |
| 4.3 | Validation rules per field | 1 | |
| 4.4 | Default values specified | 1 | |
| 4.5 | Required/optional indicated | 1 | |

**Subtotal**: _/5

---

## Category 5: API (5 points)

| # | Criterion | Weight | ✓/✗ |
|---|---------|-------|-----|
| 5.1 | All endpoints documented | 1 | |
| 5.2 | Request/Response formats defined | 1 | |
| 5.3 | HTTP error codes specified | 1 | |
| 5.4 | Authentication/Authorization defined | 1 | |
| 5.5 | Back-end validations documented | 1 | |

**Subtotal**: _/5

---

## Category 6: Tests (4 points)

| # | Criterion | Weight | ✓/✗ |
|---|---------|-------|-----|
| 6.1 | Acceptance criteria defined | 1 | |
| 6.2 | Gherkin scenarios written | 1 | |
| 6.3 | Nominal cases covered | 1 | |
| 6.4 | Error cases covered | 1 | |

**Subtotal**: _/4

---

## Summary

| Category | Score | Max |
|-----------|-------|-----|
| Context | | 4 |
| Use Cases | | 6 |
| Interface | | 6 |
| Data | | 5 |
| API | | 5 |
| Tests | | 4 |
| **TOTAL** | | **30** |

**Percentage**: _%

**Status**: ✅ Validated / ⚠️ Insufficient / ❌ Incomplete

---

## Items to Complete

If score < 85%, list missing items:

| # | Missing criterion | Priority | Action |
|---|-----------------|----------|--------|
| | | | |

---

## Notes

_BA observations:_

---

*Checklist based on IEEE 830 and BABOK v3*
