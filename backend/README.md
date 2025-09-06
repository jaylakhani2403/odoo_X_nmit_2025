# Backend API - Odoo X NMIT

A robust Node.js/Express backend API with authentication, user management, and database integration.

## Features

- 🔐 JWT Authentication
- 👥 User Management
- 🛡️ Security Middleware (Helmet, CORS, Rate Limiting)
- 📊 Database Integration with Prisma
- ✅ Input Validation
- 📝 Request Logging
- 🚨 Error Handling
- 🔒 Password Hashing

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL/MySQL/SQLite with Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **Logging**: Morgan + Custom Logger

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp config.env .env
```

3. Update `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://username:password@localhost:5432/odoo_nmit?schema=public"
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
```

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Health Check
- `GET /health` - Server health status

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── prisma/
│   └── schema.prisma        # Database schema
├── routes/
│   ├── auth.js              # Authentication routes
│   └── users.js             # User routes
├── utils/
│   ├── logger.js            # Custom logger
│   └── response.js          # Response helpers
├── logs/                    # Log files
├── index.js                 # Main server file
├── package.json
└── config.env               # Environment variables
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| FRONTEND_URL | Frontend URL | http://localhost:3000 |
| DATABASE_URL | Database connection string | postgresql://username:password@localhost:5432/odoo_nmit |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| BCRYPT_ROUNDS | Password hashing rounds | 12 |

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Error handling without sensitive data exposure

## Development

The server runs on `http://localhost:5000` by default.

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests (placeholder)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

ISC
