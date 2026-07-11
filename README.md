# EmployraRH

> Plateforme **RH & Paie tout-en-un**, mondiale — gestion des employés, paie conforme multi-devises, présence, talents, bien-être et collaboration, le tout dans une seule application web (PWA).

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue?logo=githubactions&logoColor=white)](https://github.com/MrOnesim/EmployePro/actions)
[![License](https://img.shields.io/badge/license-ISC-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](./RELEASE-1.0.md)
[![Node](https://img.shields.io/badge/node-22%2B-green.svg)](https://nodejs.org)
[![Stack](https://img.shields.io/badge/backend-NestJS%2011-red.svg)](https://nestjs.com)
[![Stack](https://img.shields.io/badge/frontend-React%2019-61dafb.svg)](https://react.dev)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)](./RELEASE-1.0.md)
[![Tests](https://img.shields.io/badge/tests-558%20%2F%20558%20passing-brightgreen.svg)](./backend)
[![Docs](https://img.shields.io/badge/docs-guides%20%26%20audit-blue.svg)](./docs)

**EmployraRH** est une solution SaaS RH & Payroll mondiale pour les PME et ETI. Elle couvre l'ensemble du cycle de vie de l'employé : recrutement, onboarding, présence (QR code, borne, selfie, géolocalisation), congés, paie multi-devises, déclarations fiscales, signature électronique, bien-être, récompenses, gestion du matériel et collaboration d'équipe — avec un assistant IA intégré et un mode hors ligne (PWA).

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Développement local](#développement-local)
- [Variables d'environnement](#variables-denvironnement)
- [Tests](#tests)
- [Documentation de l'API](#documentation-de-lapi)
- [Déploiement en production](#déploiement-en-production)
- [Guides & opérations](#guides--opérations)
- [CI/CD](#cicd)
- [Sécurité](#sécurité)
- [État du projet](#état-du-projet)
- [Contribution](#contribution)
- [Licence](#licence)

---

## Fonctionnalités

### 🧑‍💼 RH (Gestion des employés)

- CRUD complet des employés (création, lecture, mise à jour, suppression)
- Filtres & recherche combinés multi-critères, pagination (20 / 50 / 100)
- Import/export CSV, fiche employé détaillée (documents, congés, paies, équipements)
- Gestion des équipes, organigramme (`OrgChartPage`), statuts (actif, inactif, congé, suspension)
- Rôles & permissions granulaires (RBAC) par rôle

### 💰 Paie (Payroll)

- Configuration de paie multi-pays, calcul automatique du salaire brut, cotisations sociales, impôt à la source (PAS)
- Génération de fiches de paie PDF, mise à disposition sur le portail employé
- Historique des bulletins (plusieurs années), primes & bonus, heures supplémentaires
- Virement bancaire, relevés bancaires (`BankingPage`, `FintechPage`)

### ⏱️ Temps (Présence & Congés)

- Pointage entrée/sortie par **QR code** signé et horodaté (`QRScanPage`, `QRDisplayPage`)
- Feuilles de présence, historique des pointages par employé
- Demande de congés, workflow de validation hiérarchique, solde (acquis / pris / restant)
- Types de congés paramétrables, règles d'acquisition (CP 2,5 j/mois, RTT)
- Calendrier des absences et des réunions (`CalendarPage`, `MeetingPage`)

### 🎯 Talents (Recrutement & Performance)

- Dépôt d'offres d'emploi, candidatures, suivi du statut (sourcing → entretien → offre)
- Pipelines de recrutement (`RecruitmentPage`), grilles d'évaluation
- Performance & objectifs (`PerformancePage`, `ObjectivesPage`)
- Formations, quiz & certificats (`TrainingPage`)

### 🌿 Bien-être (Wellness)

- Sondages de bien-être anonymes (`WellnessPage`)
- Scores d'équipe et tableaux de bord de santé organisationnelle

### 🏦 Financier

- Avances sur salaire, transferts, coffre-fort numérique (`FintechPage`, `EmployeeVaultPage`)
- Suivi des notes de frais et rapports (`MissionsPage`, `ReportsPage`)

### 🎁 Récompenses

- Système de points et catalogue de récompenses (`RewardsPage`)

### 🖥️ Matériel

- Gestion des équipements et affectations (`EquipmentPage`)

### ✍️ Signature électronique

- Templates de documents (contrat, avenant, convention), envoi sécurisé par email
- Suivi du statut (envoyé / ouvert / signé / refusé), signature via canvas (`SignaturePage`)
- Garde sécurisé & terminaux de pointage (`SecurityGuardsPage`, `GuardScanPage`, `AdminQRCodeSettings`)

### 💬 Collaboration

- Messagerie privée & de groupe (`MessagesPage`), réunions & visioconférence
- Feed social d'équipe (`FeedPage`), centre de notifications (`NotificationsPage`)

### 🤖 IA Assistant

- Assistant RH intelligent avec règles NLP (`AIAssistant`, `src/ai/`)

---

## Tech Stack

### Frontend

| Technologie                  | Usage                           |
| ---------------------------- | ------------------------------- |
| **React 19**                 | UI (avec `react-router-dom` v7) |
| **TypeScript 5.9**           | Typage statique                 |
| **Tailwind CSS v4**          | Styling (`@tailwindcss/vite`)   |
| **Vite 7**                   | Build & dev server              |
| **Recharts**                 | Graphiques                      |
| **Lucide React**             | Icônes                          |
| **Framer Motion**            | Animations                      |
| **i18next**                  | Internationalisation            |
| **jsPDF / jsPDF-autotable**  | Export PDF                      |
| **Axios**                    | Client HTTP                     |
| **Playwright**               | Tests E2E                       |
| **Vitest + Testing Library** | Tests unitaires                 |

### Backend

| Technologie                             | Usage                                          |
| --------------------------------------- | ---------------------------------------------- |
| **NestJS 11**                           | Framework API (modulaire, DI)                  |
| **Prisma 6**                            | ORM & migrations (PostgreSQL)                  |
| **PostgreSQL 16**                       | Base de données                                |
| **Better Auth**                         | Authentification (JWT, OAuth Google/Microsoft) |
| **Swagger**                             | Documentation OpenAPI (`@nestjs/swagger`)      |
| **Helmet**                              | Sécurité des en-têtes HTTP                     |
| **@nestjs/throttler**                   | Rate limiting                                  |
| **class-validator / class-transformer** | Validation des DTOs                            |
| **Nodemailer / @nestjs-modules/mailer** | Emails transactionnels (SMTP)                  |
| **Vitest**                              | Tests unitaires                                |
| **bcryptjs**                            | Hash des mots de passe                         |

### Infrastructure

| Technologie                 | Usage                                |
| --------------------------- | ------------------------------------ |
| **Docker / Docker Compose** | Conteneurisation (multi-stage)       |
| **Nginx 1.27**              | Reverse proxy, TLS, compression, CSP |
| **Playwright**              | Tests de bout en bout                |
| **GitHub Actions**          | CI/CD                                |

---

## Architecture

```mermaid
flowchart LR
  subgraph Client
    FE[Frontend React 19<br/>Nginx :80]
  end
  subgraph API
    BE[Backend NestJS 11<br/>:3000]
    SW[Swagger /api/docs]
  end
  subgraph Data
    DB[(PostgreSQL 16)]
    PR[Prisma ORM]
  end

  FE -- "/api/* (proxy)" --> BE
  BE -- "Better Auth (JWT)" --> FE
  BE --> PR --> DB
  BE --> SW
```

Vue simplifiée (ASCII) :

```
┌─────────────────────┐      ┌──────────────────────────┐      ┌──────────────────┐
│  Frontend (React)   │      │   Backend (NestJS)        │      │  PostgreSQL 16   │
│  Nginx :80          │─────▶│   :3000                   │─────▶│  Prisma Client   │
│  Vite build / dist  │/api/ │   Controllers → Services  │      │                  │
└─────────────────────┘      │   Swagger /api/docs       │      └──────────────────┘
                             └──────────────────────────┘
```

Structure du code :

- `src/pages/` — ~50 pages (lazy loading) : employés, paie, congés, présence, recrutement, signature, IA…
- `src/context/` — `AuthContext`, `DataContext`, `AppContext`, `ThemeContext`, `ToastContext`
- `src/components/` — composants réutilisables
- `src/utils/` — utilitaires (format, permissions, eventBus, pdfExport, salary)
- `src/ai/` — règles NLP de l'assistant IA
- `src/types/` — types TypeScript
- `backend/src/` — modules NestJS (employees, attendance, leave, payroll, signature, recruitment, conversation, notification…)
- `backend/prisma/` — `schema.prisma` et seeds

---

## Prérequis

- **Node.js 22+** (et npm 10+)
- **PostgreSQL 16** (ou utiliser le service `db` du docker-compose)
- **Docker & Docker Compose** (recommandé pour le déploiement et la base de données)
- **Git**

---

## Développement local

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # renseigner DATABASE_URL, BETTER_AUTH_SECRET, QR_SECRET...
npx prisma migrate dev        # appliquer les migrations et générer le client
npm run start:dev             # démarre le backend sur http://localhost:3000
```

### 2. Frontend

```bash
npm install
cp .env.example .env          # définir VITE_API_BASE_URL (/api en local via proxy nginx, ou http://localhost:3000)
npm run dev                   # démarre Vite sur http://localhost:5173
```

### 3. Base de données via Docker (option)

```bash
npm run db:up                 # démarre uniquement le service PostgreSQL (docker compose up -d db)
```

### Scripts utiles (racine)

| Commande                          | Description                              |
| --------------------------------- | ---------------------------------------- |
| `npm run dev`                     | Serveur de dev Vite                      |
| `npm run build`                   | Build de production                      |
| `npm run typecheck`               | Vérification TypeScript (`tsc --noEmit`) |
| `npm run lint`                    | ESLint                                   |
| `npm run test`                    | Tests unitaires (Vitest)                 |
| `npm run format`                  | Prettier                                 |
| `npm run check`                   | CI locale (typecheck + lint + test)      |
| `npm run backend:dev`             | Démarre le backend en mode watch         |
| `npm run backend:prisma:generate` | Génère le client Prisma                  |

---

## Variables d'environnement

### Backend (`backend/.env`)

| Variable                  | Description                                              | Exemple                                                    |
| ------------------------- | -------------------------------------------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`            | Connexion PostgreSQL (Prisma)                            | `postgresql://postgres:postgres@localhost:5432/employepro` |
| `PORT`                    | Port d'écoute du backend                                 | `3000`                                                     |
| `FRONTEND_URL`            | URL du frontend (CORS / callbacks)                       | `http://localhost:5173`                                    |
| `APP_BASE_URL`            | URL publique de l'application                            | `http://localhost:3000`                                    |
| `BETTER_AUTH_SECRET`      | Secret de signature des sessions JWT (≥ 32 caractères)   | `generate-a-random-secret`                                 |
| `BETTER_AUTH_URL`         | URL publique de Better Auth                              | `http://localhost:3000`                                    |
| `QR_SECRET`               | Secret de signature des tokens QR code (≥ 32 caractères) | `generate-another-random-secret`                           |
| `GOOGLE_CLIENT_ID`        | Client ID OAuth Google (optionnel)                       | —                                                          |
| `GOOGLE_CLIENT_SECRET`    | Secret OAuth Google (optionnel)                          | —                                                          |
| `MICROSOFT_CLIENT_ID`     | Client ID OAuth Microsoft (optionnel)                    | —                                                          |
| `MICROSOFT_CLIENT_SECRET` | Secret OAuth Microsoft (optionnel)                       | —                                                          |
| `SMTP_HOST`               | Hôte SMTP pour les emails                                | `smtp.example.com`                                         |
| `SMTP_PORT`               | Port SMTP                                                | `587`                                                      |
| `SMTP_USER`               | Utilisateur SMTP                                         | `noreply@example.com`                                      |
| `SMTP_PASS`               | Mot de passe SMTP                                        | —                                                          |
| `SMTP_FROM`               | Adresse d'expédition                                     | `EmployéPro <noreply@example.com>`                         |

### Frontend (`.env`)

| Variable            | Description                                 | Exemple                                        |
| ------------------- | ------------------------------------------- | ---------------------------------------------- |
| `VITE_API_BASE_URL` | Base URL de l'API consommée par le frontend | `/api` (prod) ou `http://localhost:3000` (dev) |

### Docker (`.env` racine)

| Variable             | Description                         | Défaut                                                |
| -------------------- | ----------------------------------- | ----------------------------------------------------- |
| `APP_BASE_URL`       | URL publique (frontend + auth)      | `http://localhost`                                    |
| `DATABASE_URL`       | Connexion PostgreSQL (service `db`) | `postgresql://employepro:changeme@db:5432/employepro` |
| `DB_USER`            | Utilisateur PostgreSQL              | `employepro`                                          |
| `DB_PASSWORD`        | Mot de passe PostgreSQL             | `changeme`                                            |
| `DB_NAME`            | Nom de la base                      | `employepro`                                          |
| `BETTER_AUTH_SECRET` | Secret Better Auth                  | `replace-with-a-32-char-secret`                       |
| `QR_SECRET`          | Secret QR code                      | `replace-with-a-second-32-char-secret`                |
| `VITE_API_BASE_URL`  | Base URL API (build frontend)       | `/api`                                                |

> ⚠️ **Sécurité** : ne commitez jamais de fichiers `.env`. Les valeurs par défaut du docker-compose (`changeme`, `change-me-in-production`) sont à remplacer impérativement en production.

---

## Tests

### Backend — tests unitaires

```bash
cd backend
npm run test            # exécute la suite Vitest (services, controllers…)
npm run test:watch      # mode watch
```

### Frontend — tests unitaires

```bash
npm run test            # Vitest run
npm run test:watch      # mode watch
```

### E2E — Playwright

Les tests de bout en bout se trouvent dans `e2e/` (auth, employés, admin, formulaires, pages publiques).

```bash
npm ci
npx playwright install --with-deps   # installation des navigateurs
npm run build
npx playwright test                  # exécution des tests E2E
```

> ℹ️ La CI utilise `npx playwright test`. Vous pouvez ajouter un script `test:e2e` alias si besoin (`"test:e2e": "playwright test"`).

---

## Documentation de l'API

L'API REST est documentée automatiquement avec **Swagger / OpenAPI** :

- **Swagger UI** : `http://localhost:3000/api/docs` (en local)
- **Health check** : `http://localhost:3000/api/health`

Tous les contrôleurs sont annotés (`@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`) et les DTOs documentés (`@ApiProperty`). L'authentification utilise un bearer JWT Better Auth.

---

## Déploiement en production

L'application se déploie entièrement via **Docker Compose** (frontend Nginx, backend NestJS, PostgreSQL).

### Étapes

1. **Préparer l'environnement**

   ```bash
   cp .env.example .env
   ```

   Renseignez `APP_BASE_URL`, `DATABASE_URL`, `DB_PASSWORD`, `BETTER_AUTH_SECRET` et `QR_SECRET` avec des valeurs sécurisées.

2. **Construire et démarrer**

   ```bash
   docker compose up -d --build
   ```

   Cela va :
   - builder le frontend (multi-stage → Nginx)
   - builder le backend (Prisma generate + `nest build`) et appliquer les migrations (`prisma migrate deploy`)
   - démarrer PostgreSQL 16 avec un volume persistant (`pgdata`)

3. **Accéder à l'application**

   Ouvrez **http://localhost** (le frontend sert l'app sur le port 80 et proxifie `/api/` vers le backend).

4. **Vérifier la santé**

   ```bash
   curl http://localhost/api/health
   ```

### ⚠️ Avant la mise en production

- Changez **tous les mots de passe par défaut** (`DB_PASSWORD`, `changeme`).
- Remplacez `BETTER_AUTH_SECRET` et `QR_SECRET` par des secrets aléatoires ≥ 32 caractères.
- Configurez un nom de domaine et un certificat TLS (terminaison SSL recommandée devant Nginx).
- Pensez aux sauvegardes régulières du volume `pgdata`.

### Configuration Nginx

Le reverse proxy (`docker/nginx.conf`) active la compression Gzip, les en-têtes de sécurité (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`), une **Content-Security-Policy**, et proxifie `/api/` vers le backend en conservant les en-têtes de forwarding (utile pour Better Auth et les IPs réelles).

---

## Guides & opérations

| Document                                                   | Utilité                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| [`docs/GUIDE-ADMIN.md`](./docs/GUIDE-ADMIN.md)             | Déploiement, maintenance, sauvegardes, dépannage, rôles et configuration |
| [`docs/GUIDE-UTILISATEUR.md`](./docs/GUIDE-UTILISATEUR.md) | Prise en main employé : pointage, congés, paie, formations, mobile/PWA   |
| [`docs/SECURITE-AUDIT.md`](./docs/SECURITE-AUDIT.md)       | Préparation audit de sécurité (contrôles implémentés + points à auditer) |
| [`PRESENTATION-TECHNIQUE.md`](./PRESENTATION-TECHNIQUE.md) | Document commercial technique & fonctionnel (clients)                    |

### Sauvegardes & restauration

Scripts automatisés (aucune dépendance hors PostgreSQL) :

```bash
# Sauvegarde (Linux/macOS)
./scripts/backup.sh
# Sauvegarde (Windows PowerShell)
.\scripts\backup.ps1
# Restauration
./scripts/restore.sh backups/employepro_YYYYMMDD-HHMMSS.dump
```

La sauvegarde utilise `pg_dump --format=custom`, conserve 30 jours par défaut et
peut être planifiée (cron / Planificateur de tâches). Voir `docs/GUIDE-ADMIN.md`.

---

## CI/CD

La pipeline **GitHub Actions** (`.github/workflows/ci.yml`) s'exécute sur chaque `push` et `pull_request` vers `main` avec trois jobs :

| Job        | Étapes                                                           |
| ---------- | ---------------------------------------------------------------- |
| `frontend` | `npm ci` → `typecheck` → `lint` → `test` → `build`               |
| `backend`  | `npm ci` → `build` → `test` (Vitest)                             |
| `e2e`      | `npm ci` → installation Playwright → `build` → `playwright test` |

Tout merge vers `main` exige donc que le lint, le typecheck, les tests unitaires et les tests E2E soient au vert.

---

## Sécurité

EmployéPro intègre plusieurs couches de sécurité (voir `backend` & `docker/nginx.conf`) :

- **Helmet** : en-têtes de sécurité HTTP (`X-XSS-Protection`, `X-Content-Type-Options`, etc.) et **CSP** via Nginx.
- **CSRF / SameSite** : protection CSRF (double-submit cookie).
- **Rate limiting** : `@nestjs/throttler` pour limiter les requêtes abusives par IP.
- **RBAC** : rôles `SUPER_ADMIN`, `ADMIN`, `RH`, `MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE`, `SECURITY_GUARD` avec permissions granulaires et guards NestJS sur tous les endpoints protégés.
- **JWT** : sessions signées via Better Auth ; hash des mots de passe en bcrypt.
- **Validation** : DTOs validés (`class-validator`, whitelist) et `ParseUUIDPipe` sur les identifiants.
- **CORS** : liste blanche configurée (`FRONTEND_URL`).
- **Uploads** : validation du type et de la taille (max 10 Mo).

> 🔒 Consultez [`docs/SECURITE-AUDIT.md`](./docs/SECURITE-AUDIT.md) pour l'état des contrôles de sécurité et la préparation à un audit externe (2FA, chiffrement au repos, audit logs…).

---

## État du projet

EmployraRH est en **version 1.0.0 — production-ready** sur l'ensemble du périmètre :

- **38 modules métier** couvrant le cycle de vie RH complet
- **Backend testé** : 558 tests unitaires passants (Vitest, 41 fichiers)
- **Frontend testé** : tests unitaires (Vitest + Testing Library) + E2E (Playwright)
- **CI/CD** GitHub Actions (lint, typecheck, tests, build, e2e)
- **Déploiement** Docker Compose (frontend Nginx, backend NestJS, PostgreSQL, Redis)
- **Sécurité** : Helmet, CSRF, rate limiting, RBAC, RGPD, Sentry, validation des entrées
- **Disponibilité hors ligne** : PWA + file de synchronisation

Le périmètre fonctionnel et le suivi d'avancement sont détaillés dans **[RELEASE-1.0.md](./RELEASE-1.0.md)**.

> ⚠️ **Avant une mise en production critique** : prévoir un audit de sécurité externe
> (voir `docs/SECURITE-AUDIT.md`), l'activation de la 2FA pour les rôles admin, et un
> plan de reprise (PRA) testé.

---

## Contribution

Les contributions sont les bienvenues ! Merci de lire **[CONTRIBUTING.md](./CONTRIBUTING.md)** pour les règles de branchement, les conventions de commit et les exigences de PR.

En résumé :

1. Forkez et créez une branche `feature/<nom>` (ou `fix/<nom>`).
2. Respectez les conventions de commit **Conventional Commits**.
3. Assurez-vous que la CI passe (lint, typecheck, tests, build, e2e).
4. Ouvrez une Pull Request vers `main` avec une description claire.

---

## Licence

Ce projet est distribué sous la licence **ISC**. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

---

<p align="center">
  <sub>EmployraRH — Plateforme RH & Paie tout-en-un · v1.0.0</sub>
</p>
