# 📝 Full-Stack Todo List Applic### Step 2: Install Dependencies

**After Node.js is installed, run these commands:**

```bash
# Navigate to your project directory
cd "f:\to do"

# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ..\server
npm install

# Go back to root directory
cd ..
```

### Step 3: Environment Variablesrehensive, production-ready todo list application built with React, Node.js, and MongoDB. Features include task management, analytics dashboard, offline sync, responsive design, and complete DevOps setup.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **MongoDB** - [Local installation](https://www.mongodb.com/try/download/community) or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** - [Download from git-scm.com](https://git-scm.com/)
- **Docker** (optional) - [Download from docker.com](https://www.docker.com/)

### Step 1: Install Node.js

**Windows Users:**
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (Long Term Support)
3. Run the installer and follow the setup wizard
4. **Important**: Make sure to check "Add to PATH" during installation
5. Restart your terminal/PowerShell after installation

**Verify Installation:**
```bash
# Check Node.js version
node --version

# Check npm version  
npm --version
```

You should see version numbers like `v18.17.0` and `9.6.7`.

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

2. **Environment Variables**

Create `.env` files:

**Client (.env in /client):**
```env
VITE_API_URL=http://localhost:5000/api
```

**Server (.env in /server):**
```env
MONGODB_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
PORT=5000
```

### Step 4: Start Development Servers

**After setting up environment variables:**

```bash
# From root directory (f:\to do)
npm run dev
```

This starts both client (http://localhost:5173) and server (http://localhost:5000).

## 🛠️ Troubleshooting

### Common Issues

**1. "npm is not recognized" Error:**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart your terminal after installation
- Verify with `node --version` and `npm --version`

**2. "Cannot find module" Errors:**
- Make sure you ran `npm install` in all three directories (root, client, server)
- Delete `node_modules` folders and `package-lock.json` files, then reinstall

**3. Port Already in Use:**
- Kill existing processes using ports 5173 or 5000
- Or change ports in the configuration files

**4. MongoDB Connection Issues:**
- Make sure MongoDB is running locally, or
- Use MongoDB Atlas and update the connection string in `.env`

## 🛠️ Available Scripts

### Root Commands
- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm test` - Run tests for both client and server
- `npm run lint` - Lint both client and server code
- `npm run format` - Format code with Prettier

### Client Commands (in /client)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier

### Server Commands (in /server)
- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier

## 🏗️ Tech Stack

### Frontend
- **React 18** - Latest React with functional components and hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Chart.js** - Interactive analytics charts
- **React Context** - State management
- **IndexedDB** - Offline data storage
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Joi** - Data validation
- **Swagger** - API documentation

### DevOps & Testing
- **Docker** - Containerization
- **GitHub Actions** - CI/CD pipeline
- **Jest** - Testing framework
- **React Testing Library** - React component testing
- **Supertest** - API testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📱 Features

### DevOps & Testing
- Jest + React Testing Library (frontend)
- Jest + Supertest (backend)
- ESLint + Prettier
- Docker containerization
- GitHub Actions CI/CD

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- Git

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy example env files
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Update environment variables in `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

4. Update environment variables in `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Todo List App
```

### Development

Start both client and server in development mode:
```bash
npm run dev
```

This will start:
- Client: http://localhost:3000
- Server: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

### Individual Services

```bash
# Client only
npm run dev:client

# Server only  
npm run dev:server
```

### Building for Production

```bash
npm run build
```

### Testing

```bash
# Run all tests
npm test

# Test specific service
npm run test:client
npm run test:server
```

### Linting

```bash
npm run lint
```

### Docker Deployment

```bash
# Build and start containers
npm run docker:build
npm run docker:up

# Stop containers
npm run docker:down
```

## Project Structure

```
todo-list-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API calls and offline sync
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles
│   ├── tests/             # Frontend tests
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   ├── tests/             # Backend tests
│   └── package.json
├── docker-compose.yml     # Docker services
├── .github/               # GitHub Actions workflows
└── README.md
```

## API Documentation

Once the server is running, visit http://localhost:5000/api-docs for the complete API documentation.

### Main Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/analytics` - Get task analytics

## Environment Variables

### Server (.env)
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time

### Client (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
