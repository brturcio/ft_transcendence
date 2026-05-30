# Backend — ft_transcendence

Ce document décrit l'architecture du backend, le fonctionnement des routes API et comment créer/exposer une API publique.

**Structure générale**
- Le code backend est dans le dossier [back/](back/).
- Le serveur est une application Next.js (App Router) servant des route handlers sous [back/src/app](back/src/app).
- Accès base de données via Drizzle/pg : configuration dans [back/src/config/db.ts](back/src/config/db.ts).
- Configuration d'environnement et variables sensibles : [back/src/config/env.ts](back/src/config/env.ts).
- Gestion des routes, erreurs et réponses centralisée : [back/src/shared/http/route-handler.ts](back/src/shared/http/route-handler.ts).
- Middleware global (CORS, OPTIONS) : [back/src/middleware.ts](back/src/middleware.ts).
- Modules métiers (auth, sessions, tokens, password hashing, etc.) : [back/src/modules](back/src/modules).

## Démarrer localement
1. Installer les dépendances et lancer le serveur depuis le dossier `back` :

```bash
cd back
npm install
npm run dev
```

2. Variables d'environnement importantes (voir [back/src/config/env.ts](back/src/config/env.ts)) :
- `DATABASE_URL` (Postgres)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ALLOWED_ORIGINS` (origines autorisées pour CORS)
- `PORT` (par défaut 8000)

3. DB : il existe des scripts utiles :
- `npm run db:migrate:base` — appliquer la migration de base
- `npm run db:seed` — insérer des données de seed

## Comment fonctionnent les routes API
- Chaque route HTTP correspond à un dossier + `route.ts` sous `back/src/app`. Exemple :
  - `POST /api/auth/register` → [back/src/app/auth/register/route.ts](back/src/app/auth/register/route.ts)
  - `GET /api/health` → [back/src/app/health/route.ts](back/src/app/health/route.ts)

- Pattern de développement recommandé :
  - Exporter les handlers (`export async function GET(request: Request) { ... }`) ou `POST`, `PUT`, `DELETE` selon besoin.
  - Utiliser `handleRoute(handler)` depuis [back/src/shared/http/route-handler.ts](back/src/shared/http/route-handler.ts) pour centraliser la gestion des erreurs, des validations Zod et la sérialisation des réponses.
  - Accéder à la DB via `db` importé depuis [back/src/config/db.ts](back/src/config/db.ts).

- Authentification & sessions :
  - Les tokens sont gérés par les modules dans [back/src/modules/auth](back/src/modules/auth).
  - Pour les routes protégées, vérifiez et parsez le header `Authorization` (Bearer token) puis validez les claims (ou utilisez les helpers du module `session` / `tokens`).

## Middleware et CORS
- `back/src/middleware.ts` applique les headers CORS définis par `CORS_ALLOWED_ORIGINS`. Les requêtes `OPTIONS` sont traitées globalement.
- Pour rendre un endpoint accessible depuis le front, ajoute l'origine dans `CORS_ALLOWED_ORIGINS` (ex : `http://localhost:3000,https://myapp.example.com`).

## Créer une API publique (pas d'auth)
1. Crée un nouveau dossier sous `back/src/app` (par ex. `back/src/app/public/hello/`) et ajoute un fichier `route.ts` :

```ts
// back/src/app/public/hello/route.ts
import { handleRoute } from "../../../shared/http/route-handler";

export async function GET(req: Request) {
  return handleRoute(async () => {
    return { message: "Hello public API" };
  });
}
```

2. Points importants :
- Ne pas appeler de vérification d'auth dans la route si tu veux qu'elle soit publique.
- Utilise `handleRoute` pour un format d'erreur cohérent.
- Vérifie `CORS_ALLOWED_ORIGINS` si l'appel vient d'un navigateur depuis un domaine différent.

3. Exposer l'endpoint : Next.js mappe automatiquement `back/src/app/public/hello/route.ts` sur `http://localhost:8000/public/hello` en dev.

## Créer une API protégée (avec auth)
- Récupère le token dans `request.headers.get('authorization')`, vérifie sa validité avec les helpers dans `back/src/modules/auth/tokens.ts` et rejette si invalide.
- Utilise `AppError` (dans `back/src/shared/errors/app-error.ts`) pour renvoyer des erreurs applicatives normalisées.
- Exemple minimal (pseudo) :

```ts
import { handleRoute } from "../../../shared/http/route-handler";
import { verifyAccessToken } from "../../../modules/auth/tokens";

export async function GET(req: Request) {
  return handleRoute(async () => {
    const auth = req.headers.get('authorization')?.split(' ')[1];
    if (!auth) throw new Error('Unauthorized');
    const user = verifyAccessToken(auth);
    // accéder à la DB, etc.
    return { ok: true, user };
  });
}
```

## Bonnes pratiques
- Toujours valider l'input avec Zod (les handlers existants utilisent Zod pour la validation).
- Centraliser les réponses/erreurs via `handleRoute`.
- Garder la logique métier dans des modules (`back/src/modules`) plutôt que dans `route.ts`.
- Limiter la surface publique : privilégier des routes publiques en lecture seule ou des endpoints dédiés avec quotas/limites si nécessaire.

## Fichiers clés (référence rapide)
- `back/src/app` — routes Next.js (route.ts)
- `back/src/shared/http/route-handler.ts` — wrapper pour routes/erreurs
- `back/src/middleware.ts` — CORS, OPTIONS
- `back/src/config/env.ts` — variables d'environnement
- `back/src/config/db.ts` — connexion Drizzle/Postgres
- `back/src/modules/auth` — gestion sessions / tokens / password

---
Si tu veux, j'ajoute un exemple d'endpoint public complet (avec un test curl) ou j'ajoute une section sur la mise en production (Nginx, https, variables d'env).