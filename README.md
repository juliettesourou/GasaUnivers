# GasaUnivers – Guide d’installation (Front + Back)

Ce projet contient:
- Frontend React + TypeScript (Vite)
- Backend Node.js + Express + MongoDB (dossier `back-api`)

## Prérequis
- Node.js ≥ 18 (recommandé)
- npm
- MongoDB Community Server (local)

## Backend (back-api)
1. Installer les dépendances:
```bash
cd back-api
npm install
```
2. Configurer l’environnement:
```bash
cp .env.example .env
# Éditer .env
# MONGO_URI=mongodb://127.0.0.1:27017/gasaunivers
# PORT=5000
# JWT_SECRET=change_this_secret
```
3. Appliquer le schéma (validateurs + index):
```bash
npm run db:schema
```
4. Lancer en développement:
```bash
npm run dev
# API disponible sur http://localhost:5000
```
5. Tests d’intégration:
```bash
npm test
```

Endpoints principaux:
- POST `/api/auth/register` → crée un utilisateur (name, email, password, role)
- POST `/api/auth/login` → renvoie `{ token, user }`
- GET/POST `/api/promotions` (JWT requis)
- GET `/api/promotions/:id/students` (JWT requis)
- GET/POST/PUT/DELETE `/api/users` (JWT requis)

## Frontend
1. Installer les dépendances (à la racine):
```bash
npm install
```
2. Configurer l’URL de l’API:
```bash
echo 'VITE_API_BASE=http://localhost:5000' > .env.local
```
3. Lancer le serveur de dev (Vite):
```bash
npm run dev
# Front disponible sur http://127.0.0.1:5173
```

Identifiants de test:
- Email: `e2e-admin@example.com`
- Mot de passe: `Admin123!`

## Vérification MongoDB (mongosh)
```bash
mongosh
use gasaunivers
show collections
db.users.find({}, { password: 0 }).pretty()
db.promotions.find().pretty()
```

## Dépannage
- Page blanche via proxy/Apache: ouvrez `http://127.0.0.1:5173` (pas `localhost`), ou ajoutez une exception dans votre proxy pour les adresses locales.
- Conflits de ports Vite (5173): arrêter les instances existantes (ex: `fuser -k 5173/tcp`) et relancer.
- Authorization: les requêtes protégées doivent inclure `Authorization: Bearer <token>`.

## Scripts utiles
- Front:
  - `npm run dev` – démarre Vite
  - `npm run build` – build du front
  - `npm run preview` – prévisualisation du build
- Back (`back-api`):
  - `npm run dev` – démarre l’API en dev
  - `npm run db:schema` – applique schémas et index MongoDB
  - `npm test` – lance les tests d’intégration

## Noteshttps://prod.liveshare.vsengsaas.visualstudio.com/join?5BA8D188F1593A8F5254CFD169B8B92CA9E0%
- Le front utilise `import.meta.env.VITE_API_BASE` pour l’adresse de l’API.
- L’API nécessite MongoDB en local et un `JWT_SECRET` défini dans `.env`.


npm run dev -- --port 5174

juliettesounouvou@MacBook-Air-de-Juliette novo % cd /Users/juliettesounouvou/novo/back-api && npm run dev
