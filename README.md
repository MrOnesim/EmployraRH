# EmployraRH

Plateforme de gestion RH et paie internationale.

## Modules

- **RH** : EmployÃ©s, Ã©quipes, organigramme, import CSV
- **Paie** : Salaire, fiches de paie, banque, fiscalitÃ© multi-pays
- **Temps** : PrÃ©sences, congÃ©s, calendrier
- **Talents** : Recrutement, performance, objectifs
- **RH avancÃ©** : Missions, marketplace, formations, quiz, certificats
- **Bien-Ãªtre** : Sondages bien-Ãªtre anonymes, scores d'Ã©quipe
- **Financier** : Avances sur salaire, transferts, coffre-fort numÃ©rique
- **RÃ©compenses** : SystÃ¨me de points et catalogue
- **MatÃ©riel** : Gestion des Ã©quipements et affectations
- **Signature** : Signature Ã©lectronique avec canvas et modÃ¨les
- **Collaboration** : Messagerie, rÃ©unions, feed social
- **IA Assistant** : Assistant RH intelligent avec NLP

## Stack

React 19, TypeScript, Tailwind CSS v4, Vite, Recharts, Lucide React

## Scripts

```bash
npm run dev        # DÃ©veloppement
npm run build      # Production
npm run test       # Tests
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run format     # Prettier
npm run check      # CI (typecheck + lint + test)
```

## Architecture

- `src/pages/` â€” 40 pages avec lazy loading
- `src/context/` â€” AuthContext, DataContext, AppContext, ThemeContext, ToastContext
- `src/components/` â€” Composants rÃ©utilisables
- `src/utils/` â€” Utilitaires (format, permissions, eventBus, pdfExport, salary)
- `src/ai/` â€” RÃ¨gles NLP pour l'assistant IA
- `src/types/` â€” Types TypeScript
