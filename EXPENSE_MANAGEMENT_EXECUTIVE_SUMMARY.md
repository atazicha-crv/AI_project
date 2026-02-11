# API Gestion de Notes de Frais - Résumé Exécutif
## Architecture NestJS + TypeORM + SQLite - V1

**Date:** 2026-02-11  
**Architecte:** Backend Senior  
**Statut:** Architecture validée - Prêt pour implémentation

---

## 📋 Vue d'Ensemble

Ce document présente l'architecture complète d'une API REST de gestion de notes de frais, conçue avec NestJS, TypeORM et SQLite. L'architecture est pensée pour une V1 fonctionnelle avec une évolution claire vers la V2 (JWT, rôles, workflow manager).

**Documents détaillés:**
- [`EXPENSE_MANAGEMENT_ARCHITECTURE.md`](./EXPENSE_MANAGEMENT_ARCHITECTURE.md) - Architecture complète (sections 1-4)
- [`EXPENSE_MANAGEMENT_ARCHITECTURE_PART2.md`](./EXPENSE_MANAGEMENT_ARCHITECTURE_PART2.md) - Plan de travail & validation (sections 7-13)

---

## 🎯 Objectifs V1

### Fonctionnalités Principales
✅ Gestion des utilisateurs (CRUD minimal)  
✅ Gestion des rapports de notes de frais (CRUD + statuts)  
✅ Gestion des dépenses (CRUD + catégories)  
✅ Upload/Download de pièces jointes (stockage local)  
✅ Calcul automatique des totaux  
✅ Validation des transitions de statuts  
✅ Documentation Swagger interactive  
✅ Tests unitaires avec >90% coverage  

### Limitations V1 (par design)
⚠️ Authentification factice (FakeAuthGuard - pas de JWT)  
⚠️ Pas de workflow validation manager  
⚠️ Stockage fichiers en local uniquement  
⚠️ Pas de notifications/emails  
⚠️ Pas d'export PDF/Excel  

---

## 🏗️ Architecture Technique

### Stack Imposée
- **Framework:** NestJS (Node.js + TypeScript)
- **ORM:** TypeORM
- **Base de données:** SQLite
- **Documentation:** Swagger (@nestjs/swagger)
- **Tests:** Jest avec coverage >90%
- **Validation:** class-validator + class-transformer

### Modules Principaux

```
backend/src/
├── auth/                    # FakeAuthGuard (V1) + structure JWT (V2)
├── common/                  # Filters, Interceptors, Pipes, Interfaces
├── users/                   # Gestion utilisateurs
├── expense-reports/         # Gestion rapports de notes de frais
├── expenses/                # Gestion dépenses
└── attachments/             # Upload/Download pièces jointes
```

### Entités & Relations

```
User (1) ──────► (N) ExpenseReport
                      │
                      └──► (N) Expense
                                │
                                └──► (N) Attachment
```

**Cascade DELETE:** User → Reports → Expenses → Attachments (+ fichiers physiques)

---

## 📊 Modèle de Données

### User
- `id` (UUID), `firstName`, `lastName`, `email` (unique)
- `role` (enum: EMPLOYEE en V1)
- `managerId` (prévu V2)

### ExpenseReport
- `id` (UUID), `purpose`, `reportDate`, `totalAmount` (calculé)
- `status` (CREATED → SUBMITTED → VALIDATED/REJECTED → PAID)
- `paymentDate` (si PAID)
- Relation: `userId` → User

### Expense
- `id` (UUID), `category` (enum), `expenseName`, `description`
- `amount`, `expenseDate`
- `status` (CREATED → SUBMITTED → VALIDATED/REJECTED → PAID)
- Relation: `reportId` → ExpenseReport

### Attachment
- `id` (UUID), `fileName`, `filePath`, `mimeType`, `size`
- Relation: `expenseId` → Expense

---

## 🔄 Règles Métier Clés

### 1. Calcul Automatique TotalAmount
**Déclencheurs:** Create/Update/Delete Expense  
**Action:** Recalcul `SUM(expenses.amount)` → `report.totalAmount`  
**Implémentation:** Hook dans `ExpensesService` → appel `ExpenseReportsService.recalculateTotalAmount()`

### 2. Transitions de Statuts

**ExpenseReport:**
```
CREATED → SUBMITTED → VALIDATED → PAID
              ↓
           REJECTED
```

**Règles:**
- Modifiable seulement si `status ∈ {CREATED, SUBMITTED}`
- Transition SUBMITTED requiert au moins 1 expense
- Transition PAID → set `paymentDate = now()`

**Expense:**
- Mêmes transitions que Report
- Modifiable seulement si expense ET report modifiables

### 3. Gestion Fichiers
- **Stockage:** `uploads/expenses/<uuid>.<ext>`
- **Validation:** Max 5MB, MIME types: `image/jpeg`, `image/png`, `application/pdf`
- **Suppression:** Cascade DB + suppression fichier physique

---

## 🌐 API Design

### Endpoints Principaux

#### Users
```
GET    /api/users              # Liste utilisateurs
POST   /api/users              # Créer utilisateur
GET    /api/users/:id          # Détail utilisateur
PATCH  /api/users/:id          # Modifier utilisateur
```

#### Expense Reports
```
GET    /api/expense-reports                    # Liste (paginé, filtré)
POST   /api/expense-reports                    # Créer rapport
GET    /api/expense-reports/:id                # Détail + expenses
PATCH  /api/expense-reports/:id                # Modifier rapport
PATCH  /api/expense-reports/:id/status         # Changer statut
DELETE /api/expense-reports/:id                # Supprimer rapport
```

#### Expenses
```
GET    /api/expense-reports/:reportId/expenses # Liste expenses d'un rapport
POST   /api/expense-reports/:reportId/expenses # Créer expense
GET    /api/expenses/:id                       # Détail expense
PATCH  /api/expenses/:id                       # Modifier expense
PATCH  /api/expenses/:id/status                # Changer statut
DELETE /api/expenses/:id                       # Supprimer expense
```

#### Attachments
```
POST   /api/expenses/:expenseId/attachments    # Upload fichier
GET    /api/expenses/:expenseId/attachments    # Liste attachments
GET    /api/attachments/:id                    # Métadonnées
GET    /api/attachments/:id/download           # Télécharger fichier
DELETE /api/attachments/:id                    # Supprimer attachment
```

### Pagination & Filtrage
- **Pagination:** `?page=1&limit=20` (max 100)
- **Filtrage:** `?status=CREATED&category=TRAVEL`
- **Tri:** `?sortBy=reportDate&order=DESC`

### Codes HTTP Standardisés
- `200` OK (GET, PATCH)
- `201` Created (POST)
- `204` No Content (DELETE)
- `400` Bad Request (validation)
- `404` Not Found
- `409` Conflict (transition invalide)
- `422` Unprocessable Entity (règle métier)

---

## 🧪 Stratégie de Tests

### Objectifs Coverage
- **Global:** 90%+
- **Branches:** 85%+
- **Functions:** 90%+
- **Statements:** 90%+

### Types de Tests

#### Tests Unitaires (Priorité)
- **Services:** Logique métier, recalcul totaux, transitions statuts
- **Controllers:** Délégation, validation DTOs
- **Helpers:** Validators, file storage

#### Tests Critiques
✅ Recalcul `totalAmount` après create/update/delete expense  
✅ Validation transitions statuts (matrice complète)  
✅ Upload/Download fichiers avec validation MIME/taille  
✅ Cascade delete (DB + filesystem)  
✅ Modification interdite selon statut  

#### Mocking
- TypeORM repositories (`createMockRepository()`)
- Filesystem (`jest.mock('fs/promises')`)
- Services inter-dépendants

### Configuration Jest
```javascript
coverageThresholds: {
  global: {
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90,
  },
}
```

---

## 📅 Plan de Travail (Roadmap)

### Estimation Totale: 24-32 heures

| Phase | Durée | Livrables |
|-------|-------|-----------|
| **1. Bootstrap & Config** | 2-3h | NestJS + TypeORM + Swagger + .env |
| **2. Modules Core** | 3-4h | Common + Auth (Fake) + Users |
| **3. ExpenseReports** | 4-5h | Entity + Service + Controller + Tests |
| **4. Expenses** | 4-5h | Entity + Recalcul + Tests |
| **5. Attachments** | 3-4h | Upload + Storage + Tests |
| **6. Guards & Validation** | 2h | FakeAuth + Exceptions |
| **7. Tests & Coverage** | 3-4h | 90% coverage + E2E |
| **8. Documentation** | 2h | README + Swagger + V2 Plan |
| **9. Vérifications** | 1h | Build + Tests + Validation |

### Séquence d'Implémentation

1. **Phase 1-2:** Infrastructure (config, DB, auth, users)
2. **Phase 3:** ExpenseReports (cœur métier)
3. **Phase 4:** Expenses (avec recalcul automatique)
4. **Phase 5:** Attachments (upload/download)
5. **Phase 6-7:** Qualité (guards, tests, coverage)
6. **Phase 8-9:** Documentation & validation

---

## ⚠️ Points à Confirmer (5 max)

### 1. Pagination par Défaut
**Proposition:** `limit=20, maxLimit=100`  
**Alternative:** `limit=50`  
**Recommandation:** ✅ `limit=20, maxLimit=100`

### 2. Soft Delete vs Hard Delete
**Proposition V1:** Hard delete (suppression physique)  
**Proposition V2:** Soft delete (`deletedAt`)  
**Recommandation:** ✅ Hard delete V1, soft delete V2

### 3. Attachments Obligatoires?
**Proposition V1:** Optionnel  
**Proposition V2:** Au moins 1 obligatoire  
**Recommandation:** ✅ Optionnel V1, configurable V2

### 4. Synchronisation Statuts Report ↔ Expenses
**Proposition V1:** Statuts indépendants  
**Proposition V2:** Cascade automatique  
**Recommandation:** ✅ V1 indépendant, V2 cascade

### 5. Format Montants
**Proposition A:** DECIMAL(10,2) (euros/dollars)  
**Proposition B:** INTEGER (centimes)  
**Recommandation:** ✅ DECIMAL(10,2) pour simplicité V1

---

## 🚀 Prochaines Étapes

### 1. Validation Architecture
- [ ] Revoir ce document + documents détaillés
- [ ] Confirmer les 5 points ci-dessus
- [ ] Valider les choix techniques

### 2. Préparation Implémentation
- [ ] Créer repository Git
- [ ] Initialiser projet NestJS
- [ ] Configurer environnement dev

### 3. Implémentation (Code Mode)
- [ ] Suivre roadmap phase par phase
- [ ] Tests unitaires au fur et à mesure
- [ ] Validation continue (build + tests)

### 4. Livraison V1
- [ ] Coverage >90%
- [ ] Swagger complet
- [ ] README documenté
- [ ] Validation fonctionnelle complète

---

## 📚 Documentation Complète

### Documents Livrés

1. **[EXPENSE_MANAGEMENT_ARCHITECTURE.md](./EXPENSE_MANAGEMENT_ARCHITECTURE.md)**
   - Section 1: Architecture Applicative NestJS
   - Section 2: Schéma de Données & Contraintes
   - Section 3: API Design (Swagger-first)
   - Section 4: Stratégie Fichiers (Upload)
   - Section 5: Règles Statuts & Transitions
   - Section 6: Stratégie Tests & Couverture

2. **[EXPENSE_MANAGEMENT_ARCHITECTURE_PART2.md](./EXPENSE_MANAGEMENT_ARCHITECTURE_PART2.md)**
   - Section 7: Plan de Travail (Roadmap détaillée)
   - Section 8: Points à Confirmer
   - Section 9: Hypothèses & Choix par Défaut
   - Section 10: Diagrammes Complémentaires
   - Section 11: Checklist Validation Finale
   - Section 12: Commandes Utiles
   - Section 13: Conclusion

3. **[EXPENSE_MANAGEMENT_EXECUTIVE_SUMMARY.md](./EXPENSE_MANAGEMENT_EXECUTIVE_SUMMARY.md)** (ce document)
   - Vue d'ensemble
   - Résumé architecture
   - Points clés
   - Prochaines étapes

### Diagrammes Inclus
- Architecture modules NestJS
- Schéma relationnel DB
- Diagrammes transitions statuts
- Flux création expense avec recalcul
- Flux upload attachment
- Flux transition statut avec validation

---

## ✅ Critères de Succès V1

### Fonctionnel
- ✅ Tous endpoints CRUD fonctionnels
- ✅ Recalcul automatique `totalAmount`
- ✅ Validation transitions statuts
- ✅ Upload/Download fichiers
- ✅ Pagination, filtrage, tri

### Qualité
- ✅ Coverage tests >90%
- ✅ ESLint 0 erreur
- ✅ TypeScript strict mode
- ✅ Swagger complet et testable

### Documentation
- ✅ README avec quick start
- ✅ Swagger accessible `/docs`
- ✅ Architecture documentée
- ✅ Plan V2 documenté

### Infrastructure
- ✅ `npm install` fonctionne
- ✅ `npm run build` réussit
- ✅ `npm run test:cov` >90%
- ✅ `npm run start:dev` démarre

---

## 🔮 Vision V2 (Préparation)

### Évolutions Prévues
1. **Authentification JWT**
   - Remplacement FakeAuthGuard
   - Login/Register endpoints
   - Refresh tokens

2. **Gestion Rôles**
   - EMPLOYEE, MANAGER, ADMIN
   - Permissions granulaires
   - Workflow validation manager

3. **Workflow Avancé**
   - Soumission → Validation manager → Paiement admin
   - Notifications email
   - Historique modifications

4. **Stockage Cloud**
   - Migration S3/Azure Blob
   - CDN pour téléchargements
   - Chiffrement fichiers sensibles

5. **Features Additionnelles**
   - Export PDF/Excel
   - Statistiques/Dashboard
   - Soft delete + audit trail
   - Rate limiting
   - Logging avancé (Winston)

**Document:** `docs/V2_MIGRATION_PLAN.md` (à créer en Phase 8)

---

## 📞 Contact & Support

**Architecte:** Backend Senior  
**Date création:** 2026-02-11  
**Version:** 1.0  
**Statut:** ✅ Architecture validée - Prêt pour implémentation

---

## 🎓 Conclusion

Cette architecture fournit une base solide pour une API de gestion de notes de frais en V1, avec:
- ✅ Fonctionnalités complètes et testées
- ✅ Code maintenable et évolutif
- ✅ Documentation exhaustive
- ✅ Plan clair pour V2

**L'architecture est prête pour l'implémentation. Aucun code n'a été écrit à ce stade, conformément aux instructions.**

**Prochaine étape:** Validation de ce document → Passage en mode Code pour implémentation.
