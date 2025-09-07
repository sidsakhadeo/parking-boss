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
- **Containerization**: Docker

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
   See the [Database Setup](#database-setup) section below for detailed configuration.

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

## Database Setup

The application requires two JSON configuration files in the `db/` directory:

### 1. Create `db/config.json`

Copy the example file and customize it for your setup:

```bash
cp db/config.example.json db/config.json
```

The configuration file should contain the following fields:

```json
{
  "location": "dt6bff9y0d7kx5vbpqe00gk5j8",
  "policy": "6yzx3t97811m7ba90x5qksvdcc",
  "tenant": "",
  "token": "",
  "space": "GUEST",
  "duration": "",
  "email": "",
  "tel": ""
}
```

**Configuration Fields:**

- **`location`**: DO NOT CHANGE - Parking location identifier (unique ID for the parking facility)
- **`policy`**: DO NOT CHANGE - Parking policy identifier (defines rules and restrictions for the location)
- **`tenant`**: Condo value (e.g. "BLD99 UNIT 40")
- **`token`**: 4-digit password
- **`space`**: DO NOT CHANGE - Default space type
- **`duration`**: Default reservation duration. Format "PT4H" for 4 hours
- **`email`**: The email used in Parking Boss
- **`tel`**: The mobile number used in Parking Boss

### 2. Create `db/vehicles.json`

This file contains your vehicle database. You can copy from the example:

```bash
cp db/vehicles.example.json db/vehicles.json
```

The vehicles file should contain an object with vehicle IDs as keys and vehicle information as values.

### Database File Security

Both configuration files are automatically ignored by git (see `.gitignore`) to prevent sensitive information from being committed to version control. Make sure to:

1. Keep your `db/config.json` secure and never commit it to version control
2. Share example files only (`db/config.example.json` and `db/vehicles.example.json`)
3. Update the example files when adding new configuration options

## Docker Deployment

The application is fully containerized and ready for deployment.

### Using Docker Compose (Recommended)

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Manual Docker Commands

```bash
# Build the image
docker build -t parking-boss .

# Run with volume mount
docker run -p 3000:3000 -v $(pwd)/db:/app/db parking-boss

# Run with custom environment variables
docker run -p 3000:3000 \
  -v $(pwd)/db:/app/db \
  -e NODE_ENV=production \
  -e NEXT_TELEMETRY_DISABLED=1 \
  parking-boss
```

### Docker Configuration

The Docker setup includes:
- **Multi-stage build** for optimal image size
- **Non-root user** for security
- **Health checks** for container monitoring  
- **Volume mounting** for persistent database files

### Volume Mounting

The container expects a volume mount for the database directory:
```bash
# Local development
-v $(pwd)/db:/app/db

# Production with named volume
-v parking_db:/app/db
```

Make sure your `db/config.json` and `db/vehicles.json` files are properly configured before running the container.

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

## Monitoring

### Logs

View application logs:
```bash
# Docker
docker logs -f <container-id>
```

### Health Status

Check application health:
```bash
curl http://localhost:3000/api/reservations
```
