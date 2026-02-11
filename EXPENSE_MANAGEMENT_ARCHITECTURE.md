# Architecture API Gestion de Notes de Frais
## NestJS + TypeORM + SQLite - Document d'Architecture V1

**Version:** 1.0  
**Date:** 2026-02-11  
**Statut:** Architecture - Pas d'implémentation  
**Stack imposée:** NestJS, TypeORM, SQLite, Swagger, Jest

---

## Table des Matières

1. [Architecture Applicative NestJS](#1-architecture-applicative-nestjs)
2. [Schéma de Données & Contraintes](#2-schéma-de-données--contraintes)
3. [API Design (Swagger-first)](#3-api-design-swagger-first)
4. [Stratégie Fichiers (Upload)](#4-stratégie-fichiers-upload)
5. [Règles Statuts & Transitions](#5-règles-statuts--transitions)
6. [Stratégie Tests & Couverture](#6-stratégie-tests--couverture)
7. [Plan de Travail (Roadmap)](#7-plan-de-travail-roadmap)
8. [Points à Confirmer](#8-points-à-confirmer)

---

## 1. Architecture Applicative NestJS

### 1.1 Découpage en Modules

```
backend/src/
├── app.module.ts                    # Module racine
├── main.ts                          # Bootstrap application
│
├── config/                          # Configuration centralisée
│   ├── config.module.ts
│   └── config.service.ts
│
├── database/                        # Configuration TypeORM
│   ├── database.module.ts
│   └── database.config.ts
│
├── auth/                            # Module authentification
│   ├── auth.module.ts
│   ├── guards/
│   │   └── fake-auth.guard.ts      # V1: FakeAuthGuard (return true)
│   └── decorators/
│       └── current-user.decorator.ts
│
├── common/                          # Utilitaires partagés
│   ├── common.module.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   ├── decorators/
│   │   └── api-paginated-response.decorator.ts
│   └── interfaces/
│       └── paginated-response.interface.ts
│
├── users/                           # Module utilisateurs
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       ├── create-user.dto.ts
│       ├── update-user.dto.ts
│       └── user-response.dto.ts
│
├── expense-reports/                 # Module rapports de notes de frais
│   ├── expense-reports.module.ts
│   ├── expense-reports.controller.ts
│   ├── expense-reports.service.ts
│   ├── entities/
│   │   └── expense-report.entity.ts
│   ├── dto/
│   │   ├── create-expense-report.dto.ts
│   │   ├── update-expense-report.dto.ts
│   │   ├── expense-report-response.dto.ts
│   │   └── update-report-status.dto.ts
│   └── helpers/
│       └── report-status-validator.helper.ts
│
├── expenses/                        # Module dépenses
│   ├── expenses.module.ts
│   ├── expenses.controller.ts
│   ├── expenses.service.ts
│   ├── entities/
│   │   └── expense.entity.ts
│   ├── dto/
│   │   ├── create-expense.dto.ts
│   │   ├── update-expense.dto.ts
│   │   ├── expense-response.dto.ts
│   │   └── update-expense-status.dto.ts
│   └── helpers/
│       └── expense-status-validator.helper.ts
│
└── attachments/                     # Module pièces jointes
    ├── attachments.module.ts
    ├── attachments.controller.ts
    ├── attachments.service.ts
    ├── entities/
    │   └── attachment.entity.ts
    ├── dto/
    │   ├── attachment-response.dto.ts
    │   └── upload-attachment.dto.ts
    └── helpers/
        └── file-storage.helper.ts
```

### 1.2 Organisation par Fonctionnalité

**Principe:** Chaque module est autonome et contient:
- **Entities:** Définitions TypeORM des tables
- **DTOs:** Data Transfer Objects (validation avec `class-validator`)
- **Services:** Logique métier
- **Controllers:** Endpoints REST
- **Helpers:** Utilitaires spécifiques au domaine

### 1.3 Conventions de Nommage

#### Fichiers
```
<nom>.<type>.ts

Exemples:
- user.entity.ts
- create-user.dto.ts
- users.service.ts
- users.controller.ts
- users.module.ts
- fake-auth.guard.ts
- http-exception.filter.ts
```

#### Classes
```
<Nom><Type>

Exemples:
- UserEntity (ou User pour les entities)
- CreateUserDto
- UsersService
- UsersController
- UsersModule
- FakeAuthGuard
- HttpExceptionFilter
```

#### Routes REST
```
/api/<ressource-pluriel>/<action>

Exemples:
- GET    /api/users
- POST   /api/users
- GET    /api/users/:id
- PATCH  /api/users/:id
- DELETE /api/users/:id

- GET    /api/expense-reports
- POST   /api/expense-reports
- GET    /api/expense-reports/:id
- PATCH  /api/expense-reports/:id/status
- DELETE /api/expense-reports/:id

- GET    /api/expense-reports/:reportId/expenses
- POST   /api/expense-reports/:reportId/expenses
- PATCH  /api/expenses/:id
- DELETE /api/expenses/:id

- POST   /api/expenses/:expenseId/attachments
- GET    /api/expenses/:expenseId/attachments
- DELETE /api/attachments/:id
- GET    /api/attachments/:id/download
```

### 1.4 Stratégie de Configuration

**ConfigModule (NestJS @nestjs/config)**

```typescript
// config/config.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_PATH: Joi.string().default('./data/expenses.sqlite'),
        UPLOAD_DIR: Joi.string().default('./uploads'),
        MAX_FILE_SIZE: Joi.number().default(5242880), // 5MB
        ALLOWED_MIME_TYPES: Joi.string().default('image/jpeg,image/png,application/pdf'),
      }),
    }),
  ],
})
```

**Variables d'environnement (.env)**
```
NODE_ENV=development
PORT=3000
DATABASE_PATH=./data/expenses.sqlite
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,application/pdf
```

### 1.5 Guards & Interceptors

#### FakeAuthGuard (V1)
```typescript
// auth/guards/fake-auth.guard.ts
@Injectable()
export class FakeAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // V1: Laisse tout passer
    // Injecte un utilisateur factice dans la requête
    const request = context.switchToHttp().getRequest();
    request.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'fake@example.com',
      role: UserRole.EMPLOYEE,
    };
    return true;
  }
}
```

**Application:** Décorateur `@UseGuards(FakeAuthGuard)` sur les controllers

#### TransformInterceptor
```typescript
// common/interceptors/transform.interceptor.ts
// Standardise les réponses: { data: T, timestamp: string }
```

#### HttpExceptionFilter
```typescript
// common/filters/http-exception.filter.ts
// Standardise les erreurs: { statusCode, message, timestamp, path }
```

### 1.6 Validation Pipes

**Global Validation Pipe (main.ts)**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Supprime les propriétés non décorées
    forbidNonWhitelisted: true, // Rejette si propriétés inconnues
    transform: true,            // Transforme les types automatiquement
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

---

## 2. Schéma de Données & Contraintes

### 2.1 Schéma Relationnel

```
┌─────────────────────────────────────────────────────────────┐
│                          User                                │
├─────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                │
│ firstName: VARCHAR(255) NOT NULL                             │
│ lastName: VARCHAR(255) NOT NULL                              │
│ email: VARCHAR(255) UNIQUE NOT NULL                          │
│ role: VARCHAR(50) NOT NULL (enum: EMPLOYEE)                  │
│ managerId: UUID NULL (FK → User.id) [V2]                     │
│ createdAt: DATETIME NOT NULL                                 │
│ updatedAt: DATETIME NOT NULL                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     ExpenseReport                            │
├─────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                │
│ purpose: VARCHAR(500) NOT NULL                               │
│ reportDate: DATE NOT NULL                                    │
│ totalAmount: DECIMAL(10,2) NOT NULL DEFAULT 0                │
│ status: VARCHAR(50) NOT NULL (enum)                          │
│ paymentDate: DATE NULL                                       │
│ userId: UUID NOT NULL (FK → User.id)                         │
│ createdAt: DATETIME NOT NULL                                 │
│ updatedAt: DATETIME NOT NULL                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Expense                               │
├─────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                │
│ reportId: UUID NOT NULL (FK → ExpenseReport.id)              │
│ category: VARCHAR(50) NOT NULL (enum)                        │
│ expenseName: VARCHAR(255) NULL                               │
│ description: TEXT NULL                                       │
│ amount: DECIMAL(10,2) NOT NULL                               │
│ expenseDate: DATE NOT NULL                                   │
│ status: VARCHAR(50) NOT NULL (enum)                          │
│ createdAt: DATETIME NOT NULL                                 │
│ updatedAt: DATETIME NOT NULL                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Attachment                              │
├─────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                │
│ expenseId: UUID NOT NULL (FK → Expense.id)                   │
│ fileName: VARCHAR(255) NOT NULL                              │
│ filePath: VARCHAR(500) NOT NULL                              │
│ mimeType: VARCHAR(100) NOT NULL                              │
│ size: INTEGER NOT NULL                                       │
│ createdAt: DATETIME NOT NULL                                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Cardinalités & Relations

| Relation | Type | Cascade Delete | Notes |
|----------|------|----------------|-------|
| User → ExpenseReport | 1:N | YES | Suppression user → supprime ses reports |
| ExpenseReport → Expense | 1:N | YES | Suppression report → supprime ses expenses |
| Expense → Attachment | 1:N | YES | Suppression expense → supprime ses attachments + fichiers |

### 2.3 Contraintes & Indices

#### User
- **PK:** `id` (UUID)
- **UNIQUE:** `email`
- **INDEX:** `email` (pour recherche rapide)
- **INDEX:** `managerId` (préparation V2)

#### ExpenseReport
- **PK:** `id` (UUID)
- **FK:** `userId` → `User.id` (ON DELETE CASCADE)
- **INDEX:** `userId` (pour requêtes par utilisateur)
- **INDEX:** `status` (pour filtrage par statut)
- **INDEX:** `reportDate` (pour tri chronologique)

#### Expense
- **PK:** `id` (UUID)
- **FK:** `reportId` → `ExpenseReport.id` (ON DELETE CASCADE)
- **INDEX:** `reportId` (pour requêtes par report)
- **INDEX:** `category` (pour filtrage)
- **INDEX:** `status` (pour filtrage)

#### Attachment
- **PK:** `id` (UUID)
- **FK:** `expenseId` → `Expense.id` (ON DELETE CASCADE)
- **INDEX:** `expenseId` (pour requêtes par expense)

### 2.4 Enums en SQLite

**Stratégie:** Stockage en VARCHAR avec validation TypeORM + class-validator

```typescript
// Définition TypeScript
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  // V2: MANAGER = 'MANAGER', ADMIN = 'ADMIN'
}

export enum ReportStatus {
  CREATED = 'CREATED',
  SUBMITTED = 'SUBMITTED',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum ExpenseStatus {
  CREATED = 'CREATED',
  SUBMITTED = 'SUBMITTED',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export enum ExpenseCategory {
  TRAVEL = 'TRAVEL',
  MEALS = 'MEALS',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  TRANSPORT = 'TRANSPORT',
  OTHER = 'OTHER',
}

// Entity TypeORM
@Column({ type: 'varchar', length: 50 })
role: UserRole;

@Column({ type: 'varchar', length: 50 })
status: ReportStatus;

// DTO Validation
@IsEnum(ReportStatus)
status: ReportStatus;
```

### 2.5 Politique UUID

**Choix:** UUID v4 généré par TypeORM

```typescript
@PrimaryGeneratedColumn('uuid')
id: string;
```

**Avantages:**
- Pas de collision entre environnements
- Sécurité (pas de séquence prévisible)
- Distribution facilitée (V2+)

---

## 3. API Design (Swagger-first)

### 3.1 Principes Généraux

- **Base URL:** `/api`
- **Versioning:** Pas de versioning explicite en V1 (prévu `/api/v2` pour V2)
- **Format:** JSON uniquement
- **Pagination:** Query params `?page=1&limit=10` (défaut: page=1, limit=20, max=100)
- **Filtrage:** Query params `?status=CREATED&category=TRAVEL`
- **Tri:** Query param `?sortBy=createdAt&order=DESC`
- **Codes HTTP standardisés**

### 3.2 Codes HTTP

| Code | Usage |
|------|-------|
| 200 OK | Succès GET, PATCH |
| 201 Created | Succès POST |
| 204 No Content | Succès DELETE |
| 400 Bad Request | Validation échouée, données invalides |
| 401 Unauthorized | Non authentifié (V2) |
| 403 Forbidden | Authentifié mais pas autorisé (V2) |
| 404 Not Found | Ressource inexistante |
| 409 Conflict | Conflit métier (ex: modification statut invalide) |
| 422 Unprocessable Entity | Règle métier violée |
| 500 Internal Server Error | Erreur serveur |

### 3.3 Format de Réponse Standardisé

#### Succès
```json
{
  "data": { ... },
  "timestamp": "2026-02-11T08:52:13.768Z"
}
```

#### Succès avec pagination
```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "timestamp": "2026-02-11T08:52:13.768Z"
}
```

#### Erreur
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "amount must be a positive number"
    }
  ],
  "timestamp": "2026-02-11T08:52:13.768Z",
  "path": "/api/expenses"
}
```

### 3.4 Endpoints par Ressource

#### 3.4.1 Users (Minimal)

| Méthode | Endpoint | Description | Auth | Body | Response |
|---------|----------|-------------|------|------|----------|
| GET | `/api/users` | Liste utilisateurs | FakeAuth | - | 200 + User[] |
| GET | `/api/users/:id` | Détail utilisateur | FakeAuth | - | 200 + User |
| POST | `/api/users` | Créer utilisateur | FakeAuth | CreateUserDto | 201 + User |
| PATCH | `/api/users/:id` | Modifier utilisateur | FakeAuth | UpdateUserDto | 200 + User |

**CreateUserDto:**
```typescript
{
  firstName: string;      // required, min 2, max 100
  lastName: string;       // required, min 2, max 100
  email: string;          // required, email format, unique
  role?: UserRole;        // optional, default EMPLOYEE
}
```

**UpdateUserDto:**
```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;         // unique check
}
```

**UserResponseDto:**
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  managerId: string | null;
  createdAt: string;      // ISO 8601
  updatedAt: string;
}
```

#### 3.4.2 ExpenseReports

| Méthode | Endpoint | Description | Auth | Body | Response |
|---------|----------|-------------|------|------|----------|
| GET | `/api/expense-reports` | Liste reports (paginé, filtré) | FakeAuth | - | 200 + Report[] |
| GET | `/api/expense-reports/:id` | Détail report + expenses | FakeAuth | - | 200 + Report |
| POST | `/api/expense-reports` | Créer report | FakeAuth | CreateReportDto | 201 + Report |
| PATCH | `/api/expense-reports/:id` | Modifier report | FakeAuth | UpdateReportDto | 200 + Report |
| PATCH | `/api/expense-reports/:id/status` | Changer statut | FakeAuth | UpdateStatusDto | 200 + Report |
| DELETE | `/api/expense-reports/:id` | Supprimer report | FakeAuth | - | 204 |

**Query Params (GET /api/expense-reports):**
- `page`: number (default 1)
- `limit`: number (default 20, max 100)
- `status`: ReportStatus (filter)
- `userId`: UUID (filter, V2 pour managers)
- `sortBy`: 'reportDate' | 'createdAt' | 'totalAmount' (default 'reportDate')
- `order`: 'ASC' | 'DESC' (default 'DESC')

**CreateExpenseReportDto:**
```typescript
{
  purpose: string;        // required, min 5, max 500
  reportDate: string;     // required, ISO date, not future
}
```

**UpdateExpenseReportDto:**
```typescript
{
  purpose?: string;       // min 5, max 500
  reportDate?: string;    // ISO date, not future
}
// Règle: modifiable seulement si status ∈ {CREATED, SUBMITTED}
```

**UpdateReportStatusDto:**
```typescript
{
  status: ReportStatus;   // required, enum
  paymentDate?: string;   // required if status = PAID
}
// Règle: transitions validées (voir section 5)
```

**ExpenseReportResponseDto:**
```typescript
{
  id: string;
  purpose: string;
  reportDate: string;     // ISO date
  totalAmount: number;
  status: ReportStatus;
  paymentDate: string | null;
  userId: string;
  user: {                 // relation chargée
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  expenses?: Expense[];   // optionnel, chargé sur GET /:id
  createdAt: string;
  updatedAt: string;
}
```

#### 3.4.3 Expenses

| Méthode | Endpoint | Description | Auth | Body | Response |
|---------|----------|-------------|------|------|----------|
| GET | `/api/expense-reports/:reportId/expenses` | Liste expenses d'un report | FakeAuth | - | 200 + Expense[] |
| GET | `/api/expenses/:id` | Détail expense + attachments | FakeAuth | - | 200 + Expense |
| POST | `/api/expense-reports/:reportId/expenses` | Créer expense | FakeAuth | CreateExpenseDto | 201 + Expense |
| PATCH | `/api/expenses/:id` | Modifier expense | FakeAuth | UpdateExpenseDto | 200 + Expense |
| PATCH | `/api/expenses/:id/status` | Changer statut | FakeAuth | UpdateStatusDto | 200 + Expense |
| DELETE | `/api/expenses/:id` | Supprimer expense | FakeAuth | - | 204 |

**CreateExpenseDto:**
```typescript
{
  category: ExpenseCategory;    // required, enum
  expenseName?: string;         // optional, max 255
  description?: string;         // optional, max 1000
  amount: number;               // required, positive, max 2 decimals
  expenseDate: string;          // required, ISO date, not future
}
```

**UpdateExpenseDto:**
```typescript
{
  category?: ExpenseCategory;
  expenseName?: string;
  description?: string;
  amount?: number;              // positive, max 2 decimals
  expenseDate?: string;         // ISO date, not future
}
// Règle: modifiable seulement si status ∈ {CREATED, SUBMITTED}
```

**UpdateExpenseStatusDto:**
```typescript
{
  status: ExpenseStatus;        // required, enum
}
// Règle: transitions validées
```

**ExpenseResponseDto:**
```typescript
{
  id: string;
  reportId: string;
  category: ExpenseCategory;
  expenseName: string | null;
  description: string | null;
  amount: number;
  expenseDate: string;          // ISO date
  status: ExpenseStatus;
  attachments?: Attachment[];   // optionnel, chargé sur GET /:id
  createdAt: string;
  updatedAt: string;
}
```

**Règle métier:** Après create/update/delete expense → recalcul `totalAmount` du report parent

#### 3.4.4 Attachments

| Méthode | Endpoint | Description | Auth | Body | Response |
|---------|----------|-------------|------|------|----------|
| POST | `/api/expenses/:expenseId/attachments` | Upload fichier | FakeAuth | multipart/form-data | 201 + Attachment |
| GET | `/api/expenses/:expenseId/attachments` | Liste attachments | FakeAuth | - | 200 + Attachment[] |
| GET | `/api/attachments/:id` | Métadonnées attachment | FakeAuth | - | 200 + Attachment |
| GET | `/api/attachments/:id/download` | Télécharger fichier | FakeAuth | - | 200 + file stream |
| DELETE | `/api/attachments/:id` | Supprimer attachment | FakeAuth | - | 204 |

**Upload (POST /api/expenses/:expenseId/attachments):**
- Content-Type: `multipart/form-data`
- Field name: `file`
- Validation:
  - Max size: 5MB (configurable)
  - MIME types: `image/jpeg`, `image/png`, `application/pdf` (configurable)

**AttachmentResponseDto:**
```typescript
{
  id: string;
  expenseId: string;
  fileName: string;           // nom original
  filePath: string;           // chemin relatif (backend only, pas exposé en prod)
  mimeType: string;
  size: number;               // bytes
  createdAt: string;
}
```

**Règle métier:** DELETE attachment → suppression fichier physique + enregistrement DB

### 3.5 Documentation Swagger

**Configuration (main.ts):**
```typescript
const config = new DocumentBuilder()
  .setTitle('Expense Management API')
  .setDescription('API de gestion de notes de frais - V1')
  .setVersion('1.0')
  .addTag('users', 'Gestion des utilisateurs')
  .addTag('expense-reports', 'Gestion des rapports de notes de frais')
  .addTag('expenses', 'Gestion des dépenses')
  .addTag('attachments', 'Gestion des pièces jointes')
  .addBearerAuth() // Préparation V2
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

**Décorateurs à utiliser:**
- `@ApiTags('expense-reports')`
- `@ApiOperation({ summary: 'Create expense report' })`
- `@ApiResponse({ status: 201, type: ExpenseReportResponseDto })`
- `@ApiResponse({ status: 400, description: 'Validation failed' })`
- `@ApiParam({ name: 'id', type: 'string', format: 'uuid' })`
- `@ApiQuery({ name: 'status', enum: ReportStatus, required: false })`
- `@ApiBody({ type: CreateExpenseReportDto })`
- `@ApiProperty()` dans les DTOs

---

## 4. Stratégie Fichiers (Upload)

### 4.1 Stockage Local

**Répertoire:** `uploads/` (à la racine du projet backend)

**Structure:**
```
uploads/
├── expenses/
│   ├── <uuid>.<ext>
│   ├── <uuid>.<ext>
│   └── ...
```

**Convention de nommage:**
- Format: `<attachment-uuid>.<extension>`
- Exemple: `a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf`
- Extension extraite du MIME type ou nom original

### 4.2 Métadonnées en DB

**Table Attachment stocke:**
- `fileName`: Nom original du fichier (ex: `facture_hotel.pdf`)
- `filePath`: Chemin relatif (ex: `uploads/expenses/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf`)
- `mimeType`: Type MIME (ex: `application/pdf`)
- `size`: Taille en bytes

### 4.3 Limites & Validation

**Limites (configurables via .env):**
- **Taille max:** 5 MB (5242880 bytes)
- **Types autorisés:**
  - `image/jpeg`
  - `image/png`
  - `application/pdf`

**Validation:**
1. Vérification MIME type (header + extension)
2. Vérification taille
3. Scan antivirus (V2, optionnel)

**Implémentation:**
- Utiliser `@nestjs/platform-express` avec `multer`
- Interceptor custom pour validation
- Rejet avec 400 si validation échoue

### 4.4 Stratégie de Suppression

**Cascade:**
1. DELETE Attachment (DB) → Trigger suppression fichier physique
2. DELETE Expense → Cascade DELETE Attachments → Suppression fichiers
3. DELETE ExpenseReport → Cascade DELETE Expenses → Cascade DELETE Attachments → Suppression fichiers

**Implémentation:**
```typescript
// attachments.service.ts
async remove(id: string): Promise<void> {
  const attachment = await this.findOne(id);
  
  // 1. Supprimer fichier physique
  await fs.unlink(attachment.filePath);
  
  // 2. Supprimer enregistrement DB
  await this.attachmentRepository.delete(id);
}

// Listener TypeORM pour cascade
@AfterRemove()
async deleteFile() {
  if (this.filePath && fs.existsSync(this.filePath)) {
    await fs.unlink(this.filePath);
  }
}
```

### 4.5 Sécurité

**V1:**
- Validation MIME type stricte
- Limitation taille
- Stockage h