# Systeme de demandes d'amis et securite

Ce document decrit un plan clair pour un systeme de demandes d'amis, ainsi que les securites a mettre en place.

## 1) Modele de donnees

Table `friendships` :

- `requester_id`
- `addressee_id`
- `status` : `pending`, `accepted`, `declined`, `blocked`
- `created_at`, `updated_at`

Contraintes conseillees :

- index unique sur `(requester_id, addressee_id)`
- index inverse pour detecter les demandes croisees
- stocker la relation dans un seul sens (normaliser l'ordre de la paire)

Securite liee :

- contraintes DB pour bloquer doublons et courses
- validation serveur (IDs valides, users existants, pas d'auto-ami)

## 2) Flux "demande d'ami"

Endpoints proposes :

- `POST /friends/requests` : envoyer une demande
- `POST /friends/requests/:id/accept` : accepter
- `POST /friends/requests/:id/decline` : refuser
- `DELETE /friends/:id` : retirer un ami

Regles metier :

- pas deja amis
- pas de demande existante
- pas de demande croisee
- pas de demande vers un utilisateur bloque

Securite liee :

- AuthZ stricte : seuls les acteurs concernes peuvent lire/modifier
- verif de contexte utilisateur pour eviter IDOR
- transactions pour eviter acceptations concurrentes

## 3) Gestion du blocage

Endpoints proposes :

- `POST /friends/blocks`
- `DELETE /friends/blocks/:id`

Regles :

- si `blocked`, empecher toute interaction (demandes, messages, invitations)

Securite liee :

- le blocage prime sur tout
- limiter la visibilite reciproque si regles de confidentialite

## 4) Anti-abus / anti-spam

- rate-limit sur envoi de demandes et recherche d'utilisateurs
- cooldown (ex: une demande par jour vers le meme user)
- detection de patterns (trop de demandes refusees)

Securite liee :

- limiter l'enumeration d'utilisateurs (reponses neutres)
- logs d'activite pour audit

## 5) Exposition API / donnees

Endpoints proposes :

- `GET /friends` : liste d'amis
- `GET /friends/requests` : demandes entrantes/sortantes

Securite liee :

- ne pas exposer plus que necessaire
- pagination + filtres pour eviter extraction massive
- erreurs uniformes (ne pas reveler si un user existe)

## 6) UI minimale

- recherche d'utilisateurs + bouton "Ajouter"
- liste d'amis + actions
- demandes entrantes/sortantes

Securite liee :

- UI ne remplace pas les verifs serveur
- afficher clairement les etats (`pending`, `accepted`, `blocked`)
