# Service & Repair Operations App

A React application for managing service and repair operations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Backend API

The app expects a backend API running at `http://localhost:8080/api`. The API specification is defined in `files/openapi.yaml`.

The Vite dev server is configured to proxy API requests to the backend.

## Features

- **Authentication**: JWT-based login system
- **Dashboard**: Overview with KPIs, job status charts, and recent activity
- **Jobs Management**: List, view, and manage service jobs with notes and parts
- **Customers**: Manage customer information and view related jobs/assets
- **Assets**: Track customer assets (bikes, vehicles, etc.)
- **Inventory**: Manage inventory items with stock tracking
- **Calendar**: Week view of scheduled jobs
- **Settings**: Admin-only settings for job status configuration

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components organized by feature
- `src/services/` - API service functions
- `src/styles/` - Global SCSS styles
- `src/contexts/` - React contexts (Auth)
- `src/utils/` - Utility functions
- `src/constants/` - Constants and enums

## Routes

- `/login` - Login page
- `/dashboard` - Dashboard (requires authentication)
- `/jobs` - Jobs list
- `/jobs/:id` - Job detail
- `/customers` - Customers list
- `/customers/:id` - Customer detail
- `/assets` - Assets list
- `/assets/:id` - Asset detail
- `/inventory` - Inventory list
- `/calendar` - Calendar view
- `/settings` - Settings (admin only)










