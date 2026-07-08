# EmployéPro Africa

Plateforme de gestion RH et paie multi-pays africains.

## Modules

- **RH** : Employés, équipes, organigramme, import CSV
- **Paie** : Salaire, fiches de paie, banque, fiscalité multi-pays
- **Temps** : Présences, congés, calendrier
- **Talents** : Recrutement, performance, objectifs
- **RH avancé** : Missions, marketplace, formations, quiz, certificats
- **Bien-être** : Sondages bien-être anonymes, scores d'équipe
- **Financier** : Avances sur salaire, transferts, coffre-fort numérique
- **Récompenses** : Système de points et catalogue
- **Matériel** : Gestion des équipements et affectations
- **Signature** : Signature électronique avec canvas et modèles
- **Collaboration** : Messagerie, réunions, feed social
- **IA Assistant** : Assistant RH intelligent avec NLP

## Stack

React 19, TypeScript, Tailwind CSS v4, Vite, Recharts, Lucide React

## Scripts

```bash
npm run dev        # Développement
npm run build      # Production
npm run test       # Tests
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run format     # Prettier
npm run check      # CI (typecheck + lint + test)
```

## Architecture

- `src/pages/` — 40 pages avec lazy loading
- `src/context/` — AuthContext, DataContext, AppContext, ThemeContext, ToastContext
- `src/components/` — Composants réutilisables
- `src/utils/` — Utilitaires (format, permissions, eventBus, pdfExport, salary)
- `src/ai/` — Règles NLP pour l'assistant IA
- `src/types/` — Types TypeScript
