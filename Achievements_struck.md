## Resume Simple Pour Comprendre

Avant, une partie de la logique des achievements pouvait vivre cote frontend, avec du stockage dans `localStorage`. Cela pouvait poser des problemes : achievements melanges entre utilisateurs, etat pas toujours fiable, progression qui depend du navigateur.

Maintenant, le systeme fonctionne comme ca :

```text
Le frontend dit au backend : "cet utilisateur a fait une action"
Le backend verifie l'utilisateur
Le backend met a jour la base de donnees
Le frontend relit la base via le backend
Le profil affiche le resultat officiel
```

Donc, si on veut savoir si un achievement est vraiment debloque, on ne regarde pas le navigateur. On regarde la base de donnees, via le backend.

## Ce Qui A Change

### 1. Le backend gere maintenant l'etat reel

Le backend est responsable de dire :

```text
Cet achievement est debloque pour cet utilisateur
Cet achievement n'est pas encore debloque
Cette progression Tetris vaut maintenant 5
Ce nouvel achievement vient juste d'etre debloque
```

Le frontend ne fait plus cette decision tout seul.

### 2. La base de donnees garde la progression par utilisateur

Chaque utilisateur a ses propres donnees.

Exemple :

```text
Utilisateur A
  -> first_tetris debloque
  -> curious debloque
  -> tetrises = 5

Utilisateur B
  -> aucun achievement debloque
  -> tetrises = 0
```

Les achievements ne se melangent plus entre utilisateurs.

### 3. Le frontend ne stocke plus les achievements dans localStorage

Avant, le navigateur pouvait garder une liste locale d'achievements debloques.

Maintenant, `localStorage` garde seulement les infos d'authentification, comme :

```text
ft_auth_token
ft_refresh_token
ft_user
```

Il ne garde plus la liste officielle des achievements debloques.

### 4. Le profil lit toujours les achievements depuis le backend

Quand l'utilisateur ouvre son profil :

```text
Profile.tsx
  -> demande les infos utilisateur
  -> demande les achievements debloques
  -> affiche les badges debloques ou bloques
```

### 5. Tetris ne debloque pas directement une card dans le frontend

Le jeu detecte seulement qu'une partie est valide.

Ensuite :

```text
Tetris detecte une partie valide
  -> appelle le backend
  -> backend augmente le compteur
  -> backend regarde si un seuil est atteint
  -> backend repond avec les nouveaux achievements
  -> frontend montre la notification
```

## Version Tres Courte

```text
Frontend = detecte et affiche
Backend = verifie et calcule
Base de donnees = garde la verite
```

Si quelqu'un veut comprendre rapidement le systeme, il peut retenir ceci :

```text
Un achievement est officiel seulement s'il existe dans UserAchievement avec unlockedAt rempli.
```

Et pour Tetris :

```text
Une partie ajoute +1 au compteur Tetris si le joueur nettoie au moins 2 lignes d'un coup pendant cette partie, puis termine la partie.
```

## Exemple Concret

Cas : l'utilisateur clique sur le badge secret `curious`.

```text
1. L'utilisateur clique sur la card.
2. Le frontend appelle POST /achievements/unlock.
3. Le backend verifie le token.
4. Le backend trouve l'utilisateur.
5. Le backend cherche l'achievement curious.
6. Le backend ecrit dans UserAchievement.
7. Le backend repond : debloque.
8. Le frontend affiche une notification.
9. Le profil relit GET /achievements/me.
10. La card apparait maintenant debloquee.
```

Cas : l'utilisateur joue a Tetris.

```text
1. Le joueur nettoie 2 lignes ou plus avec une seule piece.
2. Le jeu marque la partie comme valide.
3. Le joueur continue la partie.
4. Quand la partie est finie, le frontend appelle POST /achievements/tetris-progress.
5. Le backend ajoute +1 a UserStat.tetrises.
6. Le backend verifie les seuils : 1, 5, 10, 50.
7. Si un seuil est atteint, le backend debloque l'achievement.
8. Le frontend affiche une notification seulement pour les nouveaux achievements.
```
