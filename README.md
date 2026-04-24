# ft_transcendence

## Local dev stack (front + back + PostgreSQL persistent)

The development stack is now integrated in `docker-compose-dev.yml` with:
- `front` (Vite on port `3000`)
- `back` (Next.js API on port `8000`)
- `db` (PostgreSQL 16 on port `5432`)

PostgreSQL data is persisted in the named Docker volume `postgres_data`.
Stopping containers does not delete database data.

### Start everything

```bash
make up
```

or

```bash
docker compose -f docker-compose-dev.yml up -d --build
```

### Stop everything (keep database data)

```bash
make down
```

### Reset database (delete persisted data)

```bash
make db-reset
```

### Notes

- Backend waits for PostgreSQL readiness before applying base migration.
- Seed runs at startup and is idempotent.
- In Docker, backend uses `DATABASE_URL=postgresql://admin:admin@db:5432/ft_transcendence?sslmode=disable`.

## Description

A tetris game where you can create a room and host competitions.

## MODULES

[] Use a framework for both the frontend and backend. +2pts
[] mplement real-time features using WebSockets or similar technology. +2pts
[] Allow users to interact with other users. +2pts
[] A public API to interact with the database with a secured API key, rate limiting, documentation, and at least 5 endpoints +2pts
[] Standard user management and authentication. +2pts
[] Game statistics and match history (requires a game module). +1 pts
[] mplement a complete web-based game where users can play against each other. +2pts
[] Remote players — Enable two players on separate computers to play the same game in real-time. +2 pts
[] Multiplayer game (more than two players). +2 pts
[] mplement a tournament system. +1 pts
[] A gamification system to reward users for their actions. +1 pts
[] Implement spectator mode for games. +1 pts

20/14 pts

On pourra rajouter des modules pendant le developpement du projet. Mais normalement mà c'est 125/100 pour le projet.

## Distribution

The project can be subdivided into three mains parts:

- The backend, which will be responsible for handling the game logic, user management, and real-time communication.
- The frontend, which will provide the user interface for the game and allow users to interact with

## Project

### First Page

We log in with our 42 account, if its the first time it will create a new account.

### Main Page

We can join a room, create a room, see our stats at the left, and change our profile at the top right.

### Game Page

We have at the left our tertis game, we can see the preview of where the tetriminos will fall, and the next tetriminos. At the right we can see the others tetris games of the other players, and the chat to talk with them. If we are in spec mode we can click on the games to focus on one player.
If we complete a line it will send a line to the other players, if we complete multiple lines it will send more lines, and if we complete 4 lines at once it will send a tetris to the other players. If we are attacked by another player we will receive a line at the bottom of our game, and if we are attacked by multiple players we will receive multiple lines. If we receive too many lines and our game is full we lose, but if we complete a line at the same time as receiving a line it will cancel out and we won't receive the line.

### Profile Page

Wer can change our nickname, but our id will always be our 42 intra id. Same for our profile picture, it will always be the one from our 42 intra account. We can also see our stats, like how many games we have played, how many games we have won, and our win rate.

## Database

This is the data I think we need to store in the database:

- Users Id
- Users Nickname
- Badge selected
- Game plaayed
- Game won
- Tetris done
- Lines sent
- Lines received
- Tournaments played
- Tournaments won
- Line completed

## Achievement and badge

We can have achievements and badges for the users, like:

- First game played : "Welcome to the game" badge
- 5 games played : "Getting the hang of it" badge
- 10 games played : "Tetris master" badge
- 50 games played : "Tetris legend" badge
- 100 games played : "Tetris god" badge

- First game won : "First victory" badge
- 5 games won : "Winning streak" badge
- 10 games won : "He should go pro" badge
- 50 games won : "Heres your crown king" badge

- First tetris done : "The name of the game" badge
- 5 tetrises done : "Understanding the game" badge
- 10 tetrises done : "His getting gooood" badge
- 50 tetrises done : "Can someone stop him ????" badge

- Click on the badge with a '?' : "Curious" badge
- First message in the chat : "Hello there" badge
- 100 messages in the chat : "Social confident" badge
- Host a tournament : "Anyone want to join ?" badge
- Host a tournament that is full : "SORRY NO MORE PLACE" badge
- Win a tournament : "Champion" badge
- Win a tournament with > 8 < 15 players : "The best of the best" badge
- Win a tournament with > 15 players : "The king of the world" badge
- Win a tournament with max players : "The god of the world" badge
- Finish last in a tournament : "L'important c'est de participer" badge
- Change your nickname : "New name, who dis ?" badge

## Tournament system

We can have two systeme of tournament:

### Battle royale

All the players start at the same time and send line to each other randomly each lione sent. When someone lose he is out of the tournament, and the others restart from the begining. The last player remaining is the winner of the tournament.

### Bracket

It's 1v1 in a double elimination (or not ?) bracket, the winner of each game goes to the next round, and the loser goes to the losers bracket. The last player remaining in the winners bracket is the winner of the tournament, and the last player remaining in the losers bracket is the second place of the tournament. The two players then play a final game to determine the winner of the tournament.