# DOCUMENT DE PRÉSENTATION TECHNIQUE & FONCTIONNELLE

## EmployraRH — Plateforme RH & Paie tout-en-un

---

## 1. CONTEXTE & PROBLÉMATIQUE

### Le problème

Les PME et ETI consacrent en moyenne 15 à 25 heures par mois à la gestion administrative des ressources humaines : pointage manuel des présences, calcul des fiches de paie, suivi des congés, gestion des missions et des notes de frais. Ces tâches sont aujourd'hui éparpillées entre des outils disparates (tableurs Excel, logiciels de paie monofonction, messagerie électronique, formulaires papier), créant des silos d'information, des erreurs de saisie répétitives et une absence de visibilité en temps réel pour les décideurs.

À cela s'ajoute la complexité croissante des obligations légales et fiscales : déclarations sociales (CNSS, IRPP, TVA, IS), contrat de travail, signatures électroniques conformes, et respect du RGPD pour les données personnelles des employés.

### La solution

EmployraRH est une plateforme unifiée de gestion des ressources humaines et de la paie qui centralise l'ensemble du cycle de vie de l'employé — de l'onboarding à la gestion des talents en passant par la paie, le temps de travail, et les déclarations fiscales. Accessible en SaaS, déployable sur site, et disponible en Progressive Web App (PWA) pour une utilisation mobile sans installation.

### Public cible

- **Directeurs RH** et **Responsables administratifs** (petites et moyennes organisations, 10-500 employés)
- **Dirigeants** et **DPO/CSA** souhaitant un outil conforme et auditable
- **Employés** utilisant l'application mobile pour pointer, poser des congés, consulter leurs bulletins de paie
- **Agents de sécurité** et **terminaux physiques** pour le pointage d'entrée/sortie

### Valeur ajoutée unique

| Critère                        | Concurrents traditionnels            | EmployraRH                                                                 |
| ------------------------------ | ------------------------------------ | -------------------------------------------------------------------------- |
| **Modules couverts**           | Paie OU RH OU pointage (silo)        | Tout-en-un (RH + Paie + Pointage + Déclarations + E-signature + Formation) |
| **Multi-devises & multi-pays** | Rare (souvent limité à un pays)      | Paramétrable par société (FCFA, EUR, USD, GBP)                             |
| **Mode déconnecté**            | Aucun (nécessite Internet permanent) | PWA avec cache IndexedDB + file de synchronisation                         |
| **Pointage multimodal**        | Badgeuse ou QR code uniquement       | QR code, saisie manuelle, NFC, selfie, géolocalisation                     |
| **OPEN DATA**                  | Formats propriétaires verrouillés    | Export PDF, JSON, accès API REST complet                                   |
| **RGPD by design**             | Optionnel ou absent                  | Journal d'accès RGPD, purge automatique, export/suppression compte         |
| **Coût mensuel (10 employés)** | 200-800 €/mois                       | Économique, open-core, pas de coût par employé                             |

---

## 2. FONCTIONNALITÉS DÉTAILLÉES

### 2.1. Module Utilisateur

**Inscription et connexion**

- Email + mot de passe (hashé avec bcryptjs, salt rounds configurables)
- Authentification via BetterAuth avec refresh token rotation
- Google OAuth 2.0 (client ID/secret configurables)
- Microsoft OAuth 2.0 (client ID/secret configurables)
- Protection CSRF : double-submit cookie + header, contourné pour `/api/auth/*`

**Gestion de profil**

- Photo, coordonnées, date de naissance, poste, département
- Historique des contrats (CDI, CDD, stage, freelance) avec dates
- Modification du mot de passe
- Export de ses données personnelles (RGPD article 20)
- Suppression du compte avec vérification du mot de passe

**Rôles et permissions (RBAC)**

| Rôle              | Accès                                             |
| ----------------- | ------------------------------------------------- |
| `SUPER_ADMIN`     | Administration système, multi-sociétés            |
| `ADMIN`           | Tous les modules, configuration, paie             |
| `RH`              | Gestion RH complète (employés, congés, documents) |
| `MANAGER`         | Équipe rattachée, approbations                    |
| `DEPARTMENT_HEAD` | Direction département, reporting                  |
| `EMPLOYEE`        | Vue personnelle (pointage, congés, bulletins)     |
| `SECURITY_GUARD`  | Pointage d'entrée/sortie via borne ou QR          |

### 2.2. Fonctionnalités principales (Core)

#### 2.2.1. Pointage et temps de travail

- **Méthodes disponibles** : QR code généré dynamiquement (token signé EP-XXXXXXXX), saisie manuelle du code, NFC (borne physique), scan biométrique (via agent de sécurité)
- **Flux employé** : arrive dans l'entreprise → scanne le QR code d'arrivée → pause déjeuner (QR lunch_start) → retour (QR lunch_end) → départ (QR departure)
- **Détection de retard** : après 9h00, statut marqué "late"
- **Géolocalisation optionnelle** : coordonnées GPS enregistrées à chaque scan
- **Selfie optionnel** : capture photo au pointage (via borne ou application)

#### 2.2.2. Gestion des congés et absences

- Types : annuel (22j par défaut), maladie (10j), maternité (90j), événement spécial (5j)
- Politique de congés personnalisable par société (stockée en localStorage et en base)
- Demande → validation par le manager/RH → mise à jour du solde
- Visualisation des soldes restants sur le dashboard employé
- Calendrier des absences pour l'équipe

#### 2.2.3. Paie et bulletins

- Calcul automatique : salaire de base + primes (5-15% variables) − déductions (15% forfaitaires)
- Prise en charge des heures supplémentaires (taux paramétrable)
- Génération de fiches de paie PDF (via jspdf + jspdf-autotable)
- Historique consultable par l'employé (3 derniers mois en données démo)
- Rubriques personnalisables via JSON (congés, avantages, retenues)

#### 2.2.4. Déclarations fiscales et sociales

- Types : IRPP (Impôt sur le Revenu), CNSS (Sécurité Sociale), TVA, IS (Impôt Société)
- Calcul automatique des cotisations sociales et fiscales
- Suivi des statuts : brouillon → soumis → payé
- Archivage par année fiscale

#### 2.2.5. Gestion des missions et notes de frais

- Création de mission (destination, dates, budget, transport)
- Workflow d'approbation : soumis → approuvé/rejeté → complété
- Rattachement des notes de frais (hôtel, repas, transport)
- Rapport de mission avec dépenses réelles

#### 2.2.6. E-signature

- Envoi de documents à signer (contrat, avenant, règlement intérieur, NDA)
- Statuts : brouillon → envoyé → signé → complété → refusé
- Modèles réutilisables avec champs dynamiques (nom, prénom, date, poste)
- Signature électronique avec conservation de l'image de signature

#### 2.2.7. Formation et développement des compétences

- Catalogue de cours (durée, instructeur, catégories)
- Inscription et progression par leçons
- Quiz avec notation (score minimal pour valider)
- Certificat de réussite généré automatiquement

#### 2.2.8. Recrutement et gestion des candidatures (ATS)

- Offres d'emploi : publication, statut (ouverte/fermée/brouillon)
- Pipeline candidat : reçu → entretien → accepté → refusé
- Planning d'entretien, CV et lettre de motivation
- Statistiques par offre (vues, candidatures)

#### 2.2.9. Évaluations et objectifs (OKR)

- Objectifs individuels et d'équipe avec échéances
- Statuts : en attente → en cours → terminé → annulé
- Revues de performance : notation, feedback, forces/axes d'amélioration
- Calendrier des revues

#### 2.2.10. Messagerie et collaboration

- Messagerie interne (conversations, messages texte/image/fichier)
- Création d'équipes (leader + membres)
- Fil d'actualité social (posts, likes, commentaires)
- Sondages bien-être (satisfaction, stress, motivation, charge de travail)

### 2.3. Fonctionnalités secondaires

#### Notifications

- **In-app** : 10 types (invitation, paiement, congé, pointage, paie, recrutement, objectif, review, contrat, document)
- **Email** : via Nodemailer + Handlebars (templates .hbs personnalisables)
- **SMTP** : serveur configurable (Host, Port, TLS, identifiants)
- Marquer comme lu / tout marquer comme lu
- Compteur de notifications non lues dans la barre de navigation

#### Export et import de données

| Donnée               | Export          | Import               |
| -------------------- | --------------- | -------------------- |
| Bulletins de paie    | PDF (jspdf)     | —                    |
| Listes employés      | —               | CSV (via ImportPage) |
| Données personnelles | JSON (RGPD)     | —                    |
| Toutes les données   | API REST (JSON) | API REST (JSON)      |
| Rapports             | PDF / JSON      | —                    |

#### Dashboard et statistiques

- Dashboard employé : heures travaillées (temps réel), congés restants, dernière paie, graphique hebdomadaire
- Dashboard admin : effectifs, absences en cours, paie du mois, présences du jour
- Graphiques Recharts (barres, lignes, secteurs) responsive
- Données en temps réel avec timer ticking

#### Intégrations tierces

| Service               | Usage                                      | Type                                |
| --------------------- | ------------------------------------------ | ----------------------------------- |
| **Google OAuth**      | Connexion SSO                              | API OAuth 2.0                       |
| **Microsoft OAuth**   | Connexion SSO                              | API OAuth 2.0                       |
| **Sentry**            | Monitoring d'erreurs (frontend + backend)  | SDK (@sentry/react, @sentry/nestjs) |
| **Redis**             | Cache distribué (30s TTL, 100 entrées max) | ioredis                             |
| **SMTP (Nodemailer)** | Envoi d'emails transactionnels             | Protocole SMTP                      |
| **Google Fonts**      | Typographie                                | CDN externe                         |

---

## 3. ARCHITECTURE TECHNIQUE

### 3.1. Stack Frontend

| Composant            | Technologie                                       | Version         |
| -------------------- | ------------------------------------------------- | --------------- |
| Framework UI         | **React**                                         | 19.2.6          |
| Langage              | **TypeScript**                                    | 5.9.3           |
| Bundler              | **Vite**                                          | 7.3.2           |
| Routeur              | **React Router DOM**                              | 7.17.0          |
| Gestion d'état       | **Context API** (React) sans bibliothèque externe |
| CSS                  | **Tailwind CSS**                                  | 4.1.17          |
| Icônes               | **Lucide React**                                  | 1.17.0          |
| Animations           | **Framer Motion**                                 | 12.40.0         |
| Graphiques           | **Recharts**                                      | 3.8.1           |
| Internationalisation | **i18next** + react-i18next                       | 26.3.1 / 17.0.8 |
| Génération PDF       | **jsPDF** + jspdf-autotable                       | 4.2.1 / 5.0.8   |
| QR code              | **qrcode.react**                                  | 4.2.0           |
| HTTP client          | **Axios**                                         | 1.18.1          |
| Auth client          | **BetterAuth (client)**                           | 1.6.23          |
| Monitoring           | **Sentry (React)**                                | 10.65.0         |

**Architecture de l'application :**

```
src/
├── components/       → Composants réutilisables (ui/landing/shared)
├── pages/            → 50+ pages lazy-loaded (React.lazy + Suspense)
├── context/          → AppContext (état global, mock data)
├── hooks/            → Hooks personnalisés (usePageMeta, usePageLoading)
├── services/         → 22 services API (REST)
├── types/            → 48 interfaces TypeScript
├── i18n/             → 3 langues (fr, en, ar)
├── lib/              → Configuration Axios (instance, intercepteurs)
└── test/             → Setup tests unitaires (Vitest + Testing Library)
```

**Code splitting** : chunks manuels pour vendor (React), charts (Recharts), animations (Framer Motion), icônes (Lucide), PDF (jsPDF). Pages chargées à la demande via `React.lazy()`.

### 3.2. Stack Backend

| Composant             | Technologie                             | Version |
| --------------------- | --------------------------------------- | ------- |
| Framework             | **NestJS**                              | 11.x    |
| Langage               | **TypeScript**                          | 5.7.x   |
| Exécution             | **Node.js**                             | 22.x    |
| ORM                   | **Prisma**                              | 6.x     |
| Authentification      | **BetterAuth (server)**                 | 1.2.0   |
| Documentation API     | **Swagger / OpenAPI** (@nestjs/swagger) | 11.4.5  |
| Validation            | **class-validator** + class-transformer | 0.14.x  |
| Hachage mots de passe | **bcryptjs**                            | 2.4.x   |
| Rate limiting         | **@nestjs/throttler**                   | 6.5.0   |
| Caching               | **cache-manager** + ioredis             | 7.2.x   |
| Emails                | **Nodemailer** + Handlebars             | 9.0.3   |
| Sécurité HTTP         | **Helmet**                              | 8.2.x   |
| CSRF                  | **csurf** (middleware custom)           | 1.11.x  |
| Monitoring            | **Sentry (NestJS)**                     | 10.65.0 |

**Architecture :** Monolithique modulaire — 38 modules NestJS organisés par domaine métier.

```
backend/src/
├── auth/                  → Authentification (BetterAuth + JWT)
├── common/                → Guards (AuthGuard), security, validation
├── cache/                 → Module Redis (30s TTL, graceful degradation)
├── mail/                  → Email (templates Handlebars)
├── gdpr/                  → RGPD : export, suppression, journal d'accès
├── employee/              → CRUD employés
├── leave/                 → Gestion des congés
├── attendance/            → Pointage avec 4 méthodes
├── payslip/               → Bulletins de paie PDF
├── payroll-config/        → Configuration paie par société
├── document/              → Documents employés
├── meeting/               → Réunions
├── notification/          → Notifications in-app
├── calendar-event/        → Événements calendrier
├── conversation/          → Messagerie
├── signature-request/     → E-signature
├── mission/               → Missions professionnelles
├── expense-report/        → Notes de frais
├── course/                → Formations
├── quiz/                  → Quiz
├── job-offer/             → Offres d'emploi
├── candidate/             → Candidatures (ATS)
├── objective/             → Objectifs (OKR)
├── performance-review/    → Évaluations
├── equipment/             → Matériel
├── wellness-survey/       → Enquêtes bien-être
├── tax-declaration/       → Déclarations fiscales
├── security-guard/        → Agents de sécurité
├── qr-token/              → QR codes session
├── terminal/              → Bornes de pointage
└── invitation/            → Invitations employés
```

**API :** RESTful avec documentaiton Swagger accessible sur `/api/docs`. Préfixe global `/api`. Sérialisation JSON.

### 3.3. Base de Données

| Composant  | Technologie                                      |
| ---------- | ------------------------------------------------ |
| SGBD       | **PostgreSQL 16** (Alpine en production)         |
| ORM        | **Prisma 6** (type-safe, migrations versionnées) |
| Cache      | **Redis 7** (Alpine) — 30s TTL, 100 entrées max  |
| Migrations | Prisma Migrate (2 migrations existantes)         |
| Seed       | Script TypeScript — société dém + 4 employés     |

**Schéma de données :** 35 tables modélisées dans `schema.prisma` avec 52 index. Entités principales :

```
Company (1) ──< Member (N) ──< User
    │                            │
    ├──< Employee (N)            ├──< Session (N)
    ├──< LeavePolicy             ├──< Account (OAuth) (N)
    ├──< PayrollConfig           └──< Verification (N)
    ├──< JobOffer ──< Candidate
    └──< CalendarEvent
         ───< SecurityGuard
         ───< Terminal
         ───< Invitation

Employee ──< Attendance      Employee ──< Leave
Employee ──< Payslip         Employee ──< Document
Employee ──< Mission         Employee ──< ExpenseReport
Employee ──< Objective       Employee ──< PerformanceReview
Employee ──< Equipment       Employee ──< EquipmentAssignment
└───< WellnessResponse       Employee ──< Course (via Enrollment)
Employee ──< QuizAttempt     Employee ──< Certificate
Employee ──< SalaryAdvance   Employee ──< SalaryTransfer
Employee ──< Conversation    Employee ──< SignatureRecipient (via SignatureRequest)
Employee ──< BankAccount     Employee ──< EmployeeVaultItem
Employee ──< RewardTransaction
```

### 3.4. Infrastructure & Hébergement

```
                        ┌──────────────┐
                        │   Utilisateur │
                        └──────┬───────┘
                               │ HTTPS
                  ┌────────────┼────────────┐
                  │            │            │
          ┌───────┴──────┐    │    ┌───────┴──────┐
          │  Navigateur   │    │    │   Mobile     │
          │  (PWA)        │    │    │  (PWA)       │
          └───────┬──────┘    │    └───────┬──────┘
                  │            │            │
                  └────────────┼────────────┘
                               │
                     ┌─────────┴─────────┐
                     │      Nginx         │
                     │   (reverse proxy)  │
                     │   + gzip + cache   │
                     └─────────┬─────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
  ┌───────┴───────┐   ┌───────┴───────┐   ┌───────┴───────┐
  │   Frontend    │   │   Backend     │   │    Redis      │
  │ (Statique)    │   │ (NestJS)      │   │  (Cache)      │
  │   Port 80     │   │   Port 3000   │   │   Port 6379   │
  └───────────────┘   └───────┬───────┘   └───────────────┘
                              │
                     ┌───────┴───────┐
                     │  PostgreSQL   │
                     │   Port 5432   │
                     │  (Volume)     │
                     └───────────────┘
```

| Composant            | Technologie              | Détails                                             |
| -------------------- | ------------------------ | --------------------------------------------------- |
| **Conteneurisation** | Docker Compose           | 4 services (frontend, backend, redis, db)           |
| **Frontend runtime** | Nginx 1.27-alpine        | Static files, SPA fallback, gzip, cache 1 an        |
| **Backend runtime**  | Node 22-alpine           | NestJS production, port 3000                        |
| **Base de données**  | PostgreSQL 16-alpine     | Volume persistant `pgdata`                          |
| **Cache**            | Redis 7-alpine           | Cache distribué, sessions si besoin                 |
| **CI/CD**            | GitHub Actions           | 3 jobs parallèles (frontend, backend, e2e)          |
| **Monitoring**       | Sentry                   | Frontend (React) + Backend (NestJS)                 |
| **Images**           | Optimisation automatique | WebP generation (quality 80) via sharp en postbuild |

**Démarrage :**

```bash
# Infra complète
docker compose up -d

# Développement local (base de données uniquement)
npm run db:up
cd backend && npm run dev
npm run dev          # frontend : 5173
```

---

## 4. SÉCURITÉ & PERFORMANCE

### 4.1. Sécurité

| Couche                 | Mesures                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Authentification**   | BetterAuth avec refresh token rotation (hashé en base)                                                      |
| **Mots de passe**      | Hash bcryptjs (salt 10 rounds), longueur minimale 8                                                         |
| **OAuth**              | Google + Microsoft (scopes configurables)                                                                   |
| **Protection CSRF**    | Double-submit cookie + header (sauf auth endpoints)                                                         |
| **Rate limiting**      | 100 requêtes / 60 secondes par IP (behind proxy)                                                            |
| **En-têtes HTTP**      | Helmet : HSTS (1 an, preload), X-Frame-Options DENY, CSP, nosniff, referrer-policy                          |
| **CSP**                | `default-src 'self'` ; scripts, styles, connect-src 'self' ; images self+data+blob+https                    |
| **CORS**               | Origine configurable avec credentials                                                                       |
| **Validation entrées** | class-validator (whitelist, forbidNonWhitelisted, transform)                                                |
| **Environnement**      | Validation au démarrage : HTTPS en prod, secrets ≥ 32 chars                                                 |
| **RGPD**               | Journal d'accès (actorId, targetUserId, action), purge automatique (1095j), export JSON, suppression compte |
| **PWA sécurité**       | API en NetworkOnly (aucune donnée PII en cache)                                                             |
| **Pointage QR**        | Token signé avec secret dédié, session temporelle                                                           |

### 4.2. Performance

| Indicateur                      | Objectif            | Mesure                                     |
| ------------------------------- | ------------------- | ------------------------------------------ |
| **Temps de chargement initial** | < 2s                | Code splitting + lazy loading routes       |
| **Taille bundle critique**      | ~170 KB gzip        | Vendor chunk séparé, async chunks          |
| **Temps de réponse API**        | < 200 ms            | Cache Redis 30s, connexion PostgreSQL pool |
| **First Contentful Paint**      | < 1.5s              | PWA, préchargement, Tailwind purged        |
| **Temps de build**              | < 60s (cible : 30s) | SWC compiler, esbuild minifier             |
| **Disponibilité**               | 99.9%               | Docker healthchecks, restart always        |
| **Débit API**                   | 100 req/min/IP      | Rate limiting @nestjs/throttler            |

### 4.3. Sauvegarde et PRA

- **Volume PostgreSQL** persistant (`pgdata`) avec Docker
- **Migrations** versionnées (Prisma Migrate) : rollback possible
- **Code source** : versionné sur GitHub, CI/CD GitHub Actions
- **Environnements** : même Docker Compose pour dev/staging/prod (variables d'environnement différentes)
- **Monitoring Sentry** : alertes en cas d'erreur backend/frontend

### 4.4. Scalabilité

- **Verticale** : augmentation des ressources Docker (CPU/RAM) — architecture monolithique
- **Horizontale** : le backend NestJS peut être répliqué derrière un load balancer (stateless via Redis)
- **Base de données** : PostgreSQL 16 avec indexation complète (52 index)
- **Frontend** : statique, derrière Nginx — mise à l'échelle horizontale immédiate

---

## 5. INTÉGRATIONS & API EXTERNES

| Service                 | Utilité                         | Type d'appel    | Coût                                            | Contraintes                               |
| ----------------------- | ------------------------------- | --------------- | ----------------------------------------------- | ----------------------------------------- |
| **Google OAuth 2.0**    | Connexion SSO utilisateur       | Sync (redirect) | Gratuit (quota API OAuth)                       | Client ID/Secret requis                   |
| **Microsoft OAuth 2.0** | Connexion SSO utilisateur       | Sync (redirect) | Gratuit (quota API OAuth)                       | Client ID/Secret requis                   |
| **Sentry**              | Monitoring d'erreurs production | Async (SDK)     | Gratuit (5000 events/mois), payant au-delà      | DSN requis, sample rate 0.1               |
| **Redis**               | Cache distribué                 | Sync (ioredis)  | Gratuit (self-hosted) ou ~10-30€/mois (managed) | Non bloquant : le système fonctionne sans |
| **Nodemailer / SMTP**   | Envoi emails transactionnels    | Async (SMTP)    | Variable selon prestataire SMTP                 | Serveur SMTP requis                       |
| **Google Fonts**        | Typographie (Inter, etc.)       | CDN             | Gratuit                                         | Connexion Internet requise                |
| **BetterAuth**          | Authentification + sessions     | Sync (HTTP)     | Gratuit (open source)                           | Serveur BetterAuth requis                 |

**API REST autoconsommée** : le frontend communique exclusivement avec l'API backend via Axios. Pas de dépendance à des API métier tierces pour le fonctionnement nominal.

---

## 6. DÉVELOPPEMENT & MAINTENANCE

### 6.1. Méthodologie et outils

| Aspect                | Choix                                                       |
| --------------------- | ----------------------------------------------------------- |
| **Méthodologie**      | Agile / Kanban (adapté à la taille de l'équipe)             |
| **Gestion de projet** | GitHub Issues + Projects                                    |
| **Versionnement**     | GitFlow simplifié (branche `main`, feature branches)        |
| **Code review**       | Pull Requests obligatoires sur `main`                       |
| **Conventions**       | ESLint (flat config) + Prettier (lint-staged en pre-commit) |
| **Commit**            | Husky → lint-staged → ESLint fix + Prettier                 |

### 6.2. Tests

| Type                      | Outil                    | Coverage minimum    | Cible                                                             |
| ------------------------- | ------------------------ | ------------------- | ----------------------------------------------------------------- |
| **Unitaires (frontend)**  | Vitest + Testing Library | 70%                 | Composants React, hooks, helpers                                  |
| **Unitaires (backend)**   | Vitest                   | 80%                 | Services métier, guards, contrôleurs                              |
| **Intégration (backend)** | Vitest (NestJS testing)  | 60%                 | Modules avec base de données                                      |
| **E2E (full stack)**      | Playwright               | Scénarios critiques | 6 scénarios (admin, employee, auth, landing, forms, public pages) |

**Commandes :**

```bash
npm test              # Tests unitaires frontend
cd backend && npm test # Tests unitaires backend
npx playwright test    # Tests E2E (headless)
```

### 6.3. Stratégie de déploiement

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Dev (local) │────>│ Staging (CI) │────>│  Production  │
│  npm run dev  │     │  GitHub CI   │     │  Docker      │
│  hot reload   │     │  tests +     │     │  Compose     │
│  PostgreSQL   │     │  typecheck   │     │  PostgreSQL  │
│  locale       │     │  + lint +    │     │  + Redis     │
│               │     │  build       │     │  + Nginx     │
└──────────────┘     └──────────────┘     └──────────────┘
```

**Pipeline CI/CD GitHub Actions (3 jobs parallèles) :**

1. **Frontend** : `npm ci` → typecheck → lint → test → build
2. **Backend** : `npm ci` → build → test
3. **E2E** : `npm ci` → Playwright install → build → test

### 6.4. Plan de maintenance

| Type                                     | Fréquence               | Contenu                                                     |
| ---------------------------------------- | ----------------------- | ----------------------------------------------------------- |
| **Corrective**                           | Au fil de l'eau         | Correction des bugs remontés par Sentry ou les utilisateurs |
| **Évolutive**                            | Par sprint (2 semaines) | Nouvelles fonctionnalités, améliorations UX                 |
| **Mises à jour dépendances**             | Mensuelle               | `npm audit`, mise à jour NestJS, React, Prisma              |
| **Sécurité**                             | Trimestrielle           | Revue des dépendances, test d'intrusion, mise à jour SSL    |
| **TMA (Tierce Maintenance Applicative)** | Optionnel               | SLA 8h ouvrées, hotfix sous 24h                             |

---

## 7. PLANNING & PHASES

### Phase 1 : MVP (J0 - J60)

**Objectif : plateforme fonctionnelle pour 1 société, 20 employés**

| Module                                                 | Statut   |
| ------------------------------------------------------ | -------- |
| Authentification (email + OAuth)                       | ✅ Livré |
| Gestion des employés (CRUD, rôles)                     | ✅ Livré |
| Pointage QR (4 types : arrivée, pause, retour, départ) | ✅ Livré |
| Congés (demande, approbation, soldes)                  | ✅ Livré |
| Bulletins de paie (génération, PDF)                    | ✅ Livré |
| Dashboard employé + admin                              | ✅ Livré |
| PWA (service worker, offline partiel)                  | ✅ Livré |
| Docker Compose (PostgreSQL, Redis, Nginx)              | ✅ Livré |

### Phase 2 : Version Beta (J61 - J120)

**Objectif : couverture fonctionnelle large, 1-3 sociétés pilotes**

| Module                                      | Statut   |
| ------------------------------------------- | -------- |
| Déclarations fiscales (IRPP, CNSS, TVA, IS) | ✅ Livré |
| Missions et notes de frais                  | ✅ Livré |
| E-signature (documents, modèles)            | ✅ Livré |
| Formations (cours, quiz, certificats)       | ✅ Livré |
| Recrutement (ATS, candidatures)             | ✅ Livré |
| Messagerie et équipes                       | ✅ Livré |
| Objectifs et évaluations (OKR)              | ✅ Livré |
| Gestion du matériel et équipements          | ✅ Livré |
| Banque salariale et avances                 | ✅ Livré |
| Notification et calendrier                  | ✅ Livré |
| i18n (français, anglais)                    | ✅ Livré |

### Phase 3 : Production (J121 - J180)

**Objectif : stabilité, performance, sécurité**

| Module                                      | Statut   |
| ------------------------------------------- | -------- |
| RGPD (export, suppression, purge, journal)  | ✅ Livré |
| Sentry monitoring                           | ✅ Livré |
| Cache Redis (graceful degradation)          | ✅ Livré |
| Email transactionnel (templates Handlebars) | ✅ Livré |
| Multidevises (FCFA, EUR, USD, GBP)          | ✅ Livré |
| Tests E2E Playwright (6 scénarios)          | ✅ Livré |
| CI/CD GitHub Actions (3 jobs)               | ✅ Livré |
| Documentation Swagger / OpenAPI             | ✅ Livré |
| Optimisation images WebP                    | ✅ Livré |
| PWA offline fallback                        | ✅ Livré |
| Enquêtes bien-être                          | ✅ Livré |
| Points et récompenses                       | ✅ Livré |
| Agent de sécurité et borne de pointage      | ✅ Livré |
| Coffre-fort numérique employé               | ✅ Livré |

### Roadmap évolutive (J180 - J540)

| Période     | Fonctionnalités                                                                               |
| ----------- | --------------------------------------------------------------------------------------------- |
| **T3 2026** | Paie automatisée (intégration banque SWIFT/SEPA), mutuelle santé connectée                    |
| **T4 2026** | Dashboard RH prédictif (turnover, absentéisme), API ouverte (webhooks)                        |
| **T1 2027** | Mobile natif (React Native), module paie multi-pays (paramétrage pays)                        |
| **T2 2027** | Marketplace RH (cours, modèles de contrats, connecteurs), IA générative (CV, fiches de poste) |

---

## 8. BUDGET ESTIMATIF

### 8.1. Infrastructure mensuelle (auto-hébergement)

| Ressource                    | Spécification                   | Coût estimé/mois |
| ---------------------------- | ------------------------------- | ---------------- |
| VPS / Serveur dédié          | 4 vCPU, 8 GB RAM, 100 GB SSD    | 30-60 €          |
| Nom de domaine               | .com / .fr / .io                | 1-2 €            |
| SMTP (Mailjet / SendGrid)    | 5000 emails/mois                | 10-15 €          |
| Sentry                       | Plan gratuit (5000 events/mois) | 0 €              |
| Base de données (PostgreSQL) | Inclus dans VPS                 | 0 €              |
| Cache Redis                  | Inclus dans VPS                 | 0 €              |
| **Total minimum**            |                                 | **~45 €/mois**   |

### 8.2. Coûts des services tiers

| Service        | Plan gratuit limite           | Plan payant                 |
| -------------- | ----------------------------- | --------------------------- |
| Sentry         | 5k events/mois, 1 utilisateur | 26 €/mois (team)            |
| Google OAuth   | Quota gratuit                 | —                           |
| SMTP           | 200 emails/jour (SendGrid)    | 10-50 €/mois                |
| Google Fonts   | Gratuit                       | —                           |
| GitHub Actions | 2000 min/mois (gratuit)       | À partir de 4 €/utilisateur |

### 8.3. Maintenance et support (optionnel)

| Type                | Forfait mensuel  | Inclus                              |
| ------------------- | ---------------- | ----------------------------------- |
| **Correctif**       | 300-500 €/mois   | Hotfix < 24h, mises à jour sécurité |
| **Évolutif (TMA)**  | 1000-2000 €/mois | Correctif + 20h/mois d'évolutions   |
| **Forfait support** | 200-400 €/mois   | Support téléphonique 8h/5j, SLA 8h  |

---

## 9. QUESTIONS FRÉQUENTES (FAQ technique)

### Q1 : Est-ce que je dois héberger moi-même ou pouvez-vous le faire ?

**Réponse :** Les deux options sont possibles. EmployraRH est livré avec Docker Compose prêt à l'emploi — vous pouvez le déployer sur n'importe quel serveur (OVH, AWS EC2, Hetzner, Scaleway). Nous pouvons aussi vous fournir un hébergement managé (SaaS) avec SLA. L'auto-hébergement vous donne un contrôle total sur vos données ; le SaaS vous évite la maintenance serveur.

### Q2 : Mes données RH sont sensibles. Comment sont-elles protégées ?

**Réponse :** La sécurité est notre priorité. Toutes les données sont chiffrées en transit (TLS/HTTPS) et au repos (PostgreSQL). L'authentification utilise des tokens JWT avec rotation, les mots de passe sont hachés avec bcryptjs. Nous sommes conformes RGPD : journal d'accès, export de ses données, suppression du compte, et purge automatique après 3 ans. Le code source peut être audité (open-core).

### Q3 : Peut-on importer nos données existantes (fiches de paie, employés) ?

**Réponse :** Oui. Le module d'import permet d'importer les listes d'employés depuis un fichier CSV. Pour les bulletins de paie et l'historique, nous proposons un accompagnement à la migration avec script sur mesure. L'API REST permet aussi d'importer les données par lots programmatiquement.

### Q4 : Fonctionne-t-il sans connexion Internet permanente ?

**Réponse :** Oui, partiellement. L'application est une PWA : une fois chargée, elle fonctionne avec un cache IndexedDB pour la consultation des données (employés, congés, bulletins). Les actions d'écriture (pointage, demande de congé) sont mises en file d'attente et synchronisées automatiquement quand la connexion revient. Le pointage par QR code nécessite une connexion pour générer/valider le code.

### Q5 : Combien de temps faut-il pour déployer et former mon équipe ?

**Réponse :**

- **Déploiement technique :** 1 à 2 jours (Docker Compose, configuration SMTP, OAuth)
- **Configuration :** 1 demi-journée (paramétrage société, politique de congés, rôles)
- **Import des données :** 1 à 2 jours selon le volume (accompagné)
- **Formation RH :** 2 heures (visioconférence ou sur site)
- **Formation employés :** 30 minutes (email de bienvenue + documentation intégrée)

### Q6 : Puis-je essayer avant d'acheter ?

**Réponse :** Absolument. La version démo est disponible sans engagement : créez un compte sur la plateforme, explorez tous les modules avec les données de démonstration (GlobalTech Solutions - 7 employés, pointages, congés, fiches de paie sur 3 mois). Vous pouvez tester la totalité des fonctionnalités sans carte bancaire.

### Q7 : Quels sont les formats de paie supportés ?

**Réponse :** La paie est calculée avec un moteur paramétrable : salaire de base + primes variables (5-15%) − déductions (15% par défaut). Le taux d'heures supplémentaires, les cotisations sociales et le taux d'imposition sont configurables par société. Les bulletins sont générés au format PDF avec jsPDF. Les devises supportées : FCFA (XOF/XAF), EUR, USD, GBP, et toute devise paramétrable. Un nouveau pays peut être ajouté en configurant les taux (pas de modification du code nécessaire pour les cas standards).

---

## 10. CONCLUSION & PROCHAINES ÉTAPES

### Forces du projet

- **Plateforme unifiée** : 38 modules métier couvrant l'intégralité du cycle de vie RH, de l'embauche à la paie
- **Prêt pour la production** : Docker Compose, CI/CD, monitoring Sentry, tests unitaires + E2E
- **Sécurité by design** : RGPD, CSRF, rate limiting, Helmet, validation en environnement, audit trail
- **Mode déconnecté** : PWA avec synchronisation automatique — utilisable dans des zones à connectivité intermittente
- **Flexibilité** : auto-hébergement ou SaaS, code open-core, API REST complète, multidevises
- **Modernité** : React 19, NestJS 11, Prisma 6, PostgreSQL 16, TypeScript strict, Vite 7
- **Expérience utilisateur** : Dashboard temps réel, responsive mobile, PWA, animations fluides, temps de chargement < 2s

### Démonstration

Nous proposons :

1. **Session découverte** (30 min) : présentation des modules adaptés à votre secteur
2. **Atelier configuration** (2h) : paramétrage de votre société, import des données
3. **Pilote gratuit** (30 jours) : accès complet à la plateforme pour vos équipes RH, test des scénarios réels

### Prochaines étapes concrètes

1. Déploiement de l'instance de démonstration sur votre infrastructure ou la nôtre
2. Personnalisation des paramètres (politique de congés, taux de paie, devise)
3. Import des premiers employés et configuration des comptes
4. Formation de votre équipe RH (2h en visio)
5. Mise en production progressive (d'abord pointage + congés, puis paie, puis modules avancés)

### Contact technique

Pour toute question, démonstration ou demande d'accompagnement :

- **Documentation technique** : `/api/docs` (Swagger/OpenAPI)
- **Dépôt** : https://github.com/MrOnesim/EmployePro
- **Licence** : ISC (usage libre, contributions bienvenues)

---

_Document généré le 11 juillet 2026 — EmployraRH v1.0_
