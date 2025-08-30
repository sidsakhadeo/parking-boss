# Parking Boss

A modern parking reservation management system built with Next.js 15, React Query, and TypeScript. Manage vehicle reservations, track usage statistics, and monitor current parking assignments through an intuitive web interface.

## Features

- 🚗 **Vehicle Management** - Browse and search through available vehicles
- 📅 **Reservation System** - Create and cancel parking reservations
- 📊 **Usage Statistics** - Monitor weekly and monthly parking usage
- 🔄 **Real-time Updates** - Live data synchronization with React Query
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🐳 **Docker Ready** - Containerized for easy deployment
- 🔒 **Type Safety** - Full TypeScript coverage

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Frontend**: React 19, TypeScript
- **State Management**: @tanstack/react-query
- **Styling**: Tailwind CSS v4
- **Build Tool**: Turbopack
- **Linting**: Biome
- **Runtime**: Node.js 22
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm or yarn
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd parking-boss
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   Ensure the `db/` directory contains:
   - `vehicles.json` - Vehicle database
   - `config.json` - API configuration

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

## Docker Deployment

### Quick Start with Docker Compose

1. **Development**
   ```bash
   docker-compose up --build
   ```

2. **Production**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Manual Docker Commands

```bash
# Build the image
docker build -t parking-boss .

# Run with volume mount
docker run -p 3000:3000 -v $(pwd)/db:/app/db parking-boss
```

### Docker Compose Files

- `docker-compose.yml` - Main configuration
- `docker-compose.override.yml` - Development overrides (auto-loaded)
- `docker-compose.prod.yml` - Production overrides

## API Endpoints

### Vehicles
- `GET /api/vehicles` - Get all vehicles (loaded from `db/vehicles.json`)

### Reservations
- `POST /api/reservation` - Create a new reservation
- `DELETE /api/reservation` - Cancel a reservation
- `GET /api/reservations` - Get current reservations

### Usage
- `GET /api/usage` - Get usage statistics (weekly/monthly)

## Project Structure

```
parking-boss/
├── app/
│   ├── api/                    # API routes
│   │   ├── reservation/        # Reservation endpoints
│   │   ├── reservations/       # List reservations
│   │   └── usage/              # Usage statistics
│   ├── components/             # React components
│   │   ├── CurrentReservation.tsx
│   │   ├── CurrentReservations.tsx
│   │   ├── HomeClient.tsx
│   │   ├── Usage.tsx
│   │   ├── Vehicle.tsx
│   │   └── VehicleList.tsx
│   ├── providers/              # Context providers
│   │   └── QueryProvider.tsx   # React Query setup
│   ├── utils/                  # Utility functions
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── db/                         # Database files (mounted as volume)
│   ├── vehicles.json           # Vehicle data
│   └── config.json             # API configuration
├── public/                     # Static assets
├── docker-compose.yml          # Main Docker Compose config
├── docker-compose.override.yml # Development overrides
├── docker-compose.prod.yml     # Production overrides
├── Dockerfile                  # Container definition
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── package.json                # Dependencies and scripts
```

## Configuration

### Environment Variables

- `NODE_ENV` - Environment (development/production)
- `NEXT_TELEMETRY_DISABLED` - Disable Next.js telemetry
- `PORT` - Server port (default: 3000)
- `HOSTNAME` - Server hostname (default: 0.0.0.0)

### Database Configuration

The application uses JSON files for data storage:

- **vehicles.json**: Contains vehicle information (license plates, owners, display names)
- **config.json**: API configuration (tokens, endpoints, policies)

## Development

### Code Style

This project uses Biome for linting and formatting:

```bash
npm run lint     # Check for issues
npm run format   # Format code
```

### React Query Integration

The app uses React Query for:
- API state management
- Automatic background refetching
- Cache invalidation
- Loading and error states

Key query keys:
- `["reservations"]` - Current reservations
- `["usage"]` - Usage statistics

### Component Architecture

- **Server Components**: Handle data loading and static content
- **Client Components**: Manage interactivity and state
- **Provider Pattern**: React Query provider wraps the app
- **Modular Design**: Each feature has its own component

## Production Deployment

### Health Checks

The application includes health check endpoints:
- `GET /api/reservations` - Used by Docker health checks

### Resource Management

Production deployment includes:
- CPU limits (1.0 core max, 0.5 core reserved)
- Memory limits (512MB max, 256MB reserved)
- Log rotation (10MB max, 3 files)

### Security

- Read-only database mounts in production
- Non-root user execution
- Minimal attack surface with Alpine Linux

## Monitoring

### Logs

View application logs:
```bash
# Docker Compose
docker-compose logs -f parking-boss

# Docker
docker logs -f <container-id>
```

### Health Status

Check application health:
```bash
curl http://localhost:3000/api/reservations
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database files not found**
   - Ensure `db/vehicles.json` and `db/config.json` exist
   - Check volume mount permissions

3. **Build errors**
   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Docker permission issues**
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER db/
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Create an issue in the repository
