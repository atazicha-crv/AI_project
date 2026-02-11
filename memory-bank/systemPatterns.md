# System Patterns

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2026-02-10 16:26:41 - Log of updates made.

---

## Coding Patterns

### [2026-02-10 16:38:10] DTO Pattern
- All data transfer between frontend/backend uses shared DTOs from `@shared` package
- DTOs are interfaces in shared package, classes with validation in backend
- Naming: `{Entity}Dto`, `Create{Entity}RequestDto`, `Update{Entity}RequestDto`
- Example: `UserDto`, `CreateUserRequestDto`

### [2026-02-10 16:38:10] Service Layer Pattern
- All business logic resides in services (not controllers)
- Controllers are thin, only handle HTTP concerns
- Services are injected via dependency injection
- Services use repositories for data access
- Example: `UsersService` handles user business logic

### [2026-02-10 16:38:10] Repository Pattern
- TypeORM repositories handle all database operations
- Injected via `@InjectRepository(Entity)`
- Services never access database directly
- Enables easy mocking in tests
- Example: `Repository<User>` in `UsersService`

### [2026-02-10 16:38:10] Custom Hook Pattern (Frontend)
- Complex state logic extracted to custom hooks
- Hooks handle data fetching, loading, error states
- Naming: `use{Feature}` (e.g., `useHealth`)
- Return object with: `{ data, loading, error, refetch }`
- Enables reusability and testability

### [2026-02-10 16:38:10] API Client Pattern (Frontend)
- Centralized API client in `api/client.ts`
- Generic `apiGet<T>()`, `apiPost<T>()` functions
- Custom `ApiError` class for structured errors
- Feature-specific API files (e.g., `health.api.ts`)
- Type safety via shared DTOs

---

## Architectural Patterns

### [2026-02-10 16:38:10] Module-Based Architecture (Backend)
- Each feature is a self-contained NestJS module
- Module structure: `{feature}/` directory containing:
  - `{feature}.module.ts` - Module definition
  - `{feature}.controller.ts` - HTTP endpoints
  - `{feature}.service.ts` - Business logic
  - `entities/` - TypeORM entities
  - `dto/` - Data transfer objects
  - `*.spec.ts` - Unit tests

### [2026-02-10 16:38:10] Component-Based Architecture (Frontend)
- React components organized by type:
  - `pages/` - Page-level components (routes)
  - `components/` - Reusable UI components
  - `hooks/` - Custom React hooks
  - `api/` - Backend communication
  - `styles/` - Global styles
- Each component co-located with its test file

### [2026-02-10 16:38:10] Layered Architecture
```
Frontend Layer (React)
    ↓ (HTTP/JSON via /api)
API Layer (NestJS Controllers)
    ↓ (Method calls)
Service Layer (Business Logic)
    ↓ (Repository pattern)
Data Layer (TypeORM + SQLite)
```

### [2026-02-10 16:38:10] Dependency Flow
- Shared package has no dependencies on frontend/backend
- Frontend and backend both depend on shared
- Build order: shared → backend → frontend
- Prevents circular dependencies

---

## Testing Patterns

### [2026-02-10 16:38:10] Unit Test Pattern (Backend)
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let repository: Repository<Entity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        { provide: getRepositoryToken(Entity), useValue: mockRepository }
      ]
    }).compile();
    
    service = module.get<ServiceName>(ServiceName);
    repository = module.get(getRepositoryToken(Entity));
  });

  it('should test behavior', async () => {
    jest.spyOn(repository, 'method').mockResolvedValue(mockData);
    const result = await service.method();
    expect(result).toEqual(expected);
  });
});
```

### [2026-02-10 16:38:10] Component Test Pattern (Frontend)
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    render(<ComponentName />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Result')).toBeInTheDocument();
  });
});
```

### [2026-02-10 16:38:10] Hook Test Pattern (Frontend)
```typescript
describe('useHookName', () => {
  it('should fetch data', async () => {
    vi.spyOn(api, 'getData').mockResolvedValue(mockData);
    const { result } = renderHook(() => useHookName());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.data).toEqual(mockData);
  });
});
```

### [2026-02-10 16:38:10] Mock Pattern
- Always mock external dependencies (database, HTTP, etc.)
- Use `jest.spyOn()` for method mocking
- Use `vi.spyOn()` for Vitest mocking
- Mock at the boundary (repository, API client)
- Never test implementation details

### [2026-02-10 16:38:10] Coverage Exclusions
Excluded from coverage:
- Entry points (`main.ts`, `main.tsx`)
- Module definitions (`*.module.ts`)
- Type definitions (`*.dto.ts`, `*.entity.ts`)
- Test files (`*.spec.ts`, `*.test.tsx`)
- Configuration files

---

## Error Handling Patterns

### [2026-02-10 16:38:10] Backend Error Pattern
- Use NestJS built-in exceptions: `NotFoundException`, `BadRequestException`
- ValidationPipe automatically throws `BadRequestException` for invalid DTOs
- Custom error messages in exception constructors
- Global exception filter (if needed) in `main.ts`

### [2026-02-10 16:38:10] Frontend Error Pattern
- Custom `ApiError` class with status code
- Try-catch in API client layer
- Error state in hooks: `{ data, loading, error }`
- Display errors in UI with user-friendly messages
- Distinguish between network errors and API errors

---

## Naming Conventions

### [2026-02-10 16:38:10] File Naming
- Components: `PascalCase.tsx` (e.g., `StatusCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useHealth.ts`)
- Services: `kebab-case.service.ts` (e.g., `users.service.ts`)
- Controllers: `kebab-case.controller.ts`
- Tests: Same as source with `.spec.ts` or `.test.tsx`

### [2026-02-10 16:38:10] Code Naming
- Interfaces: `PascalCase` with descriptive names
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Private methods: `camelCase` (no underscore prefix)

---

## Configuration Patterns

### [2026-02-10 16:38:10] Environment Variables
- Use `.env` files (gitignored)
- Provide `.env.example` templates
- Backend: Direct `process.env` access
- Frontend: `import.meta.env.VITE_*` prefix required
- Validate required env vars at startup

### [2026-02-10 16:38:10] TypeScript Configuration
- Strict mode enabled across all packages
- Shared base config: `tsconfig.base.json` (if needed)
- Package-specific configs extend base
- `skipLibCheck: true` for faster compilation
- `esModuleInterop: true` for better imports
