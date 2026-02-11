# Architecture Plan - Full-Stack Monorepo Production-Ready

## 1. Complete File Structure

```
/
├── package.json                    # Root workspace configuration
├── package-lock.json               # Lock file (generated)
├── .gitignore                      # Git ignore rules
├── .eslintrc.js                    # Root ESLint config
├── .prettierrc.js                  # Prettier config
├── .prettierignore                 # Prettier ignore
├── tsconfig.base.json              # Base TypeScript config
├── README.md                       # Project documentation
│
├── frontend/
│   ├── package.json                # Frontend dependencies
│   ├── tsconfig.json               # Frontend TS config
│   ├── tsconfig.node.json          # Vite TS config
│   ├── vite.config.ts              # Vite configuration
│   ├── vitest.config.ts            # Vitest test configuration
│   ├── tailwind.config.js          # TailwindCSS config
│   ├── postcss.config.js           # PostCSS config
│   ├── index.html                  # HTML entry point
│   ├── .env.example                # Environment variables example
│   ├── public/                     # Static assets
│   │   └── vite.svg
│   └── src/
│       ├── main.tsx                # Application entry
│       ├── App.tsx                 # Root component
│       ├── vite-env.d.ts           # Vite types
│       ├── api/
│       │   ├── client.ts           # API client configuration
│       │   └── health.api.ts       # Health endpoint calls
│       ├── components/
│       │   ├── StatusCard.tsx      # Status display component
│       │   └── StatusCard.test.tsx # Component tests
│       ├── hooks/
│       │   ├── useHealth.ts        # Health check hook
│       │   └── useHealth.test.ts   # Hook tests
│       ├── pages/
│       │   ├── StatusPage.tsx      # Main status page
│       │   └── StatusPage.test.tsx # Page tests
│       ├── styles/
│       │   └── index.css           # Global styles + Tailwind
│       └── test/
│           └── setup.ts            # Test setup file
│
├── backend/
│   ├── package.json                # Backend dependencies
│   ├── tsconfig.json               # Backend TS config
│   ├── tsconfig.build.json         # Build TS config
│   ├── nest-cli.json               # NestJS CLI config
│   ├── jest.config.js              # Jest configuration
│   ├── .env.example                # Environment variables example
│   ├── data/                       # SQLite database directory
│   │   ├── .gitkeep
│   │   └── dev.sqlite              # (generated at runtime)
│   └── src/
│       ├── main.ts                 # Application entry
│       ├── app.module.ts           # Root module
│       ├── config/
│       │   ├── database.config.ts  # Database configuration
│       │   └── app.config.ts       # App configuration
│       ├── database/
│       │   └── database.module.ts  # TypeORM module setup
│       ├── health/
│       │   ├── health.module.ts    # Health module
│       │   ├── health.controller.ts # Health controller
│       │   ├── health.service.ts   # Health service
│       │   ├── health.controller.spec.ts # Controller tests
│       │   └── health.service.spec.ts    # Service tests
│       └── users/
│           ├── users.module.ts     # Users module
│           ├── users.controller.ts # Users controller
│           ├── users.service.ts    # Users service
│           ├── entities/
│           │   └── user.entity.ts  # User entity
│           ├── dto/
│           │   ├── create-user.dto.ts # Create DTO
│           │   └── user.dto.ts     # User response DTO
│           ├── users.controller.spec.ts # Controller tests
│           └── users.service.spec.ts    # Service tests
│
└── shared/
    ├── package.json                # Shared package config
    ├── tsconfig.json               # Shared TS config
    └── src/
        ├── index.ts                # Main exports
        └── dtos/
            ├── health.dto.ts       # Health DTOs
            └── user.dto.ts         # User DTOs
```

## 2. Dependency Graph & Build Order

### Build Order
1. **shared** - Must build first (no dependencies)
2. **backend** - Depends on shared
3. **frontend** - Depends on shared

### Dependency Flow
```
shared (base)
  ↓
  ├─→ backend (imports @shared/*)
  └─→ frontend (imports @shared/*)
```

### NPM Workspace Dependencies
- **frontend**: `"@shared": "workspace:*"`
- **backend**: `"@shared": "workspace:*"`

## 3. Shared Package Design

### Package Structure
```typescript
// shared/src/index.ts
export * from './dtos/health.dto';
export * from './dtos/user.dto';

// shared/src/dtos/health.dto.ts
export interface HealthResponseDto {
  ok: boolean;
  api: { ok: boolean };
  db: { ok: boolean; error?: string };
  message: string;
  timestamp: string;
}

// shared/src/dtos/user.dto.ts
export interface UserDto {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface CreateUserRequestDto {
  email: string;
  name: string;
}
```

### Build Configuration
- **TypeScript**: Compile to `dist/` with declarations
- **Package.json**: 
  - `"main": "dist/index.js"`
  - `"types": "dist/index.d.ts"`
  - `"files": ["dist"]`

## 4. Backend Architecture

### Module Structure

#### Health Module
```typescript
// Purpose: System health checks
// Endpoints: GET /health
// Dependencies: TypeORM connection

HealthController
  ↓
HealthService
  ↓
TypeORM Connection (test query)
```

**Service Logic:**
- Test database connection with simple query
- Catch errors and return structured response
- Always return 200 OK (even if DB fails)

#### Users Module
```typescript
// Purpose: User CRUD operations
// Endpoints: GET /users, POST /users, GET /users/:id
// Dependencies: TypeORM, class-validator

UsersController
  ↓
UsersService
  ↓
TypeORM Repository<User>
```

**Entity:**
```typescript
@Entity('users')
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

**DTOs with Validation:**
```typescript
class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;
}
```

### Configuration Strategy

**Database Config:**
```typescript
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'data/dev.sqlite',
  entities: [User],
  synchronize: true, // DEV ONLY - documented in README
  logging: process.env.NODE_ENV === 'development',
})
```

**Swagger Config:**
```typescript
SwaggerModule.setup('docs', app, document, {
  customSiteTitle: 'API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
})
```

**CORS Config:**
```typescript
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
})
```

**Global Validation Pipe:**
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}))
```

## 5. Frontend Architecture

### Component Hierarchy
```
App
  └── StatusPage
        ├── StatusCard (Frontend)
        ├── StatusCard (Backend)
        └── StatusCard (Database)
```

### API Layer Design

**Client Configuration:**
```typescript
// api/client.ts
const API_BASE = '/api'; // Proxied by Vite

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
```

**Health API:**
```typescript
// api/health.api.ts
import { HealthResponseDto } from '@shared';

export async function getHealth(): Promise<HealthResponseDto> {
  return apiGet<HealthResponseDto>('/health');
}
```

### Custom Hook Pattern

**useHealth Hook:**
```typescript
interface UseHealthResult {
  data: HealthResponseDto | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHealth(): UseHealthResult {
  // Fetch on mount
  // Handle loading/error states
  // Provide refetch function
}
```

### Vite Proxy Configuration
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

## 6. Testing Strategy

### Backend Testing (Jest)

**Coverage Target:** ≥80%

**Test Files:**
1. `health.service.spec.ts`
   - ✓ Should return OK when DB connection works
   - ✓ Should return error when DB connection fails
   - Mock: TypeORM connection

2. `health.controller.spec.ts`
   - ✓ Should call service and return response
   - Mock: HealthService

3. `users.service.spec.ts`
   - ✓ Should create user
   - ✓ Should list users
   - ✓ Should find user by ID
   - ✓ Should throw NotFoundException
   - Mock: TypeORM Repository

4. `users.controller.spec.ts`
   - ✓ Should call service methods
   - Mock: UsersService

**Jest Configuration:**
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
  ],
}
```

### Frontend Testing (Vitest)

**Coverage Target:** ≥80%

**Test Files:**
1. `useHealth.test.ts`
   - ✓ Should fetch health data
   - ✓ Should handle loading state
   - ✓ Should handle errors
   - Mock: fetch API

2. `StatusCard.test.tsx`
   - ✓ Should render OK status
   - ✓ Should render error status
   - ✓ Should display message

3. `StatusPage.test.tsx`
   - ✓ Should render all status cards
   - ✓ Should show loading state
   - ✓ Should handle backend down
   - Mock: useHealth hook

**Vitest Configuration:**
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.test.{ts,tsx}',
      ],
    },
  },
})
```

## 7. Scripts & Tooling

### Root package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev -w backend\" \"npm run dev -w frontend\"",
    "build": "npm run build -w shared && npm run build -w backend && npm run build -w frontend",
    "test": "npm run test -w backend && npm run test -w frontend",
    "test:cov": "npm run test:cov -w backend && npm run test:cov -w frontend",
    "lint": "npm run lint -w shared && npm run lint -w backend && npm run lint -w frontend",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "npm run typecheck -w shared && npm run typecheck -w backend && npm run typecheck -w frontend"
  }
}
```

### ESLint Configuration

**Root .eslintrc.js:**
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
}
```

**Frontend extends:** `plugin:react-hooks/recommended`

### Prettier Configuration
```javascript
module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
}
```

## 8. Technical Decisions

### Decision 1: Shared Package Build Strategy
**Choice:** Simple TypeScript build (not project references)
**Rationale:**
- Simpler to configure and understand
- Works reliably with npm workspaces
- Build order is explicit in scripts
- No complex tsconfig.json references needed

### Decision 2: Database Synchronize in Development
**Choice:** `synchronize: true` for SQLite in dev
**Rationale:**
- Rapid development without migrations
- SQLite is local, no production risk
- Clearly documented in README as DEV ONLY
- Production would use migrations

### Decision 3: API Communication Pattern
**Choice:** Simple fetch with Vite proxy
**Rationale:**
- No unnecessary dependencies (axios, etc.)
- Native fetch is modern and sufficient
- Vite proxy handles CORS in dev
- Type safety via shared DTOs

### Decision 4: Test Coverage Enforcement
**Choice:** Hard thresholds in config files
**Rationale:**
- Enforces quality standards
- Fails CI/CD if coverage drops
- Clear visibility of coverage gaps
- Configurable per package if needed

### Decision 5: Monorepo Tool
**Choice:** npm workspaces (as specified)
**Rationale:**
- Native to npm, no extra tools
- Simple workspace protocol
- Good IDE support
- Sufficient for this project size

## 9. Environment Variables

### Backend (.env.example)
```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=data/dev.sqlite
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.example)
```env
VITE_API_URL=/api
```

## 10. Implementation Roadmap

### Phase 1: Foundation (Files 1-15)
1. Root package.json + workspace config
2. Root configs: .gitignore, ESLint, Prettier, tsconfig.base.json
3. README.md with setup instructions
4. Shared package structure + build
5. Backend package.json + configs

### Phase 2: Backend Core (Files 16-30)
6. Backend main.ts + app.module.ts
7. Database configuration + module
8. Health module (controller, service, tests)
9. User entity + DTOs
10. Users module (controller, service, tests)

### Phase 3: Frontend Core (Files 31-45)
11. Frontend package.json + configs
12. Vite + Tailwind setup
13. API client layer
14. useHealth hook + tests
15. StatusCard component + tests
16. StatusPage + tests
17. App.tsx + main.tsx

### Phase 4: Quality & Documentation (Files 46-50)
18. All test files with proper coverage
19. .env.example files
20. Final README with all instructions

### Estimated File Count: ~50 files

## 11. Acceptance Criteria Checklist

- [ ] `npm install` at root succeeds
- [ ] `npm run build` compiles all packages without errors
- [ ] `npm run test` runs all tests successfully
- [ ] `npm run test:cov` achieves ≥80% coverage (both packages)
- [ ] Backend starts on port 3000
- [ ] Frontend starts on port 5173
- [ ] Swagger accessible at http://localhost:3000/docs
- [ ] Frontend displays status page with:
  - [ ] Frontend: OK
  - [ ] Backend: OK/KO (real check)
  - [ ] Database: OK/KO (real SQLite test)
  - [ ] Error messages when applicable
- [ ] GET /health returns proper typed response
- [ ] GET /users works
- [ ] POST /users works with validation
- [ ] GET /users/:id works with 404 handling
- [ ] ESLint passes on all packages
- [ ] Prettier formatting is consistent
- [ ] TypeScript compilation has no errors
- [ ] No TODO comments blocking functionality

## 12. Risk Mitigation

### Risk 1: Shared Package Import Issues
**Mitigation:** Test imports immediately after shared build

### Risk 2: Test Coverage Below 80%
**Mitigation:** Write tests incrementally, check coverage frequently

### Risk 3: SQLite Connection Issues
**Mitigation:** Ensure data/ directory exists, proper error handling

### Risk 4: CORS Issues in Development
**Mitigation:** Proper Vite proxy + NestJS CORS config

### Risk 5: Build Order Dependencies
**Mitigation:** Explicit build script order, clear documentation
