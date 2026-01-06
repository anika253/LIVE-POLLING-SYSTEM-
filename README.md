# Live Polling System

A resilient live polling system built with React, Node.js, Socket.io, and MongoDB. This system supports two personas: Teacher (Admin) and Student, with real-time polling capabilities and state recovery.

## Features

### Teacher Persona (Admin)

- Create polls with questions, options, and configurable timer (max 60 seconds)
- View real-time polling results as students vote
- View poll history with aggregate results
- End polls manually
- Create new polls only when previous poll is ended or no active poll exists

### Student Persona (User)

- Enter name on first visit (unique per session/tab)
- Receive questions instantly when teacher asks them
- Synchronized timer that adjusts if joining late
- Submit votes within the time limit
- View live polling results after submission

### System Resilience

- **State Recovery**: If Teacher or Student refreshes during an active poll, the application fetches current state from backend and resumes exactly where it left off
- **Race Condition Prevention**: Students cannot vote more than once per question, even with API spam or client-side manipulation
- **Database Persistence**: All polls, options, and votes are stored in MongoDB
- **Server as Source of Truth**: Timer and vote counts are managed by the server

## Technology Stack

- **Frontend**: React.js with TypeScript, React Router, Socket.io Client
- **Backend**: Node.js with Express, TypeScript
- **Real-time Communication**: Socket.io
- **Database**: MongoDB with Mongoose
- **Architecture**: Controller-Service pattern (backend), Custom Hooks (frontend)

## Project Structure

```
live_polling_system/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # MongoDB models
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── socket/          # Socket.io handlers
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── package.json
```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd live_polling_system
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   ```

3. **Set up environment variables**

   Create `backend/.env` file:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/live_polling
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

   Create `frontend/.env` file (optional):

   ```env
   REACT_APP_SOCKET_URL=http://localhost:5000
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in the `.env` file.

## Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

**Backend:**

```bash
cd backend
npm run dev
```

**Frontend:**

```bash
cd frontend
npm start
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

1. **As a Teacher:**

   - Navigate to the welcome page
   - Click "I'm a Teacher"
   - Enter your name and poll name
   - Create polls with questions and options
   - View real-time results as students vote
   - Access poll history to view past polls

2. **As a Student:**
   - Navigate to the welcome page
   - Click "I'm a Student"
   - Enter your name
   - Wait for teacher to ask questions
   - Submit your vote when a question appears
   - View results after voting or when time expires

## Architecture Highlights

### Backend Architecture

- **Separation of Concerns**: Business logic is separated from routes and socket handlers
- **Controller-Service Pattern**: Controllers handle HTTP requests, Services contain business logic
- **Repository Pattern**: Data access is abstracted through repositories
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Frontend Architecture

- **Custom Hooks**: `useSocket` for socket connection management, `usePollTimer` for timer synchronization
- **State Management**: Local state with React hooks, localStorage for persistence
- **Optimistic UI**: Immediate UI updates with error rollback
- **State Recovery**: Automatic state recovery on page refresh

## API Endpoints

- `POST /api/polls` - Create a new poll
- `GET /api/polls/active` - Get active poll
- `GET /api/polls/history` - Get all polls
- `GET /api/polls/:id` - Get poll by ID
- `POST /api/polls/:id/end` - End a poll

## Socket Events

### Client to Server

- `student:join` - Student joins the system
- `teacher:join` - Teacher joins the system
- `poll:create` - Create a new poll
- `poll:vote` - Submit a vote
- `poll:end` - End a poll
- `state:request` - Request current state (for recovery)

### Server to Client

- `student:registered` - Student registration confirmation
- `poll:created` - New poll created
- `poll:active` - Active poll available
- `poll:updated` - Poll results updated
- `poll:ended` - Poll ended
- `state:response` - Current state response
- `vote:success` - Vote submitted successfully
- `error` - Error occurred

## Testing State Recovery

1. **Teacher Recovery:**

   - Create a poll as teacher
   - Refresh the browser
   - The poll should still be visible with correct timer

2. **Student Recovery:**
   - Join as student
   - Wait for a poll
   - Refresh the browser mid-poll
   - The poll should resume with correct remaining time
   - If already voted, results should be shown

## Deployment

### Backend Deployment

1. Build the TypeScript code:

   ```bash
   cd backend
   npm run build
   ```

2. Set environment variables on your hosting platform

3. Start the server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Build the React app:

   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `build` folder to your hosting platform (Vercel, Netlify, etc.)

3. Update environment variables to point to your backend URL

## Notes

- The system ensures only one active poll at a time
- Students can only vote once per poll
- Timer synchronization is handled server-side
- All data is persisted in MongoDB
- UI follows the provided Figma design specifications
