# Adaptive Elicitation Questionnaire - Business Analysis

> Questions adapted to feature complexity.
> Based on BABOK v3 - Pragmatic approach.

---

## Principle: Adaptive Questions

**DO NOT ask 44 questions for a simple CRUD!**

| Complexity | Questions | Estimated duration |
|------------|-----------|---------------|
| Simple CRUD | 6-8 | 5-10 min |
| Standard | 12-15 | 15-20 min |
| Complex | 20-25 | 30-45 min |
| Critical | 30+ | 1h+ |

---

## Complexity Assessment

**Ask this question FIRST:**

> What is the nature of this feature?
> - Simple CRUD (basic entity)
> - Standard (some business rules)
> - Complex (workflows, integrations)
> - Critical (security, finance, legal)

---

## ESSENTIAL Questions (6 questions - ALWAYS asked)

| # | Question | Objective |
|---|----------|----------|
| 1 | **What problem** does this feature solve? | Understand the need |
| 2 | **Who** uses it? (roles) | Identify users |
| 3 | **What data**? (CRUD entities) | Data model |
| 4 | **What permissions**? (who does what) | Security |
| 5 | **Scope**: IN and OUT? | Delimit |
| 6 | **Business rules** specific? | Business logic |

---

## STANDARD Questions (+4 if complexity >= Standard)

| # | Question | Condition |
|---|----------|-----------|
| 7 | What is the **main flow**? | Always if Standard+ |
| 8 | Specific **validations**? | Always if Standard+ |
| 9 | What **messages** (success/error)? | Always if Standard+ |
| 10 | **Audit trail** required? | Always if Standard+ |

---

## COMPLEX Questions (+5 if complexity >= Complex)

| # | Question | Condition |
|---|----------|-----------|
| 11 | What **integrations**? | If external systems |
| 12 | **Concurrency** (2 users)? | If shared data |
| 13 | Expected **volume**? | If massive data |
| 14 | **Alternative flows**? | If complex process |
| 15 | **Edge cases** to anticipate? | Always if Complex+ |

---

## CRITICAL Questions (+5 if complexity = Critical)

| # | Question | Condition |
|---|----------|-----------|
| 16 | **Sensitive data** (GDPR)? | If personal data |
| 17 | **Legal constraints**? | If regulated |
| 18 | **Performance** required? | If strict SLAs |
| 19 | **Irreversible operations**? | If critical actions |
| 20 | **Rollback** possible? | If critical transactions |

---

## OPTIONAL Questions (propose to go deeper)

After main questions, ask:

> Do you want to go deeper on certain aspects?
> - No, this is sufficient
> - Future evolution
> - Detailed edge cases
> - Performance/Scalability

### If "Future evolution":
- How does it evolve in 6 months?
- Deployment phases (MVP, v1, v2)?

### If "Edge cases":
- Mid-process cancellation?
- Invalid data?
- Timeouts?

### If "Performance":
- Target response time?
- Usage peaks?
- Cache needed?

---

## Examples by Type

### Simple CRUD (e.g., Category Management)

Questions asked:
1. Problem → "Organize products by category"
2. Users → "Admin only"
3. Data → "Category: name, description, parent"
4. Permissions → "Admin: full CRUD"
5. Scope → "IN: CRUD categories, OUT: product management"
6. Rules → "Unique name, no deletion if linked products"

**Total: 6 questions, 5 minutes**

### Standard (e.g., Order Management)

Questions 1-6 +:
7. Flow → "Cart → Validation → Payment → Confirmation"
8. Validations → "Stock available, valid address"
9. Messages → "Order confirmed #XXX"
10. Audit → "Yes, status change history"

**Total: 10 questions, 15 minutes**

### Complex (e.g., Approval Workflow)

Questions 1-10 +:
11. Integrations → "Accounting API, email notifications"
12. Concurrency → "Optimistic locking"
13. Volume → "1000 approvals/day"
14. Alt flows → "Rejection, Info request, Escalation"
15. Edge cases → "Approver absent, deadline exceeded"

**Total: 15 questions, 30 minutes**

---

## Anti-patterns

### To avoid:

- Asking 44 questions for a simple CRUD
- Technical questions too early (before understanding the need)
- Only closed questions (yes/no)
- Accepting "we'll see" as an answer

### Best practices:

- Adapt to context
- Rephrase if answer is vague
- Provide examples
- Document "I don't know" as risks

---

## Complete Reference (44 questions)

For CRITICAL features requiring exhaustive elicitation, see the complete file:

[questions-elicitation-complete.md](./_archive/questions-elicitation-complete.md)

---

*Pragmatic approach based on BABOK v3*
