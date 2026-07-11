# GUIDE ADMINISTRATEUR — EmployraRH

## 1. Prérequis techniques

| Composant         | Version requise                      |
| ----------------- | ------------------------------------ |
| **Node.js**       | 22.x                                 |
| **Docker**        | 24+                                  |
| **PostgreSQL**    | 16 (ou Docker)                       |
| **Redis**         | 7 (optionnel, recommandé)            |
| **Nginx**         | 1.27+ (ou Docker)                    |
| **Espace disque** | 10 Go minimum (hors base de données) |

---

## 2. Déploiement

### 2.1. Démarrage rapide (Docker Compose)

```bash
# 1. Cloner le dépôt
git clone https://github.com/MrOnesim/EmployePro.git
cd EmployePro

# 2. Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env : DATABASE_URL, BETTER_AUTH_SECRET, etc.

# 3. Lancer l'infrastructure complète
docker compose up -d

# 4. Vérifier l'état des services
docker compose ps
docker compose logs backend  # Vérifier que le backend démarre sans erreur
```

L'application est accessible sur :

- **Frontend** : `http://localhost`
- **Backend API** : `http://localhost/api`
- **Documentation Swagger** : `http://localhost/api/docs`

### 2.2. Déploiement manuel (sans Docker)

```bash
# Base de données
npm run db:up  # PostgreSQL + Redis via Docker

# Backend
cd backend
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start:prod &

# Frontend
cd ..
npm ci
npm run build
npx serve -s dist -l 80
```

### 2.3. Variables d'environnement

#### Variables requises

| Variable             | Description                                | Exemple                                         |
| -------------------- | ------------------------------------------ | ----------------------------------------------- |
| `DATABASE_URL`       | Connexion PostgreSQL                       | `postgresql://user:pass@db:5432/employepro`     |
| `BETTER_AUTH_SECRET` | Secret pour les tokens (≥ 32 caractères)   | `une-chaîne-aléatoire-de-32-caractères-minimum` |
| `BETTER_AUTH_URL`    | URL de base de l'auth                      | `https://employra.monsite.com`                  |
| `FRONTEND_URL`       | URL du frontend (CORS)                     | `https://employra.monsite.com`                  |
| `QR_SECRET`          | Secret pour les QR codes (≥ 32 caractères) | `une-autre-chaîne-aléatoire`                    |

#### Variables optionnelles

| Variable              | Défaut                      | Description                              |
| --------------------- | --------------------------- | ---------------------------------------- |
| `PORT`                | `3000`                      | Port du backend                          |
| `REDIS_URL`           | —                           | URL Redis (absent = pas de cache)        |
| `SMTP_HOST`           | —                           | Serveur SMTP (absent = pas d'email)      |
| `SMTP_PORT`           | `587`                       | Port SMTP                                |
| `SMTP_USER`           | —                           | Utilisateur SMTP                         |
| `SMTP_PASS`           | —                           | Mot de passe SMTP                        |
| `SMTP_FROM`           | `no-reply@employepro.local` | Expéditeur des emails                    |
| `SENTRY_DSN`          | —                           | DSN Sentry pour le monitoring            |
| `VITE_API_BASE_URL`   | `/api`                      | URL de l'API (frontend)                  |
| `DATA_RETENTION_DAYS` | `1095`                      | Durée de conservation des données (RGPD) |
| `GOOGLE_CLIENT_ID`    | —                           | OAuth Google                             |
| `MICROSOFT_CLIENT_ID` | —                           | OAuth Microsoft                          |

### 2.4. Configuration Nginx (production)

Le fichier `docker/nginx.conf` fournit :

- Compression gzip
- Cache statique (1 an, immutable)
- Headers de sécurité (CSP, HSTS, X-Frame-Options)
- Proxy inverse vers le backend
- Fallback SPA

**Points d'attention en production :**

- Configurer un certificat SSL (Let's Encrypt / Certbot)
- Activer HSTS (déjà fait, `31536000s`)
- Ajuster la CSP si vous utilisez des ressources externes

---

## 3. Maintenance courante

### 3.1. Sauvegarde de la base de données

```bash
# Script automatisé (Linux/Mac)
./scripts/backup.sh

# Script automatisé (Windows PowerShell)
.\scripts\backup.ps1

# Manuellement avec pg_dump
pg_dump --dbname=employepro --format=custom --file=backup_$(date +%Y%m%d).dump
```

**Planification recommandée (cron / planificateur) :**

- Sauvegarde complète : **tous les jours** à 3h du matin
- Rétention : **30 jours**
- Une copie hors site (stockage objet S3, serveur distant)

### 3.2. Restauration

```bash
# Script
./scripts/restore.sh backups/employepro_20260710-030000.dump

# Manuellement
pg_restore --dbname=employepro --clean --if-exists backup.dump
```

### 3.3. Mise à jour

```bash
git pull origin main
docker compose down
docker compose up -d --build  # Rebuild les images
```

_Vérifier les migrations Prisma après chaque mise à jour du schéma :_

```bash
docker compose exec backend npx prisma migrate deploy
```

### 3.4. Logs et monitoring

```bash
# Logs en temps réel
docker compose logs -f backend
docker compose logs -f frontend

# Vérifier l'état de santé
curl http://localhost/api/health
# Réponse attendue : { "status": "ok", "db": true }
```

**Sentry** (si configuré) :

- Erreurs backend : tableau de bord Sentry → `@sentry/nestjs`
- Erreurs frontend : tableau de bord Sentry → `@sentry/react`

---

## 4. Administration des utilisateurs et rôles

### 4.1. Créer un employé

1. Menu **Employés** → **Ajouter un employé**
2. Remplir : prénom, nom, email, poste, département, salaire
3. L'employé reçoit une invitation par email (si SMTP configuré)

### 4.2. Rôles disponibles

| Rôle                | Accès                                                   |
| ------------------- | ------------------------------------------------------- |
| **SUPER_ADMIN**     | Multi-sociétés, configuration système                   |
| **ADMIN**           | Tous les modules, paie, configuration                   |
| **RH**              | Gestion RH (employés, congés, documents, formations)    |
| **MANAGER**         | Équipe, approbations (congés, missions, notes de frais) |
| **DEPARTMENT_HEAD** | Direction département, reporting                        |
| **EMPLOYEE**        | Vue personnelle (pointage, congés, bulletins)           |
| **SECURITY_GUARD**  | Pointage via borne/QR                                   |

### 4.3. Politique de congés

Menu **Congés** → **Politique de congés**

| Type      | Valeur par défaut |
| --------- | ----------------- |
| Annuel    | 22 jours          |
| Maladie   | 10 jours          |
| Maternité | 90 jours          |
| Spécial   | 5 jours           |

La politique est stockée dans le navigateur de l'administrateur (`localStorage`). En mode multi-utilisateur, une politique centralisée en base sera utilisée.

### 4.4. Configuration de la paie

Menu **Paie** → **Configuration**

Paramètres disponibles :

- Taux de cotisation sociale
- Taux d'imposition
- Jour de paiement
- Taux heures supplémentaires
- Devise

---

## 5. Sécurité

### 5.1. Bonnes pratiques

- **Changez les mots de passe par défaut** immédiatement après le déploiement
- **Activez OAuth** (Google/Microsoft) pour le SSO si disponible
- **HTTPS obligatoire** en production (le validateurd'environnement le vérifie)
- **Mettez à jour les dépendances** régulièrement : `npm audit`
- **Surveillez Sentry** pour détecter les erreurs anormales

### 5.2. Rate limiting

Le backend limite à **100 requêtes par 60 secondes** par IP. Au-delà, la réponse est `429 Too Many Requests`. Ce seuil est configurable dans `backend/src/app.module.ts`.

### 5.3. Conformité RGPD

| Fonctionnalité        | Description                                                         |
| --------------------- | ------------------------------------------------------------------- |
| Export des données    | L'utilisateur peut exporter toutes ses données (JSON)               |
| Suppression du compte | L'utilisateur peut supprimer son compte (vérification mot de passe) |
| Purge automatique     | Les comptes supprimés depuis > 3 ans (1095 jours) sont purgés       |
| Journal d'accès       | Toute consultation des données personnelles est tracée              |

### 5.4. Sauvegarde et plan de reprise (PRA)

1. **Sauvegardes quotidiennes** de la base PostgreSQL
2. **Code versionné** sur GitHub
3. **Docker Compose** : redémarrage automatique des conteneurs
4. **Multi-environnements** : tester la restauration sur un environnement de staging avant la production

---

## 6. Dépannage

| Problème                         | Cause possible            | Solution                                                              |
| -------------------------------- | ------------------------- | --------------------------------------------------------------------- |
| Le backend ne démarre pas        | `DATABASE_URL` incorrecte | Vérifier `.env`, PostgreSQL est-il en cours d'exécution ?             |
| `ECONNREFUSED` Redis             | Redis non disponible      | Le système fonctionne sans Redis (cache désactivé)                    |
| Les emails ne partent pas        | SMTP non configuré        | Vérifier `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`                        |
| Les QR codes ne fonctionnent pas | `QR_SECRET` manquant      | Définir `QR_SECRET` dans `.env` (≥ 32 caractères)                     |
| `429 Too Many Requests`          | Trop de requêtes          | Attendre 60s ou augmenter le seuil dans `app.module.ts`               |
| CORS bloque les requêtes         | `FRONTEND_URL` incorrect  | Vérifier que l'URL du frontend correspond exactement                  |
| La page reste blanche            | Erreur JavaScript         | Vérifier la console navigateur et Sentry                              |
| Les migrations Prisma échouent   | Conflit de schéma         | `prisma migrate resolve --rolled-back` sur la migration problématique |

---

## 7. Référence technique

### Architecture des conteneurs

```
employepro-frontend  → Nginx (port 80)
employepro-backend   → NestJS (port 3000)
employepro-redis     → Redis 7 (cache)
employepro-db        → PostgreSQL 16
```

### Commandes utiles

```bash
# Accéder au shell du backend
docker compose exec backend sh

# Lancer Prisma Studio (GUI base de données)
cd backend && npx prisma studio

# Générer le client Prisma
cd backend && npx prisma generate

# Créer une migration
cd backend && npx prisma migrate dev --name nom_de_la_migration

# Rejouer les tests backend
cd backend && npm test

# Vérifier les types
npm run typecheck

# Analyser la taille du bundle
npm run analyse
```

### Endpoints d'administration

| Endpoint                         | Description                       |
| -------------------------------- | --------------------------------- |
| `GET /api/health`                | État de santé (DB, Redis, uptime) |
| `GET /api/docs`                  | Documentation Swagger             |
| `POST /api/auth/change-password` | Changement de mot de passe        |
| `POST /api/gdpr/export`          | Export des données personnelles   |
| `POST /api/gdpr/erase`           | Suppression du compte             |

---

_EmployraRH v1.0 — Document administrateur — Dernière mise à jour : juillet 2026_
