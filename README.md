# Public Transit Accessibility App

A progressive web application (PWA) for mapping and navigating public transit stations with a focus on accessibility features. The app works both online and offline, allowing users to view, add, and plan routes between transit stations.

## Features

- 🗺️ Interactive map interface using OpenStreetMap
- 🚉 Add and manage transit stations
- ♿ Track station accessibility information
- 🛣️ Route planning with alternatives
- 📱 Works offline (Progressive Web App)
- 🔄 Background sync for offline changes
- 🚧 Obstacle avoidance in routing
- 📍 Real-time location updates

## Technology Stack

### Frontend
- **Next.js** - React framework for the web application
- **Leaflet** - Open-source JavaScript library for interactive maps
- **TailwindCSS** - Utility-first CSS framework for styling

### Maps & Routing
- **OpenStreetMap** - Free and open-source map data
- **OSRM** (OpenStreetMap Routing Machine) - For calculating routes
- **Custom A* Algorithm** - For offline routing and obstacle avoidance

### Offline Capabilities
- **Service Workers** - For offline functionality and caching
- **IndexedDB** (via idb) - For local data storage
- **Background Sync** - For syncing offline changes
- **Cache API** - For caching map tiles and assets

### Backend & Database
- **Supabase** - Backend as a Service
  - Real-time database
  - Authentication
  - Row Level Security
  - REST API

## Key Features in Detail

### Offline Support
- Map tiles are cached for offline use
- Add stations while offline
- View existing stations and routes
- Automatic sync when back online

### Routing Features
- Multiple route alternatives
- Obstacle avoidance
- Distance and duration calculations
- Real-time updates

### Accessibility Features
- Track station accessibility status
- Accessible route planning
- Visual indicators for accessibility

## Getting Started

1. Clone the repository
bash
git clone [repository-url]


2. Install dependencies
bash
cd frontend
npm install


3. Set up environment variables
```bash
cp .env.example .env.local
# Add your Supabase credentials
```

4. Run the development server
```bash
npm run dev
```


