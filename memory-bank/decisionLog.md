# Decision Log

This file records architectural and implementation decisions using a list format.
2026-02-10 16:26:36 - Log of updates made.

---

## [2026-02-10 16:40:03] Monorepo Tool Selection

**Decision:** Use npm workspaces for monorepo management

**Rationale:**
- Native to npm (no additional tools like Yarn or pnpm required)
- Simple workspace protocol with `workspace:*` syntax
- Good IDE support across VSCode, WebStorm, etc.
- Sufficient for project size (3 packages)
- User explicitly specified npm workspaces

**Implementation Details:**
- Root `package.json` defines workspaces: `["frontend", "backend", "shared"]`
- Packages reference shared via `"@shared": "workspace:*"`
- Build order managed explicitly in scripts

---

## [2026-02-10 16:40:03] Shared Package Build Strategy

**Decision:** Simple TypeScript compilation (not project references)

**Rationale:**
- Simpler configuration and easier to understand
- Works reliably with npm workspaces
- Build order is explicit in package.json scripts
- No complex tsconfig.json references needed
- Faster for developers to grasp

**Implementation Details:**
- Shared package compiles to `dist/` with TypeScript
- `package.json` exports: `"main": "dist/index.js"`, `"types": "dist/index.d.ts"`
- Build script: `npm run build -w shared && npm run build -w backend && npm run build -w frontend`

---

## [2026-02-10 16:40:03] Database Choice and Configuration

**Decision:** SQLite with `synchronize: true` in development

**Rationale:**
- Zero configuration required
- File-based, easy to reset during development
- Perfect for local development and testing
- `synchronize: true` enables rapid iteration without migrations
- Clearly documented as DEV ONLY in README

**Implementation Details:**
- Database file: `backend/data/dev.sqlite`
- TypeORM config: `{ type: 'sqlite', database: 'data/dev.sqlite', synchronize: true }`
- Production migration path documented in README
- `.gitignore` excludes `*.sqlite` files

---

## [2026-02-10 16:40:03] Frontend-Backend Communication

**Decision:** Vite proxy with native fetch API

**Rationale:**
- No unnecessary dependencies (no axios, etc.)
- Native fetch is modern and well-supported
- Vite proxy handles CORS in development
- Type safety via shared DTOs
- Simpler debugging with fewer abstractions

**Implementation Details:**
- Vite config proxies `/api/*` to `http://localhost:3000`
- API client uses native fetch with error handling
- Shared DTOs provide type safety across boundary
- Custom `ApiError` class for structured error handling

---

## [2026-02-10 16:40:03] Test Coverage Enforcement

**Decision:** Hard 80% thresholds in Jest and Vitest configs

**Rationale:**
- Enforces quality standards automatically
- Fails CI/CD if coverage drops below threshold
- Clear visibility of coverage gaps
- Configurable per package if needed
- Industry standard for production-ready code

**Implementation Details:**
- Jest config: `coverageThreshold.global` set to 80% for all metrics
- Vitest config: `coverage.thresholds` set to 80% for all metrics
- Excludes: test files, config files, type definitions, main entry points
- Coverage reports: text, JSON, HTML formats

---

## [2026-02-10 16:40:03] Testing Framework Selection

**Decision:** Jest for backend, Vitest for frontend

**Rationale:**
- Jest: Industry standard for NestJS, excellent mocking, mature ecosystem
- Vitest: Native Vite integration, faster than Jest, modern API
- Both support TypeScript out of the box
- Testing Library for React component testing
- Consistent testing patterns across packages

**Implementation Details:**
- Backend: Jest with ts-jest, @nestjs/testing utilities
- Frontend: Vitest with jsdom, @testing-library/react
- Both configured for coverage with v8 provider
- Shared test patterns: unit tests with mocked dependencies

---

## [2026-02-10 16:40:03] API Documentation Strategy

**Decision:** Swagger/OpenAPI with NestJS decorators

**Rationale:**
- Built-in NestJS support via @nestjs/swagger
- Auto-generated from code (single source of truth)
- Interactive documentation at `/docs`
- Supports DTO validation display
- Industry standard for REST APIs

**Implementation Details:**
- Swagger setup in `main.ts`
- `@ApiTags`, `@ApiOperation`, `@ApiResponse` decorators on controllers
- `@ApiProperty` decorators on DTOs
- Accessible at `http://localhost:3000/docs`

---

## [2026-02-10 16:40:03] Code Quality Tooling

**Decision:** ESLint + Prettier with consistent rules across packages

**Rationale:**
- ESLint catches code errors and enforces patterns
- Prettier ensures consistent formatting
- Separation of concerns (linting vs formatting)
- Shared configs at root level
- Pre-commit hooks possible (not implemented yet)

**Implementation Details:**
- Root `.eslintrc.js` with TypeScript parser
- Root `.prettierrc.js` with project standards
- Package-specific extends (e.g., react-hooks for frontend)
- Scripts: `npm run lint`, `npm run format`

---

## [2026-02-10 16:40:03] Validation Strategy

**Decision:** class-validator with NestJS ValidationPipe

**Rationale:**
- Decorator-based validation (clean, declarative)
- Integrates seamlessly with NestJS
- Automatic error responses with detailed messages
- Type-safe validation
- Supports complex validation rules

**Implementation Details:**
- Global ValidationPipe in `main.ts`
- DTOs use decorators: `@IsEmail()`, `@IsString()`, `@MinLength()`
- `whitelist: true` strips unknown properties
- `forbidNonWhitelisted: true` rejects unknown properties
- `transform: true` enables automatic type conversion
