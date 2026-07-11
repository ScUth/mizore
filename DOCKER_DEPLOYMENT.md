# Docker Deployment Guide for Mizore

This guide covers deploying the Mizore project (Next.js frontend + Fastify backend + PostgreSQL) using Docker.

## Prerequisites

- Docker installed ([Docker Desktop](https://www.docker.com/products/docker-desktop) or Docker Engine)
- Docker Compose installed (usually included with Docker Desktop)

## Quick Start

### 1. Setup Environment Variables

Copy and configure the environment file:

```bash
cp .env.example .env
```

Edit `.env` and update the database credentials and other settings:

```env
DB_USER=postgres
DB_PASSWORD=your_secure_password_here
DB_HOST=postgres
DB_NAME=mizore
DB_PORT=5432
```

### 2. Build and Run with Docker Compose

```bash
# Build all images
docker-compose build

# Start all services
docker-compose up -d
```

### 3. Access Your Applications

- **Frontend (Next.js):** http://localhost:3000
- **Backend (Fastify):** http://localhost:4000
- **PostgreSQL:** localhost:5432

## Common Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f frontend     # Frontend logs
docker-compose logs -f backend      # Backend logs
docker-compose logs -f postgres     # Database logs

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose up backend -d

# Restart a service
docker-compose restart frontend
```

## Production Deployment

### Using Docker Hub / Container Registry

1. **Build and Tag Images:**
```bash
docker build -t your-registry/mizore-frontend:1.0 ./nextjs
docker build -t your-registry/mizore-backend:1.0 ./node_fastify
```

2. **Push to Registry:**
```bash
docker push your-registry/mizore-frontend:1.0
docker push your-registry/mizore-backend:1.0
```

3. **Update `docker-compose.yml`** to use the registry images instead of local builds.

### Deployment Platforms

#### AWS (ECS)
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

docker tag mizore-frontend:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/mizore-frontend:latest
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/mizore-frontend:latest
```

#### DigitalOcean / Heroku / Railway
Use their Docker deployment guides and reference these images in their platform-specific configuration files.

#### Docker Swarm / Kubernetes
For Kubernetes, you'll need:
- Deployment manifests
- Service manifests
- ConfigMaps for environment variables
- Secrets for sensitive data

Example: See `k8s/` folder for sample manifests (if deploying to Kubernetes).

## Environment Configuration

Key environment variables:

**Backend (node_fastify):**
- `HOST`: Server host (0.0.0.0 for Docker)
- `DB_USER`: PostgreSQL user
- `DB_PASSWORD`: PostgreSQL password
- `DB_HOST`: PostgreSQL hostname (use `postgres` in docker-compose)
- `DB_NAME`: Database name
- `DB_PORT`: PostgreSQL port (5432)

**Frontend (nextjs):**
- `NEXT_PUBLIC_API_URL`: Backend API URL (http://localhost:3001 for local, your domain for production)

## Database Migrations

If you have database migrations, run them before starting the app:

```bash
# Execute migration script in the backend container
docker-compose exec backend node scripts/migrate.js
```

## Health Checks

The `docker-compose.yml` includes health checks for PostgreSQL. The backend will wait for PostgreSQL to be healthy before starting.

## Troubleshooting

**Container won't start:**
```bash
docker-compose logs <service-name>
```

**Port already in use:**
```bash
# Change ports in docker-compose.yml or kill the process
lsof -ti:3000 | xargs kill -9
```

**Database connection issues:**
- Ensure `DB_HOST=postgres` (the service name in docker-compose)
- Check that PostgreSQL is healthy: `docker-compose ps`

**Next.js build fails:**
- Ensure `next.config.ts` is properly configured
- Check for TypeScript errors: `npm run build` locally first

## Optimization Tips

- Use multi-stage builds (already implemented in nextjs/Dockerfile)
- Minimize image layers
- Use `.dockerignore` to exclude unnecessary files
- Consider using Alpine Linux images for smaller sizes
- Implement proper health checks
- Use environment-specific configurations

## Next Steps

1. Test locally with `docker-compose up`
2. Set up a CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
3. Configure automatic deployments to your hosting platform
4. Set up monitoring and logging
