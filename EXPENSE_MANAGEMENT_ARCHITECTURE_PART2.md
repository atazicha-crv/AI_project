# Architecture API Gestion de Notes de Frais - PARTIE 2
## Plan de Travail & Points de Confirmation

---

## 7. Plan de Travail (Roadmap) - Suite

### Phase 4: Expenses Module (4-5h) - Suite

**Étape 4.1: Entity & DTOs**
- Créer `Expense` entity
- Définir enums (`ExpenseStatus`, `ExpenseCategory`)
- Créer DTOs (Create, Update, UpdateStatus, Response)
- Relation `ExpenseReport → Expense`

**Livrables:**
- `src/expenses/entities/expense.entity.ts`
- `src/expenses/dto/*.dto.ts`
- Enums dans `src/common/enums/`

**Critères d'acceptation:**
- Entity TypeORM valide
- Relation FK vers `expense_reports`
- DTOs avec validation (amount positif, date pas future)

---

**Étape 4.2: Service avec Recalcul TotalAmount**
- Créer `ExpensesService`
- Implémenter CRUD
- **Hook après create/update/delete:** appeler `expenseReportsService.recalculateTotalAmount(reportId)`
- Implémenter `updateStatus()` avec validation
- Créer `ExpenseStatusValidator` helper

**Livrables:**
- `src/expenses/expenses.service.ts`
- `src/expenses/helpers/expense-status-validator.helper.ts`

**Critères d'acceptation:**
- CRUD fonctionnel
- Recalcul automatique du totalAmount du report parent
- Validation: expense modifiable seulement si report modifiable

---

**Étape 4.3: Controller & Swagger**
- Créer `ExpensesController`
- Endpoints: GET (by report), GET /:id, POST, PATCH, PATCH /status, DELETE
- Routes imbriquées: `/api/expense-reports/:reportId/expenses`
- Documentation Swagger

**Livrables:**
- `src/expenses/expenses.controller.ts`
- `src/expenses/expenses.module.ts`

**Critères d'acceptation:**
- Endpoints fonctionnels
- Swagger documenté
- Validation reportId existe

---

**Étape 4.4: Tests Unitaires**
- Tests `ExpensesService` (CRUD, recalcul, transitions)
- Tests `ExpensesController`
- Tests `ExpenseStatusValidator`
- **Tests critiques:** Vérifier que create/update/delete déclenche recalcul

**Livrables:**
- `src/expenses/expenses.service.spec.ts`
- `src/expenses/expenses.controller.spec.ts`
- `src/expenses/helpers/expense-status-validator.helper.spec.ts`

**Critères d'acceptation:**
- Coverage >90%
- Mock `expenseReportsService.recalculateTotalAmount` vérifié

---

### Phase 5: Attachments Module (3-4h)

**Étape 5.1: Entity & DTOs**
- Créer `Attachment` entity
- Créer DTOs (Response, Upload metadata)
- Relation `Expense → Attachment`

**Livrables:**
- `src/attachments/entities/attachment.entity.ts`
- `src/attachments/dto/*.dto.ts`

**Critères d'acceptation:**
- Entity avec champs fileName, filePath, mimeType, size
- Relation FK vers `expenses`

---

**Étape 5.2: File Storage Helper**
- Créer `FileStorageHelper`
- Méthodes: `saveFile()`, `deleteFile()`, `generateFilePath()`
- Validation MIME type et taille
- Gestion dossier `uploads/expenses/`

**Livrables:**
- `src/attachments/helpers/file-storage.helper.ts`

**Critères d'acceptation:**
- Fichiers sauvegardés avec UUID + extension
- Validation taille max (5MB)
- Validation MIME types autorisés

---

**Étape 5.3: Service & Upload Logic**
- Créer `AttachmentsService`
- Implémenter `upload()` (save file + create record)
- Implémenter `download()` (stream file)
- Implémenter `remove()` (delete file + record)
- Hook `@AfterRemove()` pour suppression fichier

**Livrables:**
- `src/attachments/attachments.service.ts`

**Critères d'acceptation:**
- Upload fonctionnel avec multer
- Suppression cascade (DB + filesystem)
- Gestion erreurs (fichier inexistant, etc.)

---

**Étape 5.4: Controller & Multer**
- Créer `AttachmentsController`
- Configurer multer interceptor
- Endpoints: POST (upload), GET (list), GET /:id, GET /:id/download, DELETE
- Documentation Swagger (multipart/form-data)

**Livrables:**
- `src/attachments/attachments.controller.ts`
- `src/attachments/attachments.module.ts`

**Critères d'acceptation:**
- Upload via Postman/Swagger fonctionnel
- Download retourne le fichier
- Swagger documente multipart

---

**Étape 5.5: Tests Unitaires**
- Tests `AttachmentsService` (upload, download, remove)
- Tests `AttachmentsController`
- Tests `FileStorageHelper`
- Mock filesystem (`fs/promises`)

**Livrables:**
- `src/attachments/attachments.service.spec.ts`
- `src/attachments/attachments.controller.spec.ts`
- `src/attachments/helpers/file-storage.helper.spec.ts`

**Critères d'acceptation:**
- Coverage >85%
- Mock `fs.unlink`, `fs.writeFile` vérifiés
- Tests validation MIME + taille

---

### Phase 6: Guards, Validation & Exceptions (2h)

**Étape 6.1: Global Pipes & Filters**
- Configurer `ValidationPipe` global dans `main.ts`
- Appliquer `HttpExceptionFilter` global
- Appliquer `TransformInterceptor` global

**Livrables:**
- Configuration dans `main.ts`

**Critères d'acceptation:**
- Validation automatique sur tous endpoints
- Réponses standardisées
- Erreurs formatées

---

**Étape 6.2: FakeAuthGuard Application**
- Appliquer `@UseGuards(FakeAuthGuard)` sur tous controllers
- Tester injection `@CurrentUser()`
- Documenter limitation V1

**Livrables:**
- Guards appliqués sur controllers
- `docs/AUTH_V1_LIMITATIONS.md`

**Critères d'acceptation:**
- `req.user` disponible dans tous endpoints
- Swagger indique "Auth required"

---

**Étape 6.3: Custom Exceptions**
- Créer exceptions métier:
  - `InvalidStatusTransitionException`
  - `ReportNotModifiableException`
  - `ExpenseNotModifiableException`
- Mapper vers codes HTTP appropriés

**Livrables:**
- `src/common/exceptions/*.exception.ts`

**Critères d'acceptation:**
- Exceptions levées dans services
- Codes HTTP corrects (409 Conflict, 422 Unprocessable)

---

### Phase 7: Tests & Coverage (3-4h)

**Étape 7.1: Complétion Tests Unitaires**
- Atteindre 90% coverage sur tous modules
- Tests manquants (edge cases, error paths)
- Tests helpers et validators

**Livrables:**
- Tests complets pour tous fichiers

**Critères d'acceptation:**
- `npm run test:cov` affiche >90% global
- Branches >85%

---

**Étape 7.2: Tests d'Intégration (Optionnel)**
- Tests E2E pour workflow complet:
  1. Create user
  2. Create report
  3. Add expenses
  4. Upload attachments
  5. Submit report
  6. Validate report
  7. Pay report

**Livrables:**
- `test/workflows.e2e-spec.ts`

**Critères d'acceptation:**
- Workflow complet passe
- DB nettoyée entre tests

---

**Étape 7.3: Scripts NPM**
- Configurer scripts:
  - `npm run test` (tous tests)
  - `npm run test:watch` (mode watch)
  - `npm run test:cov` (avec coverage)
  - `npm run test:e2e` (E2E uniquement)

**Livrables:**
- Scripts dans `package.json`

**Critères d'acceptation:**
- Tous scripts fonctionnels
- Coverage report généré dans `coverage/`

---

### Phase 8: Documentation & Finalisation (2h)

**Étape 8.1: README.md**
- Installation
- Configuration (.env)
- Lancement (dev, prod, tests)
- Structure projet
- API endpoints (lien Swagger)
- Règles métier principales

**Livrables:**
- `README.md`

**Critères d'acceptation:**
- Documentation claire et complète
- Exemples de requêtes

---

**Étape 8.2: Swagger Finalization**
- Vérifier toutes routes documentées
- Ajouter exemples de réponses
- Ajouter descriptions détaillées
- Grouper par tags

**Livrables:**
- Swagger complet sur `/docs`

**Critères d'acceptation:**
- Toutes routes visibles
- Exemples testables
- Schémas DTOs complets

---

**Étape 8.3: Migration Strategy (V2 Prep)**
- Documenter plan migration JWT
- Documenter plan rôles (MANAGER, ADMIN)
- Documenter plan workflow validation
- Documenter plan stockage cloud

**Livrables:**
- `docs/V2_MIGRATION_PLAN.md`

**Critères d'acceptation:**
- Plan clair pour chaque feature V2
- Estimation effort

---

### Phase 9: Vérifications Finales (1h)

**Étape 9.1: Build & Lint**
- `npm run build` sans erreur
- `npm run lint` sans erreur
- `npm run format` appliqué

**Livrables:**
- Code compilé dans `dist/`

**Critères d'acceptation:**
- Build réussit
- Pas d'erreurs ESLint
- Code formaté

---

**Étape 9.2: Tests Complets**
- `npm run test:cov` >90%
- `npm run test:e2e` passe
- Vérifier coverage report

**Livrables:**
- Coverage report

**Critères d'acceptation:**
- Tous tests passent
- Coverage >90%

---

**Étape 9.3: Validation Fonctionnelle**
- Tester manuellement via Swagger:
  - CRUD Users
  - CRUD Reports
  - CRUD Expenses
  - Upload/Download attachments
  - Transitions statuts
  - Validation erreurs
- Vérifier DB SQLite (données persistées)

**Livrables:**
- Checklist validation

**Critères d'acceptation:**
- Tous endpoints fonctionnels
- Données persistées correctement
- Erreurs gérées proprement

---

## Récapitulatif Roadmap

| Phase | Durée Estimée | Livrables Clés |
|-------|---------------|----------------|
| 1. Bootstrap & Config | 2-3h | NestJS + TypeORM + Swagger + Config |
| 2. Modules Core | 3-4h | Common + Auth + Users |
| 3. ExpenseReports | 4-5h | Entity + Service + Controller + Tests |
| 4. Expenses | 4-5h | Entity + Service + Recalcul + Tests |
| 5. Attachments | 3-4h | Upload + Storage + Tests |
| 6. Guards & Validation | 2h | FakeAuth + Exceptions |
| 7. Tests & Coverage | 3-4h | 90% coverage + E2E |
| 8. Documentation | 2h | README + Swagger + V2 Plan |
| 9. Vérifications | 1h | Build + Tests + Validation |
| **TOTAL** | **24-32h** | **API complète V1** |

---

## 8. Points à Confirmer

### 8.1 Pagination par Défaut

**Question:** Quelle pagination par défaut pour les listes?

**Proposition:**
- `page=1` (première page)
- `limit=20` (20 items par page)
- `maxLimit=100` (limite max pour éviter surcharge)

**Alternative:**
- `limit=50` si volumes attendus élevés

**Décision recommandée:** `limit=20, maxLimit=100`

---

### 8.2 Soft Delete vs Hard Delete

**Question:** Faut-il implémenter le soft delete (suppression logique)?

**Proposition V1:** Hard delete (suppression physique)
- Plus simple
- Pas de complexité requêtes
- Cascade fonctionne naturellement

**Proposition V2:** Soft delete
- Ajouter `deletedAt: Date | null` sur toutes entities
- Permet récupération données
- Audit trail

**Décision recommandée:** Hard delete en V1, soft delete en V2

---

### 8.3 Validation Attachments Obligatoires

**Question:** Une expense doit-elle avoir au moins 1 attachment?

**Proposition V1:** Attachments optionnels
- Flexibilité pour l'utilisateur
- Validation peut être ajoutée en V2

**Proposition V2:** Au moins 1 attachment obligatoire
- Justificatif requis
- Validation au niveau service

**Décision recommandée:** Optionnel en V1, configurable en V2

---

### 8.4 Synchronisation Statuts Report ↔ Expenses

**Question:** Les statuts des expenses doivent-ils suivre automatiquement le report?

**Proposition V1 (souple):**
- Statuts indépendants
- Validation: expense modifiable seulement si report modifiable

**Proposition V2 (strict):**
- Transition report → cascade sur expenses
- Exemple: Report VALIDATED → tous expenses VALIDATED

**Décision recommandée:** V1 souple, V2 strict avec option configuration

---

### 8.5 Format Montants (Decimal vs Integer)

**Question:** Comment stocker les montants?

**Proposition A:** DECIMAL(10,2)
- Stockage direct en euros/dollars
- Exemple: 123.45

**Proposition B:** INTEGER (centimes)
- Stockage en centimes
- Exemple: 12345 (= 123.45€)
- Évite problèmes arrondis

**Décision recommandée:** DECIMAL(10,2) pour simplicité V1, migration INTEGER en V2 si nécessaire

---

## 9. Hypothèses & Choix par Défaut

### 9.1 Hypothèses Métier

1. **Utilisateur unique en V1:** Pas de gestion multi-utilisateurs réelle (FakeAuth)
2. **Pas de workflow validation:** Collaborateur peut valider/rejeter ses propres reports
3. **Pas de notifications:** Pas d'emails/alertes en V1
4. **Stockage local uniquement:** Pas de cloud storage
5. **Pas d'export:** Pas d'export PDF/Excel en V1

### 9.2 Choix Techniques

1. **UUID v4:** Pour tous les IDs
2. **SQLite synchronize: true:** En développement (migrations manuelles en prod)
3. **CORS:** Activé pour `http://localhost:*` en dev
4. **Logging:** NestJS Logger par défaut (Winston en V2)
5. **Rate limiting:** Pas en V1 (à ajouter en V2)

### 9.3 Conventions Code

1. **Naming:** camelCase (TS), snake_case (DB)
2. **DTOs:** Suffixe `Dto` (ex: `CreateUserDto`)
3. **Entities:** Pas de suffixe (ex: `User`, pas `UserEntity`)
4. **Services:** Suffixe `Service` (ex: `UsersService`)
5. **Controllers:** Suffixe `Controller` (ex: `UsersController`)

---

## 10. Diagrammes Complémentaires

### 10.1 Flux de Création Expense avec Recalcul

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/expense-reports/:reportId/expenses
       │ { amount: 100, category: "MEALS", ... }
       ▼
┌─────────────────────────────────────────────────────┐
│ ExpensesController                                   │
│ - Validation DTO                                     │
│ - FakeAuthGuard                                      │
└──────┬──────────────────────────────────────────────┘
       │ expensesService.create(dto, reportId, userId)
       ▼
┌─────────────────────────────────────────────────────┐
│ ExpensesService                                      │
│ 1. Vérifier report existe                           │
│ 2. Vérifier report.status modifiable                │
│ 3. Créer expense (status: CREATED)                  │
│ 4. Sauvegarder en DB                                │
│ 5. ⚡ Appeler recalculateTotalAmount(reportId)      │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ ExpenseReportsService.recalculateTotalAmount()      │
│ 1. Charger toutes expenses du report                │
│ 2. Calculer somme: SUM(amount)                      │
│ 3. Mettre à jour report.totalAmount                 │
│ 4. Sauvegarder report                               │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Response                                             │
│ {                                                    │
│   data: {                                            │
│     id: "expense-uuid",                              │
│     amount: 100,                                     │
│     reportId: "report-uuid",                         │
│     ...                                              │
│   },                                                 │
│   timestamp: "2026-02-11T09:00:00Z"                  │
│ }                                                    │
└─────────────────────────────────────────────────────┘
```

### 10.2 Flux Upload Attachment

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/expenses/:expenseId/attachments
       │ Content-Type: multipart/form-data
       │ file: [binary data]
       ▼
┌─────────────────────────────────────────────────────┐
│ AttachmentsController                                │
│ - Multer interceptor                                 │
│ - Validation taille/MIME                             │
└──────┬──────────────────────────────────────────────┘
       │ attachmentsService.upload(file, expenseId)
       ▼
┌─────────────────────────────────────────────────────┐
│ AttachmentsService                                   │
│ 1. Vérifier expense existe                          │
│ 2. Générer UUID pour fichier                        │
│ 3. Construire filePath: uploads/expenses/<uuid>.ext │
│ 4. Sauvegarder fichier (fs.writeFile)               │
│ 5. Créer enregistrement Attachment en DB            │
└──────┬──────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│ Response                                             │
│ {                                                    │
│   data: {                                            │
│     id: "attachment-uuid",                           │
│     fileName: "facture.pdf",                         │
│     mimeType: "application/pdf",                     │
│     size: 245678,                                    │
│     expenseId: "expense-uuid",                       │
│     createdAt: "2026-02-11T09:00:00Z"                │
│   }                                                  │
│ }                                                    │
└─────────────────────────────────────────────────────┘
```

### 10.3 Flux Transition Statut avec Validation

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ PATCH /api/expense-reports/:id/status
       │ { status: "SUBMITTED" }
       ▼
┌─────────────────────────────────────────────────────┐
│ ExpenseReportsController                             │
│ - Validation DTO (IsEnum)                            │
└──────┬──────────────────────────────────────────────┘
       │ expenseReportsService.updateStatus(id, newStatus)
       ▼
┌─────────────────────────────────────────────────────┐
│ ExpenseReportsService                                │
│ 1. Charger report actuel                            │
│ 2. Vérifier transition autorisée                    │
│    ReportStatusValidator.canTransition(old, new)    │
│ 3. Si SUBMITTED: vérifier au moins 1 expense        │
│ 4. Si PAID: set paymentDate = now()                 │
│ 5. Mettre à jour status                             │
│ 6. Sauvegarder                                       │
└──────┬──────────────────────────────────────────────┘
       │
       ├─ Si transition invalide
       │  ▼
       │  throw ConflictException(
       │    "Cannot transition from X to Y"
       │  )
       │
       └─ Si transition valide
          ▼
          Response 200 + Report mis à jour
```

---

## 11. Checklist Validation Finale

### 11.1 Fonctionnalités

- [ ] CRUD Users complet
- [ ] CRUD ExpenseReports complet
- [ ] CRUD Expenses complet
- [ ] Upload/Download Attachments
- [ ] Recalcul automatique totalAmount
- [ ] Validation transitions statuts
- [ ] Pagination fonctionnelle
- [ ] Filtrage par statut/catégorie
- [ ] Tri par date/montant
- [ ] Gestion erreurs (400, 404, 409, 422)

### 11.2 Qualité Code

- [ ] ESLint: 0 erreur
- [ ] Prettier: code formaté
- [ ] TypeScript: strict mode
- [ ] Pas de `any` (sauf exceptions justifiées)
- [ ] DTOs avec validation complète
- [ ] Swagger: toutes routes documentées

### 11.3 Tests

- [ ] Coverage global >90%
- [ ] Coverage branches >85%
- [ ] Tous services testés
- [ ] Tous controllers testés
- [ ] Helpers/validators testés
- [ ] Tests recalcul totalAmount
- [ ] Tests transitions statuts
- [ ] Tests upload/download fichiers

### 11.4 Documentation

- [ ] README.md complet
- [ ] Swagger accessible sur `/docs`
- [ ] Exemples de requêtes
- [ ] .env.example fourni
- [ ] Architecture documentée
- [ ] Plan V2 documenté

### 11.5 Infrastructure

- [ ] `npm install` fonctionne
- [ ] `npm run build` réussit
- [ ] `npm run start:dev` démarre
- [ ] `npm run test:cov` >90%
- [ ] DB SQLite créée automatiquement
- [ ] Dossier uploads/ créé automatiquement
- [ ] CORS configuré
- [ ] Logs clairs

---

## 12. Commandes Utiles

### Installation
```bash
# Cloner et installer
git clone <repo>
cd expense-management-api
npm install

# Copier .env
cp .env.example .env
```

### Développement
```bash
# Démarrer en mode dev
npm run start:dev

# Accéder à Swagger
open http://localhost:3000/docs

# Lancer tests en watch
npm run test:watch
```

### Tests
```bash
# Tests unitaires
npm run test

# Tests avec coverage
npm run test:cov

# Tests E2E
npm run test:e2e

# Voir coverage report
open coverage/lcov-report/index.html
```

### Build & Production
```bash
# Build
npm run build

# Lancer en prod
npm run start:prod

# Lint
npm run lint

# Format
npm run format
```

### Base de Données
```bash
# Réinitialiser DB (dev uniquement)
rm data/expenses.sqlite
npm run start:dev  # Recrée automatiquement

# Voir contenu DB
sqlite3 data/expenses.sqlite
.tables
.schema users
SELECT * FROM users;
```

---

## 13. Conclusion

Ce document d'architecture fournit une base complète pour implémenter l'API de gestion de notes de frais en V1. Les choix techniques sont justifiés, les règles métier sont clairement définies, et le plan de travail est séquencé pour une implémentation progressive.

**Prochaines étapes:**
1. Valider ce document d'architecture
2. Confirmer les 5 points à clarifier (section 8)
3. Passer en mode implémentation (Code mode)
4. Suivre la roadmap phase par phase

**Durée estimée totale:** 24-32 heures de développement

**Livrables finaux:**
- API REST complète et documentée
- Tests unitaires >90% coverage
- Documentation Swagger interactive
- README complet
- Code production-ready pour V1
