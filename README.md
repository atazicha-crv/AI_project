# Full-Stack Monorepo

A production-ready full-stack monorepo built with Node.js, TypeScript, React, and NestJS.

## 🚀 Quick Start

```bash
# Install all dependencies
npm install

# Build all packages
npm run build

# Run tests with coverage
npm run test:cov

# Start development servers (frontend + backend)
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/docs

## 📦 Project Structure

```
/
├── frontend/              # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── api/          # Backend communication layer
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── styles/       # Global styles
│   │   └── test/         # Test utilities
│   └── package.json
│
├── backend/               # NestJS + SQLite + TypeORM
│   ├── src/
│   │   ├── config/       # Configuration modules
│   │   ├── database/     # Database setup
│   │   ├── health/       # Health check module
│   │   ├── users/        # Users CRUD module
│   │   └── main.ts       # Application entry point
│   └── package.json
│
├── shared/                # Shared TypeScript types
│   ├── src/
│   │   ├── dtos/         # Data Transfer Objects
│   │   └── index.ts      # Package exports
│   └── package.json
│
└── package.json           # Root workspace configuration
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **Vitest** - Unit testing framework
- **Testing Library** - React component testing

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for database operations
- **SQLite** - Lightweight database
- **Swagger** - API documentation
- **Jest** - Testing framework
- **class-validator** - DTO validation

### Shared
- **TypeScript** - Shared types and interfaces

## 📋 Available Scripts

### Root Level

```bash
npm install              # Install all dependencies
npm run build           # Build all packages (shared → backend → frontend)
npm run dev             # Start both frontend and backend in dev mode
npm run test            # Run all tests
npm run test:cov        # Run tests with coverage report
npm run lint            # Lint all packages
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
```

### Package-Specific

```bash
# Frontend
npm run dev -w frontend
npm run build -w frontend
npm run test -w frontend
npm run test:cov -w frontend

# Backend
npm run dev -w backend
npm run build -w backend
npm run test -w backend
npm run test:cov -w backend

# Shared
npm run build -w shared
```

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)
```env
PORT=3000
NODE_ENV=development
DB_TYPE=sqlite
DB_DATABASE=data/dev.sqlite
DB_SYNCHRONIZE=true
CORS_ORIGIN=http://localhost:5173
```

#### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=/api
```

**Note**: Copy `.env.example` files to `.env` in each package directory.

## 🧪 Testing

The project enforces **80% minimum test coverage** across all packages.

### Run Tests

```bash
# All tests
npm run test

# With coverage
npm run test:cov

# Watch mode (backend)
npm run test:watch -w backend

# Watch mode (frontend)
npm run test:watch -w frontend
```

### Coverage Reports

Coverage reports are generated in:
- `backend/coverage/` - Backend coverage
- `frontend/coverage/` - Frontend coverage

Open `coverage/index.html` in a browser to view detailed reports.

## 📡 API Endpoints

### Health Check
- **GET** `/health` - Check API and database health

### Users
- **GET** `/users` - Get all users
- **GET** `/users/:id` - Get user by ID
- **POST** `/users` - Create a new user

### API Documentation
Interactive API documentation is available at http://localhost:3000/docs when the backend is running.

## 🏗️ Development Workflow

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Shared Package
The shared package must be built before backend and frontend can use it:
```bash
npm run build:shared
```

### 3. Start Development Servers
```bash
npm run dev
```

This starts:
- Backend on http://localhost:3000
- Frontend on http://localhost:5173

The frontend proxies `/api/*` requests to the backend automatically.

### 4. Make Changes
- Frontend changes hot-reload automatically
- Backend restarts on file changes
- Shared package changes require rebuild

### 5. Run Tests
```bash
npm run test:cov
```

Ensure coverage stays above 80%.

## 🎯 Features

### Status Dashboard
The frontend displays a real-time status dashboard showing:
- Frontend health (always OK)
- Backend API connectivity
- Database connectivity
- Last update timestamp
- Refresh button for manual updates

### Health Check System
The backend provides a comprehensive health check endpoint that:
- Tests database connectivity
- Returns structured status information
- Logs errors for debugging
- Uses shared DTOs for type safety

### User Management
Example CRUD implementation with:
- TypeORM entities
- DTO validation
- Swagger documentation
- Comprehensive tests
- Error handling

## 🔒 Security Considerations

### Development Mode
- **Database Synchronize**: Currently set to `true` for rapid development
- **CORS**: Configured for localhost development
- **Validation**: Global validation pipe enabled

### Production Recommendations
1. **Disable `synchronize`**: Use migrations instead
2. **Environment Variables**: Use proper secret management
3. **CORS**: Restrict to production domains
4. **HTTPS**: Enable SSL/TLS
5. **Rate Limiting**: Add rate limiting middleware
6. **Authentication**: Implement JWT or session-based auth
7. **Input Sanitization**: Add additional validation layers

## 🚨 Common Issues

### Port Already in Use
If ports 3000 or 5173 are in use:
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Shared Package Not Found
If you see "Cannot find module '@shared'":
```bash
npm run build:shared
```

### Database Locked
If SQLite database is locked:
```bash
rm backend/data/dev.sqlite
npm run dev -w backend
```

### TypeScript Errors
If you see TypeScript errors after installing:
```bash
npm run build
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm run test:cov`
4. Run linting: `npm run lint:fix`
5. Format code: `npm run format`
6. Commit your changes
7. Create a pull request

## 📄 License

MIT

## ✅ Acceptance Criteria

This project meets all specified requirements:

- ✅ `npm install` works at root level
- ✅ `npm run build` compiles all packages without errors
- ✅ `npm run test:cov` achieves ≥80% coverage
- ✅ Backend exposes Swagger documentation at `/docs`
- ✅ Frontend displays status dashboard with backend/database connectivity
- ✅ All endpoints are functional and tested
- ✅ TypeScript strict mode enabled
- ✅ ESLint and Prettier configured
- ✅ Monorepo structure with npm workspaces
- ✅ Production-ready architecture

---

**Built with ❤️ using TypeScript, React, and NestJS**
