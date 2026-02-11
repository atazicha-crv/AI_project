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
├── frontend/          # React application (port 5173)
│   ├── src/
│   │   ├── api/      # Backend communication layer
│   │   ├── components/ # React components
│   │   ├── hooks/    # Custom React hooks
│   │   ├── pages/    # Page components
│   │   └── styles/   # Global styles + Tailwind
│   └── package.json
│
├── backend/           # NestJS API (port 3000)
│   ├── src/
│   │   ├── health/   # Health check module
│   │   ├── users/    # Users CRUD module
│   │   └── config/   # Configuration
│   ├── data/         # SQLite database files
│   └── package.json
│
├── shared/            # Shared TypeScript types
│   ├── src/dtos/     # Data Transfer Objects
│   └── package.json
│
└── package.json       # Root workspace config
```

## 🔧 Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Vitest** - Testing framework
- **Testing Library** - Component testing utilities

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for TypeScript
- **SQLite** - Embedded database
- **Swagger** - API documentation
- **Jest** - Testing framework
- **class-validator** - DTO validation

### Shared
- **TypeScript** - Shared type definitions and DTOs

## 📡 API Endpoints

### Health Check
- `GET /health` - System health status (API + Database)

### Users
- `GET /users` - List all users
- `POST /users` - Create a new user
  - Body: `{ "email": "user@example.com", "name": "John Doe" }`
- `GET /users/:id` - Get user by ID

Full API documentation available at http://localhost:3000/docs

## 🧪 Testing Strategy

### Backend (Jest)
- Unit tests for services and controllers
- Mocked TypeORM repositories
- Coverage threshold: 80%
- Run: `npm run test:cov -w backend`

### Frontend (Vitest)
- Component tests with Testing Library
- Hook tests with renderHook
- Mocked API calls
- Coverage threshold: 80%
- Run: `npm run test:cov -w frontend`

## ⚙️ Configuration

### Environment Variables

**Backend** (`.env`):
```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=data/dev.sqlite
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`.env`):
```env
VITE_API_URL=/api
```

See `.env.example` files in each package for templates.

### Database

SQLite database is stored at `backend/data/dev.sqlite`.

**⚠️ Important**: The backend uses `synchronize: true` in development for automatic schema updates. This is **NOT recommended for production**. Use TypeORM migrations in production environments.

### Vite Proxy

The frontend uses Vite's proxy feature to forward `/api/*` requests to the backend during development, avoiding CORS issues.

## 🎯 Features

### Status Dashboard
The frontend displays a real-time status dashboard showing:
- ✅ Frontend status (always OK if page loads)
- ✅ Backend API connectivity
- ✅ Database connectivity with real SQLite connection test
- ❌ Error messages when services are unavailable

### User Management
Basic CRUD operations for users with:
- Email validation
- Name validation (minimum 2 characters)
- UUID primary keys
- Automatic timestamps
- Swagger documentation

## 📝 Development Workflow

### Adding a New Feature

1. **Define shared types** in `shared/src/dtos/`
2. **Build shared package**: `npm run build -w shared`
3. **Implement backend**:
   - Create entity in `backend/src/{module}/entities/`
   - Create DTOs in `backend/src/{module}/dto/`
   - Create service with business logic
   - Create controller with endpoints
   - Add Swagger decorators
   - Write tests
4. **Implement frontend**:
   - Create API client in `frontend/src/api/`
   - Create custom hook if needed
   - Create components
   - Write tests
5. **Run tests**: `npm run test:cov`
6. **Lint and format**: `npm run lint && npm run format`

### Code Quality Standards

- **ESLint**: Enforces code style and catches errors
- **Prettier**: Ensures consistent formatting
- **TypeScript**: Strict mode enabled
- **Test Coverage**: Minimum 80% on all packages
- **Validation**: All API inputs validated with class-validator

## 🚨 Common Issues

### Port Already in Use
If ports 3000 or 5173 are in use:
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Locked
If SQLite database is locked:
```bash
rm backend/data/dev.sqlite
# Restart backend - database will be recreated
```

### Workspace Dependencies Not Found
If `@shared` imports fail:
```bash
# Rebuild shared package
npm run build -w shared

# Clean install
rm -rf node_modules package-lock.json
rm -rf */node_modules
npm install
```

## 🔐 Security Considerations

### Development
- CORS enabled for localhost:5173
- Validation pipes enabled globally
- Input sanitization via class-validator

### Production Recommendations
- Use environment-specific configuration
- Enable HTTPS
- Implement authentication/authorization
- Use database migrations instead of synchronize
- Add rate limiting
- Implement proper logging and monitoring
- Use secrets management for sensitive data

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass: `npm run test:cov`
4. Ensure linting passes: `npm run lint`
5. Format code: `npm run format`
6. Submit a pull request

## 📄 License

MIT

## 🎓 Learning Notes

### Why npm Workspaces?
- Native to npm (no additional tools)
- Simple workspace protocol
- Good IDE support
- Sufficient for monorepo of this size

### Why SQLite?
- Zero configuration
- Perfect for development
- File-based (easy to reset)
- Can be replaced with PostgreSQL/MySQL in production

### Why Vite?
- Fast HMR (Hot Module Replacement)
- Modern build tool
- Great TypeScript support
- Simple proxy configuration

### Why NestJS?
- Enterprise-grade architecture
- Built-in dependency injection
- Excellent TypeScript support
- Swagger integration
- Similar to Angular (familiar patterns)

## 🔄 Migration to Production

When moving to production, consider:

1. **Database**: Migrate from SQLite to PostgreSQL/MySQL
2. **Migrations**: Use TypeORM migrations instead of `synchronize: true`
3. **Environment**: Use proper environment variable management
4. **Build**: Optimize build for production
5. **Deployment**: Use Docker containers
6. **Monitoring**: Add logging, metrics, and error tracking
7. **Security**: Implement authentication, rate limiting, HTTPS
8. **CI/CD**: Set up automated testing and deployment

Example production database config:
```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: false, // NEVER true in production
  migrations: ['dist/migrations/*.js'],
  ssl: { rejectUnauthorized: false },
})
```
