# Contributing — EmployéPro Africa

Merci de votre intérêt pour la contribution à **EmployéPro Africa** ! Ce guide décrit comment configurer votre environnement, le workflow de branches, les conventions de commit et les exigences pour les Pull Requests.

---

## Sommaire

- [Configuration locale](#configuration-locale)
- [Stratégie de branchement](#stratégie-de-branchement)
- [Conventions de commit](#conventions-de-commit)
- [Exigences des Pull Requests](#exigences-des-pull-requests)
- [Style de code](#style-de-code)
- [Tests](#tests)

---

## Configuration locale

### Prérequis

- **Node.js 22+** et npm 10+
- **PostgreSQL 16** (ou Docker pour le service `db`)
- **Docker** (optionnel, recommandé)

### Installation

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/MrOnesim/EmployePro.git
   cd EmployePro
   ```

2. **Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env           # renseigner DATABASE_URL, BETTER_AUTH_SECRET, QR_SECRET
   npx prisma migrate dev
   npm run start:dev              # http://localhost:3000
   ```

3. **Frontend**

   ```bash
   # depuis la racine
   npm install
   cp .env.example .env           # VITE_API_BASE_URL=/api
   npm run dev                    # http://localhost:5173
   ```

4. **Base de données via Docker** (alternative)

   ```bash
   npm run db:up                  # docker compose up -d db
   ```

Voir le [README.md](./README.md) pour le détail des variables d'environnement.

---

## Stratégie de branchement

| Type de branche         | Nom                            | Cible de merge               |
| ----------------------- | ------------------------------ | ---------------------------- |
| Branche principale      | `main`                         | — (protégée, CI obligatoire) |
| Nouvelle fonctionnalité | `feature/<courte-description>` | `main`                       |
| Correctif               | `fix/<courte-description>`     | `main`                       |
| Documentation           | `docs/<courte-description>`    | `main`                       |
| Mise à jour CI / build  | `chore/<courte-description>`   | `main`                       |

- Travaillez toujours depuis une branche dérivée de `main` à jour.
- Une PR ne doit cibler que `main`.
- Gardez les branches courtes et focalisées (une fonctionnalité / un fix par PR).

---

## Conventions de commit

Nous utilisons les **[Conventional Commits](https://www.conventionalcommits.org/)** :

```
<type>[scope optionnel]: <description courte>

[corps optionnel]
[pied optionnel]
```

### Types autorisés

| Type       | Usage                                    |
| ---------- | ---------------------------------------- |
| `feat`     | Nouvelle fonctionnalité                  |
| `fix`      | Correctif de bug                         |
| `docs`     | Documentation (README, CONTRIBUTING…)    |
| `style`    | Formatage, pas de changement de logique  |
| `refactor` | Refactor sans changement de comportement |
| `perf`     | Amélioration de performance              |
| `test`     | Ajout / modification de tests            |
| `build`    | Build, Docker, dépendances               |
| `ci`       | Pipeline CI/CD                           |
| `chore`    | Divers (nettoyage, outils)               |

### Exemples

```
feat(payroll): ajout du calcul des heures supplémentaires
fix(auth): correction du renouvellement de session JWT
docs(readme): documentation des variables d'environnement
```

---

## Exigences des Pull Requests

Une PR est acceptée si :

1. ✅ La **CI GitHub Actions** est verte (lint, typecheck, build, tests backend, tests E2E).
2. ✅ Des **tests** accompagnent le changement (unitaires backend et/ou frontend ; E2E si impact UX critique).
3. ✅ Le code respecte **ESLint + Prettier** (vérifié automatiquement par Husky en pre-commit).
4. ✅ La description de la PR explique le **problème** et la **solution** (et le lien vers l'issue si applicable).
5. ✅ Les secrets et données sensibles ne sont **jamais** commités (`.env` ignorés).
6. ✅ Les conventions de **commit** sont respectées.

> 🚫 Les PR avec des conflits non résolus, ou dont la CI échoue, ne seront pas mergées.

---

## Style de code

- **ESLint** + **Prettier** configurés à la racine et dans `backend/`.
- **Husky** exécute le lint + format en `pre-commit` et les tests en `pre-push` (lorsqu'ils sont activés).
- TypeScript strict ; évitez `any`.
- Composants React fonctionnels avec hooks ; privilégiez la réutilisabilité dans `src/components/`.
- Côté backend, respectez l'architecture NestJS (module → controller → service) et validez les entrées avec des DTOs `class-validator`.

Pour vérifier localement avant de pousser :

```bash
npm run check            # frontend : typecheck + lint + test
cd backend && npm run test && npm run build
```

---

## Tests

- **Backend** : `cd backend && npm run test` (Vitest).
- **Frontend** : `npm run test` (Vitest + Testing Library).
- **E2E** : `npx playwright test` (après `npm run build`).

Toute nouvelle fonctionnalité doit inclure des tests couvrant au minimum le cas nominal et les cas d'erreur principaux.

---

<p align="center">
  <sub>En contribuant, vous aidez à bâtir la meilleure plateforme RH & Paie pour l'Afrique 🌍</sub>
</p>
