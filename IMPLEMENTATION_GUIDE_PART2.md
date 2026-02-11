# Implementation Guide - Part 2 (Backend Tests & Frontend)

## Step 4 (continued): Backend Tests & Service

#### 4.13 backend/src/users/users.service.ts
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = this.usersRepository.create(createUserDto);
    const saved = await this.usersRepository.save(user);
    return this.toDto(saved);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => this.toDto(user));
  }

  async findOne(id: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user ? this.toDto(user) : null;
  }

  private toDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
```

#### 4.14 backend/src/users/users.controller.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockUser);

      const result = await controller.create(createDto);
      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([mockUser]);

      const result = await controller.findAll();
      expect(result).toEqual([mockUser]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockUser);

      const result = await controller.findOne('123');
      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });
});
```

#### 4.15 backend/src/users/users.service.spec.ts
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser: User = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a user', async () => {
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      jest.spyOn(repository, 'create').mockReturnValue(mockUser);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: '2024-01-01T00:00:00.000Z',
      });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('test@example.com');
      expect(repository.find).toHaveBeenCalled();
    });

    it('should return empty array when no users', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findOne('123');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '123' } });
    });

    it('should return null when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.findOne('999');

      expect(result).toBeNull();
    });
  });
});
```

### Step 5: Frontend Package Configuration (8 files)

#### 5.1 frontend/package.json
```json
{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@shared": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.2.0",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitest/coverage-v8": "^1.2.0",
    "autoprefixer": "^10.4.17",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "jsdom": "^23.2.0",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12",
    "vitest": "^1.2.0"
  }
}
```

#### 5.2 frontend/tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### 5.3 frontend/tsconfig.node.json
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

#### 5.4 frontend/vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
});
```

#### 5.5 frontend/vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        '**/*.test.{ts,tsx}',
        '**/test/**',
        'vite.config.ts',
        'vitest.config.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

#### 5.6 frontend/tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### 5.7 frontend/postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### 5.8 frontend/.env.example
```env
VITE_API_URL=/api
```

### Step 6: Frontend Source Code (13 files)

#### 6.1 frontend/index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Full-Stack Monorepo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### 6.2 frontend/src/vite-env.d.ts
```typescript
/// <reference types="vite/client" />
```

#### 6.3 frontend/src/main.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

#### 6.4 frontend/src/App.tsx
```typescript
import StatusPage from './pages/StatusPage';

function App() {
  return <StatusPage />;
}

export default App;
```

#### 6.5 frontend/src/styles/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}
```

#### 6.6 frontend/src/test/setup.ts
```typescript
import '@testing-library/jest-dom';
```

#### 6.7 frontend/src/api/client.ts
```typescript
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error: Unable to reach backend', 0);
  }
}
```

#### 6.8 frontend/src/api/health.api.ts
```typescript
import { HealthResponseDto } from '@shared';
import { apiGet } from './client';

export async function getHealth(): Promise<HealthResponseDto> {
  return apiGet<HealthResponseDto>('/health');
}
```

#### 6.9 frontend/src/hooks/useHealth.ts
```typescript
import { useState, useEffect, useCallback } from 'react';
import { HealthResponseDto } from '@shared';
import { getHealth } from '../api/health.api';

interface UseHealthResult {
  data: HealthResponseDto | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHealth(): UseHealthResult {
  const [data, setData] = useState<HealthResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getHealth();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return { data, loading, error, refetch: fetchHealth };
}
```

#### 6.10 frontend/src/hooks/useHealth.test.ts
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useHealth } from './useHealth';
import * as healthApi from '../api/health.api';

vi.mock('../api/health.api');

describe('useHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch health data on mount', async () => {
    const mockData = {
      ok: true,
      api: { ok: true },
      db: { ok: true },
      message: 'All systems operational',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockData);

    const { result } = renderHook(() => useHealth());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    const mockError = new Error('Network error');
    vi.spyOn(healthApi, 'getHealth').mockRejectedValue(mockError);

    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('should refetch when refetch is called', async () => {
    const mockData = {
      ok: true,
      api: { ok: true },
      db: { ok: true },
      message: 'All systems operational',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    const getHealthSpy = vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockData);

    const { result } = renderHook(() => useHealth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getHealthSpy).toHaveBeenCalledTimes(1);

    result.current.refetch();

    await waitFor(() => {
      expect(getHealthSpy).toHaveBeenCalledTimes(2);
    });
  });
});
```

#### 6.11 frontend/src/components/StatusCard.tsx
```typescript
interface StatusCardProps {
  title: string;
  status: 'ok' | 'error' | 'loading';
  message?: string;
}

export default function StatusCard({ title, status, message }: StatusCardProps) {
  const statusColors = {
    ok: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    loading: 'bg-gray-100 border-gray-500 text-gray-800',
  };

  const statusIcons = {
    ok: '✓',
    error: '✗',
    loading: '⟳',
  };

  return (
    <div className={`border-l-4 p-4 rounded ${statusColors[status]}`}>
      <div className="flex items-center">
        <span className="text-2xl mr-3">{statusIcons[status]}</span>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
      </div>
    </div>
  );
}
```

#### 6.12 frontend/src/components/StatusCard.test.tsx
```typescript
import { render, screen } from '@testing-library/react';
import StatusCard from './StatusCard';

describe('StatusCard', () => {
  it('should render OK status', () => {
    render(<StatusCard title="Test Service" status="ok" message="All good" />);

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('All good')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should render error status', () => {
    render(<StatusCard title="Test Service" status="error" message="Error occurred" />);

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('should render loading status', () => {
    render(<StatusCard title="Test Service" status="loading" />);

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('⟳')).toBeInTheDocument();
  });

  it('should render without message', () => {
    render(<StatusCard title="Test Service" status="ok" />);

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.queryByText('All good')).not.toBeInTheDocument();
  });
});
```

#### 6.13 frontend/src/pages/StatusPage.tsx
```typescript
import { useHealth } from '../hooks/useHealth';
import StatusCard from '../components/StatusCard';

export default function StatusPage() {
  const { data, loading, error } = useHealth();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          System Status Dashboard
        </h1>

        <div className="space-y-4">
          {/* Frontend Status */}
          <StatusCard title="Frontend" status="ok" message="React application running" />

          {/* Backend Status */}
          {loading && <StatusCard title="Backend" status="loading" message="Checking..." />}

          {error && (
            <StatusCard
              title="Backend"
              status="error"
              message={`Unable to connect: ${error.message}`}
            />
          )}

          {data && !error && (
            <StatusCard
              title="Backend"
              status={data.api.ok ? 'ok' : 'error'}
              message={data.api.ok ? 'API responding' : 'API error'}
            />
          )}

          {/* Database Status */}
          {loading && <StatusCard title="Database" status="loading" message="Checking..." />}

          {error && (
            <StatusCard
              title="Database"
              status="error"
              message="Cannot check database (backend unreachable)"
            />
          )}

          {data && !error && (
            <StatusCard
              title="Database"
              status={data.db.ok ? 'ok' : 'error'}
              message={data.db.ok ? 'SQLite connected' : `Error: ${data.db.error}`}
            />
          )}
        </div>

        {/* Overall Status Message */}
        {data && (
          <div className="mt-8 text-center">
            <p className="text-lg text-gray-700">
              <strong>Status:</strong> {data.message}
            </p>
            <p className="text-sm text-gray-500 mt-2">Last checked: {data.timestamp}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 6.14 frontend/src/pages/StatusPage.test.tsx
```typescript
import { render, screen } from '@testing-library/react';
import StatusPage from './StatusPage';
import * as useHealthHook from '../hooks/useHealth';

vi.mock('../hooks/useHealth');

describe('StatusPage', () => {
  it('should render loading state', () => {
    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<StatusPage />);

    expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getAllByText('Checking...').length).toBeGreaterThan(0);
  });

  it('should render error state when backend is down', () => {
    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Network error'),
      refetch: vi.fn(),
    });

    render(<StatusPage />);

    expect(screen.getByText(/Unable to connect/)).toBeInTheDocument();
    expect(screen.getByText(/Cannot check database/)).toBeInTheDocument();
  });

  it('should render success state when all systems operational', () => {
    const mockData = {
      ok: true,
      api: { ok: true },
      db: { ok: true },
      message: 'All systems operational',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StatusPage />);

    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('All systems operational')).toBeInTheDocument();
    expect(screen.getByText('SQLite connected')).toBeInTheDocument();
  });

  it('should render database error when DB fails', () => {
    const mockData = {
      ok: false,
      api: { ok: true },
      db: { ok: false, error: 'Connection timeout' },
      message: 'Database connection failed',
      timestamp: '2024-01-01T00:00:00.000Z',
    };

    vi.spyOn(useHealthHook, 'useHealth').mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<StatusPage />);

    expect(screen.getByText(/Error: Connection timeout/)).toBeInTheDocument();
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();
  });
});
```

### Step 7: Documentation

#### 7.1 README.md
```markdown
# Full-Stack Monorepo - Production Ready

A production-ready full-stack monorepo built with Node.js, TypeScript, React, NestJS, and SQLite.

## 🏗️ Architecture

This project uses **npm workspaces** to manage three packages:

- **frontend**: React + Vite + TailwindCSS
- **backend**: NestJS + TypeORM + SQLite
- **shared**: Shared TypeScript types and DTOs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
npm install
```

### Development

Start both frontend and backend in development mode:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Swagger Docs: http://localhost:3000/docs

### Build

Build all packages:

```bash
npm run build
```

Build order: `shared` → `backend` → `frontend`

### Testing

Run all tests:

```bash
npm test
```

Run tests with coverage (≥80% required):

```bash
npm run test:cov
```

### Code Quality

```bash
# Lint all packages
npm run lint

# Format all files
npm run format

# Type check all packages
npm run typecheck
```

## 📁 Project Structure

```
/
├── frontend/          # React application
├── backend/           # NestJS API
├── shared/            # Shared TypeScript types
└── package.json       # Root workspace config
```

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Vitest** - Testing framework
- **Testing Library** - Component testing

### Backend
- **NestJS** - Node.js framework
- **TypeORM** - ORM
- **SQLite** - Database
- **Swagger** - API documentation
- **Jest** - Testing framework
- **class-validator** - DTO validation

### Shared
- **TypeScript** - Type definitions

## 📡 API Endpoints

### Health Check
- `GET /health` - System health status

### Users
- `GET /users` - List all users
- `POST /users` - Create a user
- `GET /users/:id` - Get user by ID

Full API documentation available at http://localhost:3000/docs

## 🧪 Testing Strategy

### Backend (Jest)
- Unit tests for services and controllers
- Mocked dependencies
- Coverage threshold: 80%

### Frontend (Vitest)
- Component tests
- Hook tests
- Mocked API calls
- Coverage threshold: 80%

## ⚙️ Configuration

### Environment Variables

**Backend** (`.env