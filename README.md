# GymAI Planner

An AI-powered gym workout planner that generates tailored fitness programs using **Google Gemini 2.5 Flash Lite** (via OpenRouter), securely persisted with **Neon Serverless PostgreSQL** and **Prisma ORM**, and protected by **Neon Auth**. The frontend is a modern SPA built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## Key Features

*   **Secure Authentication**: Leverages **Neon Auth** (React SDK) to provide seamless user signup, login, and secure sessions.
*   **Personalized Onboarding**: A step-by-step form capturing your fitness level, goals (bulk, cut, recomp, strength, endurance), equipment availability, schedule, preferences, and injury limits.
*   **AI Workout Generation**: Uses Google's **Gemini 2.5 Flash Lite** (via OpenRouter) to compile custom, time-optimized workout plans including exercise splits, sets, reps, REST times, RPE limits, and alternative exercises.
*   **Plan History & Persistence**: Saves and tracks generated programs across versions using Prisma ORM with Neon serverless Postgres.
*   **Premium UI/UX**: Clean, responsive layout built using React 19, Tailwind CSS (v4), and custom UI components (Cards, Buttons, Inputs).

---

## Tech Stack

### Frontend (Client)
*   **Core**: [React 19](https://react.dev) & [TypeScript](https://www.typescriptlang.org/)
*   **Bundler**: [Vite](https://vite.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Routing**: [React Router DOM v7](https://reactrouter.com/)
*   **Auth**: [@neondatabase/neon-js/auth/react](https://neon.tech/docs/guides/neon-auth)

### Backend (Server)
*   **Runtime**: Node.js with [Express](https://expressjs.com/)
*   **Runner**: [tsx](https://github.com/privatenumber/tsx) (TypeScript Execute)
*   **Database ORM**: [Prisma v7](https://www.prisma.io/)
*   **AI Integration**: [OpenRouter API](https://openrouter.ai/) (Gemini 2.5 Flash Lite model)
*   **Database**: [Neon Serverless Postgres](https://neon.tech/)

---

## Repository Structure

```text
├── .env                       # Frontend environment variables
├── package.json               # Frontend dependencies & scripts
├── src/                       # Frontend application code
│   ├── App.tsx                # Client application root & Router setup
│   ├── components/            # Reusable UI component libraries
│   │   ├── layout/            # Layout components (Navbar)
│   │   ├── plan/              # Plan displaying & rendering blocks
│   │   └── ui/                # Base design system components (Button, Card, Input, Select, etc.)
│   ├── context/               # Global state (AuthContext.tsx)
│   ├── lib/                   # API wrapper (api.ts) & auth initialization (auth.ts)
│   ├── pages/                 # Routing pages (Home, Onboarding, Profile, Auth, Account)
│   └── types/                 # Frontend type declarations
├── server/                    # Express backend server folder
│   ├── .env                   # Backend environment variables
│   ├── package.json           # Backend dependencies & scripts
│   ├── prisma.config.ts       # Prisma CLI configuration loading dotenv
│   ├── prisma/                # Database schemas & migrations
│   │   ├── schema.prisma      # Prisma schema (training_plans, user_profiles models)
│   │   └── migrations/        # Prisma SQL migration history files
│   └── src/                   # Backend source code
│       ├── index.ts           # Server start, CORS configuration, & route registration
│       ├── lib/               # Utility libraries (OpenRouter API connector, Prisma Client)
│       ├── routes/            # Route endpoints for plan generation and profile upserts
│       └── types/             # Backend type definitions
```

---

## Environment Configuration

You need two separate `.env` files for both the frontend (root folder) and the backend (`server/` folder).

### 1. Root `.env` (Frontend)
Create a `.env` file in the root of the project:
```env
VITE_API_URL=http://localhost:3001
VITE_NEON_AUTH_URL=https://<your-neon-auth-subdomain>.neonauth.shared.neon.tech/neondb/auth
```

### 2. Backend `.env` (`server/.env`)
Create a `.env` file inside the `server/` directory:
```env
PORT=3001
BASE_URL=http://localhost:3001
DATABASE_URL="postgresql://<username>:<password>@<neon-host>/neondb?sslmode=require"
OPEN_ROUTER_KEY="sk-or-v1-..."
```

---

## Getting Started

### Prerequisites
*   Node.js v18 or higher installed.
*   A running **Neon PostgreSQL** database with Neon Auth enabled.
*   An **OpenRouter** account & API Key.

### Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd react-gym-ai-planner
    ```

2.  **Install Frontend Dependencies**:
    ```bash
    npm install
    ```

3.  **Install Backend Dependencies**:
    ```bash
    cd server
    npm install
    ```

4.  **Database Synchronization (Prisma)**:
    While in the `server` directory, run Prisma migrations to build your database schema and generate the client:
    ```bash
    # Apply existing migrations to your Neon database
    npx prisma migrate dev
    
    # Generate the local Prisma Client inside the server/src/generated folder
    npx prisma generate
    ```

---

## Running the App

To run the application, you need to start both the frontend and backend servers.

### 1. Start the Backend Server (Express)
Navigate to the `server/` directory and run:
```bash
npm run dev:server
```
The server will start on `http://localhost:3001`.

### 2. Start the Frontend Client (Vite)
Navigate to the root directory in a new terminal window and run:
```bash
npm run dev
```
The client will start on `http://localhost:5173`. Open this URL in your web browser.

---

## API Documentation

All backend API paths are prefixed with `/api`.

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| **POST** | `/profile` | Save or update onboarding user profiles. | `{ userId: string, goal: string, experience: string, daysPerWeek: number, sessionLength: number, equipment: string, preferredSplit: string, injuries?: string }` |
| **POST** | `/plan/generate` | Generates a tailored workout plan via Gemini & saves to database. | `{ userId: string }` |
| **GET** | `/plan/current` | Fetches the latest generated training plan version for a user. | *(Query parameters: `?userId=uuid`)* |

---

## Database Schema

The PostgreSQL database maintains the following primary tables (managed via `server/prisma/schema.prisma`):

### `user_profiles`
Stores the onboarding questions filled out by the user:
*   `user_id` (UUID, Primary Key)
*   `goal` (VarChar)
*   `experience` (VarChar)
*   `days_per_week` (Integer)
*   `session_length` (Integer)
*   `equipment` (VarChar)
*   `injuries` (String, Optional)
*   `preferred_split` (VarChar)
*   `updated_at` (Timestamp)

### `training_plans`
Stores the history of generated plans for audit/comparison:
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key index)
*   `plan_json` (JSON structure containing schedule, exercises, progression)
*   `plan_text` (Stringified JSON payload)
*   `version` (Integer, auto-incrementing per user)
*   `created_at` (Timestamp)
