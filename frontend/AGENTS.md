# Gemini Agent: Frontend

This document provides context for the frontend application.

## High-Level Overview

The frontend is a single-page application (SPA) that provides the user interface for the application. It is built with React and TypeScript, and it interacts with the backend microservices via an API gateway.

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Radix UI components
- **Routing**: TanStack Router
- **Data Fetching/State Management**: TanStack Query
- **Authentication**: Clerk
- **Testing**: Vitest and React Testing Library

## Project Structure

```
frontend/
├── src/
│   ├── auth/              # Authentication-related components and logic (Clerk)
│   ├── client/            # API client for interacting with the backend
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── routes/            # Route definitions for TanStack Router
│   ├── store/             # Client-side state management stores
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite configuration
└── tsconfig.json          # TypeScript configuration
```

## Key Components & Logic

- **Authentication**: Handled by Clerk. The components and logic are in `src/auth`.
- **API Client**: A client for making requests to the backend is in `src/client`. It uses TanStack Query for data fetching and caching.
- **Routing**: The application uses TanStack Router for type-safe routing. The route definitions are in `src/routes`.
- **UI Components**: The UI is built with a combination of custom components in `src/components` and components from the Radix UI library.
- **State Management**: Besides TanStack Query for server state, the application may use other stores in `src/store` for client-side state.

## How to Run the Application

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```
3.  The application will be available at `http://localhost:3000`.

## How to Test the Application

- **Run unit and component tests**:
  ```bash
  npm test
  ```
- **Lint the code**:
  ```bash
  npm run lint
  ```
- **Format the code**:
  ```bash
  npm run format
  ```

## Deployment

The application is configured for deployment on Vercel (see `vercel.json`). The `npm run build` command creates a production-ready build in the `dist` directory.
