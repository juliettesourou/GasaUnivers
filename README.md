# DevCore – Résumé & démarrage

Projet full‑stack pour la gestion universitaire:
- Frontend: React + TypeScript (Vite)
- Backend: Node.js + Express + MongoDB (dans `back-api`)

## Ce qu’il faut utiliser
- Node.js ≥ 18 et npm
- MongoDB (serveur local)
- Variables d’environnement:
  - Backend (`back-api/.env`):
    - `MONGO_URI=mongodb://127.0.0.1:27017/gasaunivers`
    - `PORT=5000`
    - `JWT_SECRET=change_this_secret`
  - Frontend (racine):
    - `VITE_API_BASE=http://localhost:5000`

## Démarrer le projet (développement)

1) Démarrer l’API (terminal 1)
```zsh
cd back-api
npm install
cp .env.example .env    # ou créez .env et placez MONGO_URI/JWT_SECRET/PORT
npm run db:schema       # applique validateurs & index MongoDB (optionnel mais recommandé)
npm run dev             # API sur http://localhost:5000
```

2) Démarrer le Front (terminal 2)
```zsh
npm install
echo 'VITE_API_BASE=http://localhost:5000' > .env.local
npm run dev             # Front sur http://127.0.0.1:5173
```

## Parcours admin → formateur
- Le directeur (admin) crée le compte formateur via la page “Formateurs”.
- Le formateur se connecte avec l’email et le mot de passe définis.
- Le tableau de bord formateur permet de créer et gérer les travaux; l’assignation se consulte via “Voir assignations”.
- La gestion des formateurs et des espaces pédagogiques (créer/modifier/supprimer) est réservée au directeur.

## Tests backend (optionnel)
```zsh
npm run test --prefix back-api
```

## Dépannage rapide
- Si le front n’arrive pas à joindre l’API: vérifiez `VITE_API_BASE` et que l’API tourne sur `http://localhost:5000`.
- Conflit de port Vite 5173: relancez `npm run dev` ou changez de port (`npm run dev -- --port 5174`).
- Requêtes protégées: fournissez `Authorization: Bearer <token>` (token obtenu via `/api/auth/login`).

juliettesounouvou@MacBook-Air-de-Juliette back-api % # Frontend
cd /Users/juliettesounouvou/Desktop/riri/happy/NODE
npm i

# Backend
cd /Users/juliettesounouvou/Desktop/riri/happy/NODE/back-api
npm i

juliettesounouvou@MacBook-Air-de-Juliette back-api % # Frontend
cd /Users/juliettesounouvou/Desktop/riri/happy/NODE
npm i

# Backend
cd /Users/juliettesounouvou/Desktop/riri/happy/NODE/back-api
npm i


# Mettre à jour vos références distantes:
git fetch --all --prune

git branch -a



# Construire et lancer les services:
docker compose build
docker compose up -d


# Arrêt:

docker compose down

#
