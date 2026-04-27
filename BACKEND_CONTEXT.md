# Backend Context - ft_transcendence

## 1) Mission de ce document
Ce document liste toutes les parties backend a faire en se basant sur:
- le sujet officiel `en.subject.pdf` (v21.0)
- l'etat reel du repo actuel (audit complet du projet)
- les modules vises dans le README actuel

Objectif: avoir une feuille de route backend claire, executable, et verifiable en evaluation.

---

## 2) Exigences sujet qui impactent directement le backend

## 2.1 Mandatory (bloquant)
- L'application doit avoir: frontend + backend + database.
- Multi-user obligatoire (utilisateurs simultanes, actions concurrentes sans corruption de donnees).
- Validation de toutes les entrees cote backend (pas seulement frontend).
- Authentification securisee (email/password minimum, hash + salt).
- HTTPS obligatoire partout pour le backend.
- Variables sensibles via `.env` (ignore git) + fournir `.env.example`.
- Schema de base clair avec relations explicites.

## 2.2 Modules backend cibles (selon README actuel)
Le README liste un objectif a 20 points incluant ces modules qui demandent un gros backend:
- Web:
  - framework backend
  - realtime (WebSockets)
  - interactions utilisateurs (chat, profil, amis)
  - API publique securisee (API key, rate limit, doc, >=5 endpoints)
- User Management:
  - user management standard
  - game stats + match history
- Gaming:
  - jeu web complet
  - remote players
  - multiplayer > 2
  - tournament
  - spectator mode
  - gamification

---

## 3) Etat actuel du projet (audit)

## 3.1 Backend
- `back/package.json`: vide.
- `back/`: aucun code serveur present (pas de `index.js`, pas de routes, pas de models, pas de DB layer).
- `back/Dockerfile`: base Node, expose 8000, lance `node index.js`.
- `back/.env`: reference dans compose, mais fichier non present.

## 3.2 Infra / orchestration
- `docker-compose-dev.yml`: services `front` et `back`, ports 3000 et 8000.
- `docker-compose-prod.yml`: vide.
- `Makefile`: vide.
- `.env` racine: vide.

## 3.3 Front (ce qui est deja branche au backend)
Endpoints deja attendus par le front:
- `POST /auth/register` (Register).
- `GET /users/me` (Profile).
- `PATCH /users/me` (Profile).

Constats importants:
- `VITE_API_URL` fallback sur `http://localhost:3000` alors que le backend compose est en 8000.
- Login actuel est local (token mock en localStorage), pas de vrai endpoint backend.
- Pages `Ranking` et `Tournaments` vides.
- Terms/Privacy sont placeholders (risque de rejet mandatory global).

## 3.4 Historique Git
- Commits recents orientés frontend (register/profile/UI).
- Aucune implementation backend detectee.

Conclusion factuelle:
- Le backend est a demarrer presque from scratch.

---

## 4) Backlog backend complet a faire

## Phase 0 - Foundations (priorite immediate)
- [x] Choisir et initialiser le framework backend (Next.js).
- [x] Initialiser `back/package.json` (scripts dev/build/start/test/lint).
- [x] Creer architecture de base:
  - `src/app`
  - `src/modules/*`
  - `src/shared/*`
  - `src/config/*`
- [x] Mettre en place logger, gestion d'erreurs globale, validation schema.
- [x] Ajouter `back/.env.example` complet.
- [x] Corriger la conf CORS + ports (front 3000 <-> back 8000).
- [x] Ajouter healthcheck endpoint (`GET /health`).

Definition of done phase 0:
- API demarre en local + docker.
- Requetes invalides rejetees proprement.
- Logs + erreurs standardises.

## Phase 1 - Database et modelisation
- [ ] Choisir SGBD (PostgreSQL recommande).
- [ ] Choisir ORM (Prisma/TypeORM/Drizzle).
- [ ] Concevoir schema minimal coherent:
  - users
  - sessions / refresh_tokens
  - friendships
  - messages
  - games
  - game_players
  - game_events
  - achievements
  - user_achievements
  - user_stats
- [ ] Ajouter migrations versionnees.
- [ ] Ajouter seed de dev.
- [ ] Definir index pour perf et unicite (email, username, etc.).

Definition of done phase 1:
- Migration init + rollback ok.
- Donnees persistantes en DB.
- Contraintes relationnelles verifiees.

## Phase 2 - Auth & User management (mandatory + module)
- [ ] `POST /auth/register` avec hash+salt (bcrypt/argon2), validation forte.
- [ ] `POST /auth/login` avec JWT access + refresh token.
- [ ] `POST /auth/refresh`.
- [ ] `POST /auth/logout` (invalidation refresh token).
- [ ] Middleware auth bearer.
- [ ] `GET /users/me`.
- [ ] `PATCH /users/me` (username, bio, avatar optionnel).
- [ ] Page profil backend-compatible (structure stable pour le front).
- [ ] Gestion erreurs auth standard (401/403/409).

Definition of done phase 2:
- Register/login/profile fully functional via frontend.
- Mots de passe jamais stockes en clair.
- Tokens geres proprement (rotation refresh recommande).

## Phase 3 - Interaction users (chat + amis + presence)
- [ ] CRUD relation amis:
  - demande ami
  - accepter/refuser
  - suppression
  - liste amis
- [ ] Presence online/offline (WebSocket).
- [ ] Chat basique 1:1 ou room:
  - send message
  - receive message realtime
  - historique minimal persistant
- [ ] Controle acces chat (utilisateur authentifie).

Definition of done phase 3:
- Deux utilisateurs peuvent se voir, s'ajouter, discuter en temps reel.

## Phase 4 - Coeur jeu temps reel (Tetris multi)
- [ ] Modele de room/game session.
- [ ] Matchmaking/creation room/join room.
- [ ] Sync etat de partie via WebSocket:
  - start game
  - game state snapshots/events
  - line attacks
  - elimination
- [ ] Gestion deconnect/reconnect.
- [ ] Determination winner + fin de match.
- [ ] Persistence resultat match.

Definition of done phase 4:
- 2 joueurs distants peuvent jouer la meme partie en temps reel.
- Desync majeur absent sur parties testees.

## Phase 5 - Multiplayer >2, tournament, spectator
- [ ] Extension moteur a >2 joueurs.
- [ ] Ciblage attaques multi-joueurs (regles equitables).
- [ ] Tournois:
  - creation
  - inscription
  - bracket ou battle royale
  - progression des rounds
  - resultat final
- [ ] Spectator mode:
  - rejoindre en lecture seule
  - flux realtime de la partie
- [ ] API consultation tournoi et historique.

Definition of done phase 5:
- Tournoi complet jouable de l'inscription au vainqueur.
- Spectateur voit la partie en direct sans perturber le match.

## Phase 6 - Stats, history, ranking, gamification
- [ ] Mettre a jour stats utilisateur apres chaque match:
  - games played
  - wins/losses
  - winrate
  - lines sent/received
  - tetrises
- [ ] Historique des matchs (date, adversaires, resultat).
- [ ] Leaderboard backend (classement).
- [ ] Gamification persistante (au moins 3 mecaniques):
  - achievements
  - badges
  - progression/level ou rewards
- [ ] Emission notifications de progression.

Definition of done phase 6:
- Stats coherentes et consultables.
- Achievements attribues automatiquement selon regles explicites.

## Phase 7 - API publique (module Web majeur)
Exigences sujet: API key securisee + rate limiting + documentation + >=5 endpoints CRUD.

- [ ] Creer namespace public ` /api/* ` isole du backend prive.
- [ ] Authentification API key (rotation/revocation).
- [ ] Rate limiting par key (et/ou IP) + quotas.
- [ ] Journalisation des appels API.
- [ ] Documentation OpenAPI/Swagger publique.
- [ ] Au moins 5 endpoints (GET/POST/PUT/DELETE couverts).

Exemple endpoints publics:
- [ ] `GET /api/users`
- [ ] `GET /api/users/:id`
- [ ] `GET /api/games`
- [ ] `POST /api/tournaments`
- [ ] `PUT /api/tournaments/:id`
- [ ] `DELETE /api/tournaments/:id`

Definition of done phase 7:
- Appel sans API key refuse.
- Limites de debit verifiables.
- Swagger exploitable en evaluation.

## Phase 8 - Securite, qualite, exploitation
- [ ] HTTPS de bout en bout en dev/prod (certs deja montes dans compose).
- [ ] Politique CORS stricte.
- [ ] Protection basique API:
  - helmet
  - sanitize inputs
  - anti brute-force login
- [ ] Gestion secrets via env (jamais en dur).
- [ ] Tests backend:
  - unitaires services critiques
  - integration API
  - tests websocket basiques
- [ ] Observabilite:
  - logs structures
  - endpoint metrics (si Prometheus plus tard)
- [ ] Sauvegarde DB minimale (script backup/restore).

Definition of done phase 8:
- Backend defensif et testable.
- Scenarios critiques verifies avant evaluation.

---

## 5) Contrats API a implementer en priorite (pour debloquer le front actuel)

Priorite P0 (front deja code):
- [ ] `POST /auth/register`
- [ ] `POST /auth/login` (a brancher dans la page login)
- [ ] `GET /users/me`
- [ ] `PATCH /users/me`

Format reponse conseille (coherent front):
- Register/Login: `{ token, refreshToken?, user }`
- Profile GET/PATCH:
  - `username`
  - `email`
  - `bio`
  - `rank`
  - `stats: { games, wins, winRate }`

---

## 6) Gaps critiques a traiter avant d'aller loin
- [ ] Back absent: impossible de valider modules backend.
- [ ] `VITE_API_URL` par defaut non coherent avec port backend compose.
- [ ] `back/.env` manquant + `.env.example` manquant (mandatory).
- [ ] `docker-compose-prod.yml` vide (pas de run prod one-command).
- [ ] `Makefile` vide (pas de workflow standardise).
- [ ] Terms/Privacy cote front encore placeholders (risque de rejet global mandatory).

---

## 7) Ordre d'execution recommande (court terme)
1. Initialiser backend framework + DB + migrations.
2. Implementer auth + profil (endpoints deja utilises par le front).
3. Brancher login front sur vrai backend.
4. Ajouter WebSocket socle (presence/chat), puis moteur jeu.
5. Ajouter tournoi/spectator/multiplayer et stats.
6. Finaliser API publique + rate limit + doc.
7. Durcir securite, tests, docker prod, README final.

---

## 8) Check evaluation backend (resume)
Pour etre defensable en evaluation, il faut pouvoir demontrer:
- backend fonctionnel en container
- authentification securisee reelle
- multi-user concurrent sans corruption
- realtime robuste (deconnexion/reconnexion)
- persistence DB coherente
- endpoints modules annonces vraiment fonctionnels
- API publique documentee et protegee
- preuves de tests + logs + explication architecture

Si vous revendiquez un module, il doit etre complet et montrable de bout en bout.
