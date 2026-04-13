# Frontend README

Task dashboard React frontend application.

## Quick Start

```bash
npm install
npm start
```

App opens at `http://localhost:3000`

## Environment Setup

1. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

2. Configure:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GITHUB_USERNAME=your_github_username
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Header.js
│   ├── TaskWidget.js
│   ├── GitHubWidget.js
│   ├── SpotifyWidget.js
│   └── EmailWidget.js
├── pages/           # Page components
│   └── Dashboard.js
├── styles/          # CSS files
├── App.js          # Root component
└── index.js        # Entry point
```

## Components

- **Header** - Dashboard title and navigation
- **TaskWidget** - Task list and management
- **GitHubWidget** - GitHub stats and metrics
- **SpotifyWidget** - Top tracks and music info
- **EmailWidget** - Calendar events and email summary
- **Dashboard** - Main layout combining all widgets

## Features

- Responsive grid layout
- Real-time data fetching
- Smooth animations and transitions
- Mobile-friendly design
- Dark/Light theme support (expandable)

## Dependencies

- **react** - UI framework
- **react-router-dom** - Routing
- **axios** - HTTP client
- **zustand** - State management
- **date-fns** - Date utilities
- **chart.js** - Charting library

## Available Scripts

- `npm start` - Development server
- `npm build` - Production build
- `npm test` - Run tests
- `npm eject` - Eject from create-react-app (irreversible)

## Styling

CSS files in `src/styles/` use:
- Flexbox and CSS Grid
- Gradients and shadows
- Responsive design with media queries
- CSS transitions and transforms
