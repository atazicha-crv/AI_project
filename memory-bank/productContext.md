# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2026-02-10 16:25:09 - Log of updates made will be appended as footnotes to the end of this file.

## Project Goal

Create a production-ready full-stack monorepo using Node.js + TypeScript with:
- **Frontend**: React (Vite) + TailwindCSS
- **Backend**: NestJS + SQLite + TypeORM
- **Shared**: TypeScript package for shared types/DTOs
- **Quality**: ESLint, Prettier, 80%+ test coverage, Swagger documentation

The deliverable must be fully functional with:
- `npm install` works at root
- `npm run build` compiles without errors
- `npm run test:cov` achieves ≥80% coverage
- Backend exposes Swagger at `/docs`
- Frontend displays a "Hello World" status page showing backend and database connectivity

## Key Features

### Infrastructure
- **Monorepo**: npm workspaces (frontend, backend, shared)
- **TypeScript**: Strict typing across all packages
- **Testing**: Vitest (frontend) + Jest (backend) with 80% minimum coverage
- **Code Quality**: ESLint + Prettier with consistent rules
- **Environment**: .env configuration with examples

### Frontend Features
- Status/Health page displaying:
  - Frontend status: OK
  - Backend connectivity: OK/KO
  - Database connectivity: OK/KO
  - Error messages when applicable
- Vite proxy configuration for `/api/*` → `http://localhost:3000`
- TailwindCSS for styling
- Architecture: api/, components/, hooks/, pages/, styles/

### Backend Features
- **Health Endpoint** (`GET /health`):
  - Real SQLite connection test
  - Typed response via shared package
  - Returns: api status, db status, timestamp, message
- **Users CRUD** (example implementation):
  - Entity: id (uuid), email, name, createdAt
  - Endpoints: GET /users, POST /users, GET /users/:id
  - DTOs with class-validator validation
  - Swagger documentation
- **Architecture**: config/, database/, health/, users/ modules
- **Error Handling**: Proper HTTP exceptions
- **CORS**: Configured for frontend dev environment
- **Logging**: NestJS Logger

### Shared Package
- TypeScript package consumed by frontend and backend
- Exports: HealthResponseDto, UserDto, CreateUserRequestDto
- Proper build configuration for workspace consumption

## Overall Architecture

```
/
├── frontend/              # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── api/          # Backend communication
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── styles/       # Global styles
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── vitest.config.ts
│
├── backend/               # NestJS + SQLite + TypeORM
│   ├── src/
│   │   ├── config/       # Configuration modules
│   │   ├── database/     # Database setup
│   │   ├── health/       # Health check module
│   │   ├── users/        # Users CRUD module
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── data/             # SQLite database files
│   ├── package.json
│   └── jest.config.js
│
├── shared/                # Shared TypeScript types
│   ├── src/
│   │   ├── dtos/         # Data Transfer Objects
│   │   └── index.ts      # Exports
│   ├── package.json
│   └── tsconfig.json
│
├── package.json           # Root workspace config
├── .gitignore
└── README.md
```

### Technology Stack
- **Runtime**: Node.js + TypeScript
- **Frontend**: React 18+, Vite, TailwindCSS, Vitest, Testing Library
- **Backend**: NestJS, TypeORM, SQLite, Jest, Swagger
- **Monorepo**: npm workspaces
- **Quality**: ESLint, Prettier, class-validator

### Development Workflow
- **Ports**: Frontend (5173), Backend (3000)
- **Database**: SQLite file at `backend/data/dev.sqlite`
- **API Proxy**: Vite proxies `/api/*` to backend
- **Scripts**: Concurrent dev mode, unified build, test, lint

---

2026-02-10 16:32:07 - Initial project specification captured from user requirements
