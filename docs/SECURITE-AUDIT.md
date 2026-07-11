# AUDIT DE SÉCURITÉ — EmployraRH

> Document de préparation à un audit de sécurité externe. Il référence les contrôles
> déjà implémentés et ceux qui doivent être vérifiés/renforcés par un auditeur tiers
> (pentest, analyse statique, revue de configuration) avant une mise en production
> critique.

## 1. État des contrôles implémentés

| Domaine               | Contrôle                                                    | État | Emplacement                                     |
| --------------------- | ----------------------------------------------------------- | ---- | ----------------------------------------------- |
| **AuthN**             | Authentification email/mot de passe (bcrypt 12 rounds)      | ✅   | `backend/src/auth`                              |
| **AuthN**             | Sessions Better Auth + rotation des refresh tokens          | ✅   | `backend/prisma/schema.prisma` (`RefreshToken`) |
| **AuthN**             | OAuth 2.0 Google / Microsoft (optionnel)                    | ✅   | `backend/src/auth`                              |
| **AuthN**             | Vérification mot de passe pour suppression de compte (RGPD) | ✅   | `backend/src/gdpr`                              |
| **AuthZ**             | RBAC 7 rôles + guards NestJS sur endpoints                  | ✅   | `backend/src/common/guards`                     |
| **AuthZ**             | Décorateur `@Public()` pour routes ouvertes                 | ✅   | `backend/src/common`                            |
| **Transport**         | TLS/HTTPS (terminaison Nginx recommandée)                   | ⚠️   | `docker/nginx.conf` (HSTS activé)               |
| **Headers**           | Helmet (HSTS, X-Frame-Options, nosniff, referrer)           | ✅   | `backend/src/main.ts`                           |
| **Headers**           | CSP stricte (self-only scripts)                             | ✅   | `docker/nginx.conf`                             |
| **CSRF**              | Double-submit cookie + header (hors `/api/auth/*`)          | ✅   | `backend/src/common`                            |
| **Rate limit**        | 100 req / 60 s / IP (throttler)                             | ✅   | `backend/src/app.module.ts`                     |
| **Validation**        | class-validator (whitelist, forbidNonWhitelisted)           | ✅   | global `ValidationPipe`                         |
| **CORS**              | Liste blanche `FRONTEND_URL`                                | ✅   | `backend/src/main.ts`                           |
| **Secrets**           | Validation env (HTTPS prod, secret ≥ 32 car.)               | ✅   | `backend/src/common/security/env.validation.ts` |
| **Chiffrement repos** | PostgreSQL (disque chiffré recommandé)                      | ⚠️   | infra (à configurer)                            |
| **Cache**             | Redis avec dégradation gracieuse                            | ✅   | `backend/src/cache`                             |
| **RGPD**              | Export / suppression / purge / journal d'accès              | ✅   | `backend/src/gdpr`                              |
| **Monitoring**        | Sentry front + back (trace 0.1)                             | ✅   | `vite.config.ts`, `backend/src/main.ts`         |
| **PWA**               | API en NetworkOnly (aucune PII en cache)                    | ✅   | `vite.config.ts`                                |
| **QR pointage**       | Token signé, session temporelle, anti-rejeu                 | ✅   | `backend/src/qr-token`, `attendance`            |
| **Logs**              | Pas de secret en clair dans les logs                        | ✅   | conventions                                     |

## 2. Points à soumettre à l'auditeur externe

- [ ] **Pentest applicatif** (OWASP Top 10 : injection, broken access control, SSRF, XXE)
- [ ] **Revue de configuration** Nginx / Docker (droits conteneurs, réseau, secrets Docker)
- [ ] **Analyse statique** (SAST) du frontend et du backend
- [ ] **Scan de dépendances** (`npm audit`, Snyk) et plan de correctifs
- [ ] **Test de résilience** (failover DB, perte Redis, montée en charge)
- [ ] **Vérification RGPD** (DPIA, registre des traitements, sous-traitants)
- [ ] **Chiffrement au repos** (disque/volume PostgreSQL, backups chiffrés)
- [ ] **Gestion des secrets** (vault / variables d'env hors repo, rotation)
- [ ] **Journalisation & alerting** (centralisation logs, alertes Sentry)
- [ ] **Plan de reprise (PRA)** testé sur environnement de staging

## 3. Recommandations avant production critique

1. Activer **2FA** (TOTP / WebAuthn) pour les rôles ADMIN / SUPER_ADMIN.
2. Mettre en place un **WAF** devant Nginx (ex. Cloudflare) en mode proxy.
3. Programmer des **sauvegardes chiffrées** hors-site (voir `scripts/backup.sh`).
4. Activer **alerting Sentry** + tableau de bord infra (Uptime, CPU, espace disque).
5. Documenter le **processus d'incident** (responsable, escalade, communication).

---

_EmployraRH v1.0 — Préparation audit de sécurité — juillet 2026_
