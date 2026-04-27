# AFaire - Auth web + persistance DB

## Etat actuel (deja valide)

- WSL2 operationnel (Ubuntu en version 2).
- Docker Desktop operationnel depuis WSL.
- Stack Docker dev demarree: front (3000), back (8000), postgres (5432 healthy).
- Backend migration + seed executes au demarrage.
- `POST /auth/register` cree bien un compte en base.
- Persistance confirmee: login du compte cree reste possible apres restart des conteneurs `db` + `back`.

## Objectif cible

Permettre depuis le site web:
- creation de compte persistante en base,
- connexion reelle (pas mock),
- session stable apres reload,
- deconnexion propre cote backend.

## Ce qui manque encore (priorite)

### P0 - Bloquant fonctionnel

- [ ] Brancher la page Login frontend sur `POST /auth/login`.
  - Aujourd'hui la page met un token fictif `demo-session` en localStorage.
  - Il faut envoyer email + password au backend et traiter la reponse JSON (`token`, `refreshToken`, `user`).

- [ ] Corriger la redirection apres login.
  - Aujourd'hui redirection vers `/landing`.
  - Utiliser `/profile` (coherent avec les routes protegees existantes).

- [ ] Ajouter les states UI de login.
  - loading pendant la requete.
  - message d'erreur backend (`INVALID_CREDENTIALS`, etc.).
  - blocage double submit.

### P1 - Session/auth robustes

- [ ] Stocker et gerer le `refreshToken` cote front.
  - Actuellement seul `token` est stocke.
  - Sans refresh, deconnexion forcera apres expiration access token.

- [ ] Implementer le refresh automatique.
  - Sur 401 token expire, appeler `POST /auth/refresh` puis rejouer la requete.

- [ ] Faire une vraie deconnexion backend.
  - Appeler `POST /auth/logout` avec refreshToken avant de nettoyer le storage local.
  - Aujourd'hui le front supprime seulement le token local.

### P2 - Qualite UX / integration

- [ ] Centraliser la logique auth front dans un module (`authClient`/`authService`).
- [ ] Normaliser les cles storage (`ft_auth_token`, `ft_refresh_token`, user cache).
- [ ] Verifier l'etat auth au chargement app (`GET /users/me`) pour invalider les sessions cassees.

## Ce qui est deja en place et utilisable

- [x] Register frontend -> backend (`/auth/register`).
- [x] Guard de routes basique via presence de token local.
- [x] Endpoint profile protege (`/users/me`) cote backend.
- [x] Base de donnees persistante via volume Docker `postgres_data`.

## Checklist de validation finale (quand les points ci-dessus sont faits)

- [ ] Creation compte depuis UI Register -> HTTP 200 -> acces `/profile`.
- [ ] Logout puis Login depuis UI Login avec le meme compte -> HTTP 200.
- [ ] Restart `db` + `back` puis Login UI avec meme compte -> fonctionne.
- [ ] Rechargement navigateur avec token valide -> reste connecte.
- [ ] Expiration access token -> refresh automatique sans deconnexion utilisateur.
