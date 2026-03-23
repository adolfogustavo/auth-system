# Auth System

[![Node.js](https://img.shields.io/badge/Node.js-24-339933.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Authentication system with OTP-based login and JWT tokens, built with hexagonal architecture.

## Features

- User registration with email
- OTP-based login (6-digit code sent to console)
- JWT token generation (HS256, 24h expiration)
- Rate limiting: 3 failed OTP attempts triggers 10-minute lockout
- OTP validity: 5 minutes

## Stack

- Node.js 24 / TypeScript 5.9
- Express 5
- MongoDB 7
- JSON Web Tokens (jsonwebtoken)
- Pino (structured logging)
- Jest (unit, integration, e2e)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register a new user with email |
| `POST` | `/auth/login` | Request OTP for registered email |
| `POST` | `/auth/verify` | Verify OTP and receive JWT |
| `GET` | `/health` | Health check |

### Request/Response Examples

**Register**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Response: 201 Created
# {"id": "uuid", "email": "user@example.com"}
```

**Login (Request OTP)**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Response: 200 OK
# {"message": "OTP sent"}
# Check server console for OTP: "OTP for user@example.com: 123456"
```

**Verify OTP**
```bash
curl -X POST http://localhost:3000/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "otp": "123456"}'

# Response: 200 OK
# {"token": "eyJhbGciOiJIUzI1NiIs..."}
```

## Architecture

```
src/
├── main.ts
├── auth/                        # Auth module
│   ├── domain/
│   │   ├── entities/            # User, OtpSession
│   │   ├── value-objects/       # Email, Otp, Token
│   │   ├── services/            # OtpGenerator
│   │   └── repositories/        # UserRepository, OtpSessionRepository
│   ├── application/
│   │   ├── RegisterUserUseCase.ts
│   │   ├── RequestOtpUseCase.ts
│   │   ├── VerifyOtpUseCase.ts
│   │   └── ports/               # OtpSender, TokenService
│   ├── infrastructure/
│   │   ├── adapters/            # Mongo repos, ConsoleOtpSender, JwtTokenService
│   │   └── http/                # AuthController
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── health/                      # Health check module
└── shared/
    ├── domain/                  # DomainError, Maybe, Id
    ├── application/ports/       # Logger
    └── infrastructure/          # Factory, server, adapters
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | - | Set to `development` for pretty logs |
| `MONGO_URI` | - | MongoDB connection string (required) |
| `JWT_SECRET` | - | Secret key for signing JWT tokens (required) |
| `LOG_LEVEL` | `info` | Pino log level |

## Quick Start

Prerequisites: Node.js 24+, MongoDB

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit .env and set MONGO_URI and JWT_SECRET

# Run (development)
npm start
```

## Docker

```bash
docker build -t auth-system .
cp .env.docker .env.docker.local
docker run --rm -p 3000:3000 --env-file .env.docker.local auth-system
```

If MongoDB is not running on your host machine:

```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Development server with hot reload |
| `npm test` | Run all tests |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run test:e2e` | E2E tests only |
| `npm run build` | Build for production |
| `npm run start:prod` | Run production build |

## Testing

Tests are colocated with each module:

```
module/tests/
├── unit/           # Domain + UseCase tests (InMemoryRepositories)
├── integration/    # Adapter tests (real MongoDB)
└── e2e/            # HTTP endpoint tests (full stack)
```

## Development Rules

Architecture and coding standards are defined in `.cursor/rules/`:

- Hexagonal architecture with vertical slicing
- TDD with inside-out approach
- No mocks policy (use InMemory implementations)
- Maybe instead of `| undefined`

## License

MIT
