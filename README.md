# Iwacu Backend

Iwacu is a Rwandan civic engagement platform backend built with NestJS, Prisma, and PostgreSQL. It enables citizens to authenticate via National ID, discover government leaders, receive location-specific announcements, submit service requests, and register visitors for community safety.

## Features

- **National ID Authentication**: Secure authentication without passwords
- **Location Hierarchy**: Rwanda's five-level administrative structure (Province → District → Sector → Cell → Village)
- **Hierarchical Announcements**: Citizens receive announcements from their location up through their province
- **Service Requests**: Citizens can submit complaints and track resolution status
- **Leader Management**: Government officials can post announcements and manage their jurisdiction
- **Visitor Registration**: Community safety tracking for visitor check-in/check-out
- **Geolocation Detection**: GPS-based location detection for citizens

## Prerequisites

- Bun 1.0+
- PostgreSQL 15+

## Installation

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials and JWT secret

4. Run database migrations:
```bash
bun run prisma:migrate
```

5. Seed the database (optional):
```bash
bun run prisma:seed
```

## Running the Application

### Development
```bash
bun run start:dev
```

### Production
```bash
bun run build
bun run start:prod
```

## Database

### Migrations
```bash
# Create a new migration
bun run prisma:migrate

# Apply migrations
bun run prisma:migrate:deploy

# View database in Prisma Studio
bun run prisma:studio
```

### Seeding
```bash
bun run prisma:seed
```

## Testing

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Generate coverage report
bun run test:cov
```

## Code Quality

```bash
# Lint code
bun run lint

# Format code
bun run format
```

## API Documentation

Once the application is running, visit `http://localhost:3000/api/docs` to view the Swagger API documentation.

## Project Structure

```
src/
├── config/              # Configuration files
├── modules/             # Feature modules
│   ├── auth/           # Authentication module
│   ├── citizens/       # Citizens module
│   ├── locations/      # Locations module
│   ├── leaders/        # Leaders module
│   ├── announcements/  # Announcements module
│   ├── services/       # Services module
│   └── visitors/       # Visitor registration module
├── common/             # Shared utilities
│   ├── guards/         # Authentication/authorization guards
│   ├── filters/        # Exception filters
│   ├── pipes/          # Validation pipes
│   ├── decorators/     # Custom decorators
│   ├── validators/     # Custom validators
│   └── dto/            # Common DTOs
├── prisma/             # Prisma service
├── utils/              # Utility functions
└── main.ts             # Application entry point
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for signing JWT tokens (minimum 32 characters)
- `JWT_EXPIRY`: Access token expiration time (e.g., 15m)
- `REFRESH_TOKEN_EXPIRY`: Refresh token expiration time (e.g., 7d)
- `PORT`: API server port (default: 3000)
- `NODE_ENV`: Environment (development, testing, production)

## License

MIT
