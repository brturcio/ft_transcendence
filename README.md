*This project has been created as part of the 42 curriculum by brturcio, gajanvie, ntome, grouger.*

# ft_transcendence

## Description

**ft_transcendence** is a full-stack multiplayer Tetris web application developed as part of the 42 curriculum.

The goal of the project is to provide a real-time competitive Tetris experience where users can create an account, manage their profile, play solo or multiplayer games, interact with other users, track their progress, unlock achievements, and compete through a global leaderboard.

The application includes a React/Vite frontend, a TypeScript backend, a PostgreSQL database, JWT-based authentication, WebSocket-powered real-time gameplay, user profiles, friends, online presence, achievements, statistics, leaderboard, and internationalization in English, Spanish, and French.

Key features include:

- User registration and login.
- Secure password authentication.
- User profile management.
- Avatar upload and deletion.
- Account deletion.
- Friends and friend requests.
- Online, offline, and in-game user status.
- User search.
- Solo Tetris gameplay.
- Multiplayer Tetris rooms.
- Real-time gameplay using WebSockets.
- Remote players on separate computers.
- Multiplayer games with more than two players.
- Global leaderboard.
- User statistics.
- Achievements and gamification.
- Achievement notifications.
- Privacy Policy and Terms of Service pages.
- Credits page.
- Internationalization in English, Spanish, and French.
- Responsive interface built with Tailwind CSS.
- Docker-based development environment.

## Instructions

### Prerequisites

To run the project, the following tools are required:

- Docker
- Docker Compose
- Make
- Node.js

### Environment Setup

The backend requires an environment file. Create it from the provided example:

```bash
cp back/.env.example back/.env
```

The required environment variables include:

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TTL=
JWT_REFRESH_TTL=
BCRYPT_ROUNDS=
CORS_ALLOWED_ORIGINS=
```

The `.env` file must remain local and must not be committed to Git.

### Run With Docker

Start the full development stack:

```bash
make up
```
This starts:

- Frontend on port `3000`
- Backend on port `8000`
- PostgreSQL on port `5432`

Stop the stack:

```bash
make down
```

Reset the database:

```bash
make db-reset
```

The exact manual setup depends on the configured environment variables and PostgreSQL availability.

## Team Information

| Login | Role(s) | Responsibilities |
|---|---|---|
| ntome | Project Manager, Developer | Tetris gameplay, game mechanics, level and speed progression, stash, leaderboard and achievement concepts |
| brturcio | Developer | Frontend integration, login/register UI, profile UI, i18n, pages, achievements integration, realtime frontend integration |
| gajanvie | Developer | Friends system, friend requests, online status, global presence, FriendsManager, PlayerModal integration |
| grouger | Developer | Backend architecture, authentication, sessions, database schema, migrations, users API, friends backend |

## Project Management

The team organized the project by feature areas:

- Frontend interface and responsive design.
- Backend API and authentication.
- Database schema and migrations.
- Tetris game logic.
- Real-time multiplayer system.
- User management and profile.
- Friends and presence.
- Achievements and gamification.
- Documentation and evaluation preparation.

Git was used for version control, with commits organized around features, fixes, and integration work.

The team used Discord as the main communication channel for daily coordination, technical discussions, code reviews, and task planning.

## Technical Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- i18next / react-i18next

React and Vite were chosen to build a fast single-page application, while Tailwind CSS was used to keep styling consistent and responsive across pages.

### Backend

- TypeScript
- Next.js API routes
- Zod validation
- JWT authentication
- bcrypt password hashing
- WebSocket server

The backend handles authentication, users, profiles, avatars, friends, achievements, statistics, leaderboard, and real-time multiplayer communication.

### Database

- PostgreSQL
- Drizzle ORM
- Prisma schema/migrations reference

PostgreSQL was chosen because the project relies on structured relational data such as users, sessions, friendships, achievements, user statistics, and messages.

### DevOps

- Docker
- Docker Compose
- Makefile

Docker Compose allows the full stack to be started with a single command, including frontend, backend, and database.

## Database Schema

The database contains the following main tables.

### User

Stores account and profile information.

Key fields:

- `id`
- `email`
- `username`
- `passwordHash`
- `avatarUrl`
- `bio`
- `isActive`
- `status`
- `createdAt`
- `updatedAt`

Relations:

- Has sessions.
- Has statistics.
- Has achievements.
- Can send and receive friend requests.
- Can send messages.

### Session

Stores refresh sessions for authenticated users.

Key fields:

- `id`
- `userId`
- `refreshTokenHash`
- `userAgent`
- `ipAddress`
- `expiresAt`
- `revokedAt`
- `createdAt`
- `updatedAt`

### UserStat

Stores aggregated user statistics.

Key fields:

- `id`
- `userId`
- `soloGamesPlayed`
- `soloLastScore`
- `soloBestScore`
- `soloLinesCompleted`
- `soloTetrises`
- `multiGamesPlayed`
- `multiGamesWon`
- `multiGamesLost`
- `multiWinRate`
- `multiLinesSent`
- `multiLinesReceived`
- `tournamentsPlayed`
- `tournamentsWon`
- `xp`
- `level`
- `createdAt`
- `updatedAt`

### Achievement

Stores available achievements.

Key fields:

- `id`
- `key`
- `title`
- `description`
- `category`
- `points`
- `createdAt`
- `updatedAt`

### UserAchievement

Links users to unlocked achievements and achievement progress.

Key fields:

- `id`
- `userId`
- `achievementId`
- `progress`
- `unlockedAt`

### Friendship

Stores friend requests and friendship status.

Key fields:

- `id`
- `requesterId`
- `addresseeId`
- `status`
- `respondedAt`
- `createdAt`
- `updatedAt`

### Message

Stores message data.

Key fields:

- `id`
- `senderId`
- `recipientId`
- `gameId`
- `tournamentId`
- `content`
- `editedAt`
- `deletedAt`
- `createdAt`

## Features List

| Feature | Team member(s) | Description |
|---|---|---|
| User registration | brturcio, grouger | Users can create an account with email, username, and password |
| User login | brturcio, grouger | Users can authenticate securely using JWT-based sessions |
| Logout and refresh sessions | grouger | Refresh tokens and logout flow are handled by the backend |
| Profile page | brturcio, ntome | Users can view and update their profile information |
| Avatar upload and deletion | brturcio, grouger | Users can upload and remove a profile avatar |
| Account deletion | brturcio, grouger | Users can delete their account through the profile page |
| Friends system | gajanvie, grouger | Users can send, accept, decline, and remove friend relationships |
| Online status | gajanvie | Users have online, offline, and in-game presence |
| User search | ntome | Users can search other players from the navigation bar |
| Solo Tetris | ntome | Users can play a solo Tetris game |
| Multiplayer rooms | ntome, brturcio | Users can create and join multiplayer rooms |
| Real-time gameplay | ntome, brturcio | WebSockets synchronize multiplayer game state |
| Remote players | ntome, brturcio | Players can play from separate computers in the same game |
| Multiplayer 3+ | ntome, brturcio | Multiplayer rooms support more than two connected players |
| Leaderboard | ntome, brturcio | Players are ranked by solo best score |
| User statistics | brturcio | User statistics are tracked and displayed in the profile |
| Achievements | ntome, brturcio | Users unlock achievements based on gameplay and actions |
| Achievement notifications | ntome | Unlocking achievements triggers frontend notifications |
| Internationalization | brturcio | The frontend supports English, Spanish, and French |
| Privacy and Terms pages | brturcio | Legal pages are available from the application navigation |
| Credits page | gajanvie | Team credits are displayed in a dedicated page |
| Docker setup | ntome | The project can be started with Docker Compose and Make |

## Modules

The project uses the following modules.

| Category | Module | Type | Points | Implementation | Team member(s) |
|---|---|---:|---:|---|---|
| Web | Use a framework for both frontend and backend | Major | 2 | React/Vite frontend and TypeScript backend API routes | brturcio, grouger, ntome, gajanvie |
| Web | Real-time features using WebSockets | Major | 2 | Multiplayer rooms and real-time game state synchronization | ntome, brturcio |
| Web | Use an ORM for the database | Minor | 1 | Drizzle ORM with PostgreSQL schema definitions | grouger |
| Web | Allow users to interact with other users. | Major | 2 | Chat, profile systeme and friend systeme | ntome
| Web | Custom-made design | Minor | 1 | Buttons, color pallet, navbar, footer | brturcio, grouger, ntome, gajanvie
| Accessibility and i18n | Support for multiple languages | Minor | 1 | i18next with English, Spanish, and French translations | brturcio |
| User Management | Standard user management and authentication | Major | 2 | Registration, login, logout, profile, avatar, account deletion, JWT sessions | brturcio, grouger |
| Gaming and user experience | Complete web-based game | Major | 2 | Browser-based Tetris game with score, levels, game over, and multiplayer mode | ntome, brturcio, gajanvie |
| Gaming and user experience | Remote players | Major | 2 | Players can join the same multiplayer game from separate computers | ntome, brturcio, gajanvie |
| Gaming and user experience | Multiplayer game with more than two players | Major | 2 | Multiplayer rooms support more than two connected players | ntome, brturcio, gajanvie |
| Gaming and user experience | Gamification system | Minor | 1 | Achievements, user progress, badges, XP, levels, and leaderboard | ntome, brturcio, grouger |

Total claimed points: **18 points**.

## Individual Contributions

### ntome

Contributions:

- Game idea and gameplay direction.
- Local Tetris implementation.
- Tetris mechanics.
- Level and speed progression.
- Stash and pause mechanics.
- Achievements frontend.
- Leaderboard.
- Profile and game UI concepts.

### brturcio

Contributions:

- Frontend structure and integration.
- Login and register user interface.
- Profile page integration.
- Internationalization.
- Privacy Policy and Terms of Service pages.
- Credits page translation integration.
- Frontend achievement integration.
- Realtime multiplayer frontend integration.
- Tailwind CSS refactor.
- Profile avatar frontend.

### gajanvie

Contributions:

- Friends system integration.
- Friend requests.
- Online, offline, and in-game status.
- FriendsManager component.
- PlayerModal friend request integration.
- Realtime status updates.
- Credits page.

### grouger

Contributions:

- Backend architecture.
- Authentication backend.
- Register, login, logout, and refresh routes.
- JWT access and refresh tokens.
- Database schema and migrations.
- User API.
- Session management.
- Friends backend.

## Resources

### Documentation

- React documentation: https://react.dev
- Vite documentation: https://vite.dev
- TypeScript documentation: https://www.typescriptlang.org/docs
- Tailwind CSS documentation: https://tailwindcss.com/docs
- React Router documentation: https://reactrouter.com
- i18next documentation: https://www.i18next.com
- Next.js documentation: https://nextjs.org/docs
- PostgreSQL documentation: https://www.postgresql.org/docs
- Drizzle ORM documentation: https://orm.drizzle.team
- Docker documentation: https://docs.docker.com
- JWT introduction: https://jwt.io/introduction
- bcrypt package documentation: https://www.npmjs.com/package/bcrypt
- WebSocket API documentation: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

### AI Usage

AI tools were used as development support during the project.

AI was used for:

- Understanding and summarizing subject requirements.
- Planning the README structure.
- Reviewing i18n coverage.
- Identifying hardcoded visible texts.
- Explaining TypeScript and Git issues.
- Drafting documentation wording.
- Reviewing possible module claims and evaluation risks.

All AI-generated suggestions were reviewed and adapted by the team before being included in the project. The final implementation decisions and code integration were made by the team.

## Usage Notes

Recommended evaluation flow:

1. Start the project with Docker.
2. Register a user.
3. Login.
4. Update profile information.
5. Upload and delete avatar.
6. Switch language between English, Spanish, and French.
7. Play a solo Tetris game.
8. Check leaderboard and achievements.
9. Search for another user.
10. Send and accept a friend request.
11. Create a multiplayer room.
12. Join the room from another browser or computer.
13. Start a multiplayer game.

## License

This project was created for educational purposes as part of the 42 curriculum.
