# Frontend Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Backend API running (see BACKEND_SETUP.md)

## Installation

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Linting

```bash
npm run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── api/          # API client and services
│   ├── components/   # Reusable React components
│   ├── pages/        # Page components
│   ├── phaser/       # Phaser game engine
│   ├── stores/       # Zustand state stores
│   └── styles/       # CSS and Tailwind styles
├── public/           # Static assets
└── index.html        # Entry HTML
```

## Configuration

The frontend connects to the backend API through a proxy configured in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

For production, update the API base URL in `src/api/client.js`.

## Features

### Authentication
- Login/Register with email/password
- OAuth integration (Google, Microsoft)
- JWT token management

### Student Features
- Dashboard with stats
- Game board visualization
- Book logging
- Achievement tracking

### Teacher Features
- Class management
- Student monitoring
- Reading log verification
- Analytics dashboard

### Game Engine (Phaser)
- Adaptive board generation
- Character movement
- Tile interactions
- Progress visualization

## Troubleshooting

### API requests fail
- Ensure backend is running on port 3000
- Check browser console for CORS errors
- Verify proxy configuration in vite.config.js

### Phaser game not loading
- Check browser console for errors
- Ensure Phaser assets are in public directory
- Verify game container div exists in DOM
