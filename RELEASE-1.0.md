# Release 1.0 — Document de Pilotage

> **Statut global** : ██░░░░░░░░ 23%  
> **Dernière mise à jour** : 2026-07-10
> **Total points** : 423

---

## Légende

| Symbole | Signification |
|---------|---------------|
| ✅ | Fait / Validé |
| 🔄 | En cours |
| ⬜ | À faire |
| ❌ | Bloqué |
| 🚫 | Non applicable |
| P0 | Priorité critique (release-blocker) |
| P1 | Priorité haute |
| P2 | Priorité normale |
| P3 | Basse priorité / nice-to-have |
| 🎯F | Fonctionnalité |
| 🔒S | Sécurité |
| ⚡P | Performance |
| 🎨U | UX/UI |
| ✅T | Tests |
| 📚D | Documentation |
| 🚀C | Déploiement/CI |

---

## 1. Employés

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 1 | CRUD employé complet (create, read, update, delete) | 🎯F | P0 | ✅ |
| 2 | Filtres & recherche combinée multi-critères | 🎯F | P0 | ✅ |
| 3 | Pagination liste employés (20/50/100) | 🎯F | P0 | ✅ |
| 4 | Tri multi-colonnes (nom, date, statut) | 🎯F | P1 | ⬜ |
| 5 | Photo de profil / avatar upload | 🎯F | P2 | ⬜ |
| 6 | Import CSV/XLSX masse employés | 🎯F | P1 | ⬜ |
| 7 | Export CSV/XLSX liste employés | 🎯F | P1 | ⬜ |
| 8 | Arbre hiérarchique (org chart) | 🎯F | P2 | ⬜ |
| 9 | Fiche employé — section documents | 🎯F | P1 | ✅ |
| 10 | Fiche employé — section congés | 🎯F | P1 | ✅ |
| 11 | Fiche employé — section paies | 🎯F | P1 | ✅ |
| 12 | Fiche employé — section équipements | 🎯F | P1 | ✅ |
| 13 | Statut employé (actif/inactif/congé/suspension) | 🎯F | P0 | ✅ |
| 14 | Historique des modifications employé (audit trail) | 🎯F | P1 | ⬜ |
| 15 | Contrat — upload & signature électronique | 🎯F | P1 | ⬜ |
| 16 | Départ employé (offboarding workflow) | 🎯F | P2 | ⬜ |
| 17 | Validation RBAC — accès aux données par rôle | 🔒S | P0 | ✅ |
| 18 | Indexation base de données (nom, email, département) | ⚡P | P0 | ⬜ |
| 19 | Cache Redis GET /employees | ⚡P | P1 | ⬜ |
| 20 | État vide liste employés | 🎨U | P0 | ✅ |
| 21 | Loading skeleton fiche employé | 🎨U | P0 | ✅ |
| 22 | Toast erreur CRUD employé | 🎨U | P0 | ✅ |
| 23 | Tests unitaires — EmployeeService (10 tests) | ✅T | P0 | ✅ |
| 24 | Tests E2E — parcours CRUD employé | ✅T | P1 | ⬜ |
| 25 | Swagger — @ApiTags('employees') + @ApiBearerAuth | 📚D | P0 | ✅ |
| 26 | Swagger — DTOs employé documentés (@ApiProperty) | 📚D | P0 | ✅ |
| 27 | Onboarding — import guide utilisateur | 📚D | P2 | ⬜ |
| 28 | Export fiche employé PDF | 🎯F | P2 | ⬜ |

## 2. Présences

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 29 | Pointage entrée/sortie (QR code) | 🎯F | P1 | ✅ |
| 30 | Scan RFID / badge physique | 🎯F | P2 | ⬜ |
| 31 | Pointage depuis mobile (GPS + géofencing) | 🎯F | P2 | ⬜ |
| 32 | Feuille de présence mensuelle PDF | 🎯F | P1 | ⬜ |
| 33 | Historique des pointages par employé | 🎯F | P1 | ✅ |
| 34 | Détection absence non justifiée (alerte) | 🎯F | P2 | ⬜ |
| 35 | Planning de roulement (équipes matin/après-midi/nuit) | 🎯F | P3 | ⬜ |
| 36 | Export feuille de présence CSV | 🎯F | P2 | ⬜ |
| 37 | Dashboard présence (présents/absents/retard) | 🎯F | P2 | ⬜ |
| 38 | Calcul heures travaillées → intégration paie | 🎯F | P1 | ⬜ |
| 39 | Notification retard automatique | 🎯F | P2 | ⬜ |
| 40 | Pointage multi-sites (géolocalisation) | 🎯F | P3 | ⬜ |
| 41 | Validation RBAC — accès feuilles présence | 🔒S | P0 | ✅ |
| 42 | Tests unitaires — AttendanceService (11 tests) | ✅T | P0 | ✅ |
| 43 | Tests E2E — pointage employé | ✅T | P1 | ⬜ |
| 44 | Swagger — AttendanceController documenté | 📚D | P0 | ✅ |
| 45 | Chargement liste présences (pagination + skeleton) | 🎨U | P1 | ✅ |

## 3. QR Code

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 46 | Génération QR code unique par employé | 🎯F | P1 | ✅ |
| 47 | Scan QR code → pointage entrée/sortie | 🎯F | P1 | ✅ |
| 48 | QR code — badge PDF imprimable | 🎯F | P2 | ⬜ |
| 49 | QR code — expiration / rotation automatique | 🔒S | P1 | ⬜ |
| 50 | QR code sécurisé (token signé + horodaté) | 🔒S | P1 | ⬜ |
| 51 | Scan depuis mobile (caméra) | 🎯F | P1 | ⬜ |
| 52 | Anti-rejeu (QR code usage unique) | 🔒S | P1 | ⬜ |
| 53 | Historique scans QR (qui, quand, où) | 🎯F | P1 | ⬜ |
| 54 | QR code multi-sites (url différente par site) | 🎯F | P2 | ⬜ |
| 55 | Mode dégradé (code manuel si QR illisible) | 🎯F | P2 | ⬜ |
| 56 | Tests unitaires — QrTokenService (11 tests) | ✅T | P0 | ✅ |
| 57 | Swagger — QrTokenController documenté | 📚D | P0 | ✅ |

## 4. Congés

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 58 | Demande de congé (dates, motif, type) | 🎯F | P0 | ✅ |
| 59 | Validation hiérarchique (workflow) | 🎯F | P0 | ✅ |
| 60 | Rejet avec motif obligatoire | 🎯F | P0 | ✅ |
| 61 | Solde congés (acquis, pris, restant, en attente) | 🎯F | P0 | ✅ |
| 62 | Types de congés paramétrables (CP, RTT, sans solde…) | 🎯F | P1 | ✅ |
| 63 | Règle acquisition mensuelle (2.5j/mois CP) | 🎯F | P1 | ✅ |
| 64 | Règle acquisition annuelle (RTT forfait jours) | 🎯F | P1 | ✅ |
| 65 | Jours fériés — calendrier paramétrable | 🎯F | P2 | ⬜ |
| 66 | Congés sans solde | 🎯F | P1 | ⬜ |
| 67 | Absence maladie — déclaration + justificatif | 🎯F | P1 | ⬜ |
| 68 | Justificatif upload obligatoire (>3 jours) | 🎯F | P2 | ⬜ |
| 69 | Validation automatique si manager absent (escalade N+2) | 🎯F | P2 | ⬜ |
| 70 | Vue calendrier des absences (équipe) | 🎯F | P2 | ⬜ |
| 71 | Export solde congés PDF | 🎯F | P2 | ⬜ |
| 72 | Rattrapage solde (régularisation RH) | 🎯F | P1 | ⬜ |
| 73 | Notification email au manager (demande créée) | 🎯F | P0 | ⬜ |
| 74 | Notification email à l'employé (validée/refusée) | 🎯F | P0 | ⬜ |
| 75 | Validation RBAC — accès soldes équipe | 🔒S | P0 | ✅ |
| 76 | Cache Redis — solde congés (lecture fréquente) | ⚡P | P1 | ⬜ |
| 77 | Tests unitaires — LeaveService (21 tests) | ✅T | P0 | ✅ |
| 78 | Tests E2E — workflow demande → validation → rejet | ✅T | P1 | ⬜ |
| 79 | Swagger — LeaveController documenté | 📚D | P0 | ✅ |

## 5. Paie

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 80 | Configuration paie (paramètres généraux) | 🎯F | P0 | ✅ |
| 81 | Calcul automatique — salaire brut | 🎯F | P0 | ⬜ |
| 82 | Calcul automatique — cotisations sociales | 🎯F | P0 | ⬜ |
| 83 | Calcul automatique — impôt à la source (PAS) | 🎯F | P0 | ⬜ |
| 84 | Calcul automatique — primes & bonus | 🎯F | P0 | ⬜ |
| 85 | Calcul automatique — heures supplémentaires | 🎯F | P0 | ⬜ |
| 86 | Génération fiche de paie PDF | 🎯F | P0 | ✅ |
| 87 | Mise à disposition employé (portail) | 🎯F | P0 | ✅ |
| 88 | Historique des fiches de paie (N années) | 🎯F | P0 | ✅ |
| 89 | Bulletin détaillé (rubriques : salaire, cotisations, net) | 🎯F | P0 | ⬜ |
| 90 | Export DSN (Déclaration Sociale Nominative) | 🎯F | P1 | ⬜ |
| 91 | Rattrapage paie (régularisation mois antérieur) | 🎯F | P1 | ⬜ |
| 92 | Simulation paie (avant validation définitive) | 🎯F | P2 | ⬜ |
| 93 | Arrêt maladie — calcul IJSS | 🎯F | P1 | ⬜ |
| 94 | Virement SEPA — génération fichier paiement | 🎯F | P2 | ⬜ |
| 95 | Plan épargne entreprise — intégration cotisations | 🎯F | P3 | ⬜ |
| 96 | Mutuelle — suivi cotisations employeur/employé | 🎯F | P3 | ⬜ |
| 97 | Conformité — mentions légales sur bulletin | 📚D | P0 | ⬜ |
| 98 | Validation RBAC — accès paie restreint RH/finance | 🔒S | P0 | ✅ |
| 99 | Tests unitaires — PayslipService (12 tests) | ✅T | P0 | ✅ |
| 100 | Tests unitaires — PayrollConfigService (12 tests) | ✅T | P0 | ✅ |
| 101 | Tests unitaires — SalaryTransferService (13 tests) | ✅T | P0 | ✅ |
| 102 | Tests E2E — génération fiche paie | ✅T | P1 | ⬜ |
| 103 | Swagger — controllers paie documentés | 📚D | P0 | ✅ |
| 104 | Loading + pagination historique paies | 🎨U | P1 | ✅ |

## 6. Documents

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 105 | Upload document (PDF, DOCX, XLSX, images) | 🎯F | P0 | ✅ |
| 106 | Catégories documents (contrat, bulletin, justificatif…) | 🎯F | P1 | ⬜ |
| 107 | Filtres par catégorie + date + employé | 🎯F | P1 | ⬜ |
| 108 | Recherche full-text dans les documents | 🎯F | P1 | ⬜ |
| 109 | Versioning (upload nouvelle version, historique) | 🎯F | P2 | ⬜ |
| 110 | Alerte expiration document (passeport, visa, contrat) | 🎯F | P2 | ⬜ |
| 111 | Signature électronique liée au document | 🎯F | P1 | ⬜ |
| 112 | Export lot documents (zip) | 🎯F | P2 | ⬜ |
| 113 | Validation type fichier + taille max 10MB | 🔒S | P0 | ✅ |
| 114 | Scan antivirus upload | 🔒S | P1 | ⬜ |
| 115 | Stockage S3 (vs local filesystem) | ⚡P | P1 | ⬜ |
| 116 | Tests unitaires — DocumentService (10 tests) | ✅T | P0 | ✅ |
| 117 | Swagger — DocumentController documenté | 📚D | P0 | ✅ |

## 7. Signature Électronique

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 118 | Templates documents (contrat, avenant, convention) | 🎯F | P0 | ✅ |
| 119 | Envoi signature (email + lien sécurisé) | 🎯F | P0 | ✅ |
| 120 | Suivi statut (envoyé / ouvert / signé / refusé) | 🎯F | P0 | ✅ |
| 121 | Signature depuis mobile (responsive) | 🎯F | P1 | ⬜ |
| 122 | Horodatage qualifié (certificat électronique) | 🎯F | P0 | ⬜ |
| 123 | Cachet électronique entreprise | 🎯F | P1 | ⬜ |
| 124 | Archivage horodaté (preuve juridique) | 🎯F | P1 | ⬜ |
| 125 | Signature multiple (co-signataires) | 🎯F | P2 | ⬜ |
| 126 | Ordre de signature (signataire 1 → signataire 2) | 🎯F | P2 | ⬜ |
| 127 | Validation RBAC — accès templates | 🔒S | P0 | ✅ |
| 128 | Tests unitaires — SignatureRequestService (24 tests) | ✅T | P0 | ✅ |
| 129 | Tests unitaires — SignatureTemplateService (17 tests) | ✅T | P0 | ✅ |
| 130 | Tests E2E — envoi → signature complet | ✅T | P1 | ⬜ |
| 131 | Swagger — controllers signature documentés | 📚D | P0 | ✅ |

## 8. Réunions

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 132 | CRUD réunion (titre, date, durée, participants) | 🎯F | P0 | ✅ |
| 133 | Calendrier — vue mensuelle / hebdomadaire | 🎯F | P1 | ✅ |
| 134 | Invitation participants (notification in-app) | 🎯F | P1 | ⬜ |
| 135 | Lien visioconférence (Zoom/Teams/Meet) | 🎯F | P2 | ⬜ |
| 136 | Compte-rendu de réunion (notes + actions) | 🎯F | P2 | ⬜ |
| 137 | Actions de suivi (assignée, échéance, statut) | 🎯F | P2 | ⬜ |
| 138 | Notification rappel (N minutes avant) | 🎯F | P2 | ⬜ |
| 139 | Disponibilités participants (sondage créneaux) | 🎯F | P3 | ⬜ |
| 140 | Export calendrier ICS | 🎯F | P2 | ⬜ |
| 141 | Tests unitaires — CalendarEventService (20 tests) | ✅T | P0 | ✅ |
| 142 | Tests unitaires — MeetingService (20 tests) | ✅T | P0 | ✅ |
| 143 | Swagger — controllers réunions documentés | 📚D | P0 | ✅ |

## 9. IA / Intelligence Artificielle

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 144 | Suggestions intelligentes — dates congés optimales | 🎯F | P2 | ⬜ |
| 145 | Détection anomalies paie (écart inhabituel) | 🎯F | P2 | ⬜ |
| 146 | Matching CV → offre emploi (score pertinence) | 🎯F | P2 | ⬜ |
| 147 | Analyse sentiment enquêtes bien-être (NLP) | 🎯F | P2 | ⬜ |
| 148 | Recommandation formations (compétences manquantes) | 🎯F | P2 | ⬜ |
| 149 | Chatbot RH (réponses automatiques FAQ) | 🎯F | P3 | ⬜ |
| 150 | Génération automatique comptes-rendus réunion | 🎯F | P3 | ⬜ |
| 151 | Prédiction turn-over (risque départ employé) | 🎯F | P3 | ⬜ |
| 152 | Détection fraude notes de frais | 🎯F | P3 | ⬜ |
| 153 | Alignement éthique — biais algorithmique audité | 🔒S | P2 | ⬜ |
| 154 | API externe — clé API sécurisée + rate limiting | 🔒S | P1 | ⬜ |

## 10. Recrutement

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 155 | Dépôt offre d'emploi (titre, description, compétences) | 🎯F | P0 | ✅ |
| 156 | Candidature spontanée (CV + lettre motivation) | 🎯F | P0 | ✅ |
| 157 | Suivi statut candidat (sourcing → entretien → offre) | 🎯F | P0 | ✅ |
| 158 | Pipeline recrutement (vue Kanban) | 🎯F | P2 | ⬜ |
| 159 | Grille d'évaluation entretien (critères personnalisables) | 🎯F | P2 | ⬜ |
| 160 | Planification entretien (lien calendrier) | 🎯F | P2 | ⬜ |
| 161 | Envoi offre / refus automatique (email template) | 🎯F | P2 | ⬜ |
| 162 | CV thèque — recherche full-text | 🎯F | P1 | ⬜ |
| 163 | Avis de confidentialité RGPD candidat | 🎯F | P1 | ⬜ |
| 164 | Délai conservation candidature (RGPD : 2 ans max) | 🎯F | P1 | ⬜ |
| 165 | Score matching IA candidat → offre | 🎯F | P2 | ⬜ |
| 166 | Tests unitaires — CandidateService (20 tests) | ✅T | P0 | ✅ |
| 167 | Tests unitaires — JobOfferService (20 tests) | ✅T | P0 | ✅ |
| 168 | Tests E2E — dépôt offre → candidature → suivi | ✅T | P1 | ⬜ |
| 169 | Swagger — controllers recrutement documentés | 📚D | P0 | ✅ |

## 11. Messagerie

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 170 | Conversations (thread privé 1-1 / groupe) | 🎯F | P1 | ✅ |
| 171 | Envoi fichiers dans les messages | 🎯F | P1 | ✅ |
| 172 | Mentions @user (notification + lien) | 🎯F | P2 | ⬜ |
| 173 | Réactions / emojis sur messages | 🎯F | P2 | ⬜ |
| 174 | Recherche messages (texte + date + expéditeur) | 🎯F | P2 | ⬜ |
| 175 | Statut lecture (vu / non vu) | 🎯F | P2 | ⬜ |
| 176 | Groupes par équipe / projet | 🎯F | P2 | ⬜ |
| 177 | Notification nouveau message (in-app + push) | 🎯F | P2 | ⬜ |
| 178 | Épingler message important | 🎯F | P3 | ⬜ |
| 179 | Tests unitaires — ConversationService (10 tests) | ✅T | P0 | ✅ |
| 180 | Swagger — ConversationController documenté | 📚D | P0 | ✅ |

## 12. Notifications

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 181 | Notifications in-app (toast + centre notifications) | 🎯F | P0 | ✅ |
| 182 | Notifications email (SMTP transactionnel) | 🎯F | P0 | ⬜ |
| 183 | Templates email personnalisables (approbation, rejet…) | 🎯F | P1 | ⬜ |
| 184 | Centre de notifications (marquer lu/non-lu, tout lu) | 🎯F | P1 | ✅ |
| 185 | Notifications push mobile (FCM / APNs) | 🎯F | P2 | ⬜ |
| 186 | Règles notification personnalisables par module | 🎯F | P2 | ⬜ |
| 187 | Résumé quotidien / hebdomadaire par email | 🎯F | P2 | ⬜ |
| 188 | File d'attente notifications (Bull / RabbitMQ) | ⚡P | P1 | ⬜ |
| 189 | Historique / logs notifications envoyées | 🎯F | P2 | ⬜ |
| 190 | Tests unitaires — NotificationService (14 tests) | ✅T | P0 | ✅ |
| 191 | Swagger — NotificationController documenté | 📚D | P0 | ✅ |

## 13. API

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 192 | Swagger/OpenAPI — tags sur tous les controlleurs | 📚D | P0 | ✅ |
| 193 | Swagger/OpenAPI — @ApiBearerAuth sur endpoints protégés | 📚D | P0 | ✅ |
| 194 | Swagger/OpenAPI — @ApiOperation sur tous les endpoints | 📚D | P0 | ✅ |
| 195 | Swagger/OpenAPI — DTOs @ApiProperty complets | 📚D | P0 | ✅ |
| 196 | Swagger/OpenAPI — exemples requêtes/réponses | 📚D | P1 | ⬜ |
| 197 | Swagger/OpenAPI — codes erreur documentés | 📚D | P1 | ⬜ |
| 198 | Format réponse uniforme (intercepteur global) | 📚D | P0 | ⬜ |
| 199 | Health check endpoint (/health) | 🎯F | P0 | ✅ |
| 200 | Rate limiting par IP (throttle) | 🔒S | P0 | ⬜ |
| 201 | Rate limiting par endpoint | 🔒S | P1 | ⬜ |
| 202 | Pagination — limite max 100 items | 🎯F | P0 | ⬜ |
| 203 | Versioning API (v1, v2 header/URL) | 📚D | P2 | ⬜ |
| 204 | CORS configuré (liste blanche) | 🔒S | P0 | ✅ |
| 205 | Timeout global 30s | ⚡P | P0 | ⬜ |
| 206 | Validation input (DTO + class-validator + whitelist) | 🔒S | P0 | ✅ |
| 207 | ParseUUIDPipe sur tous les paramètres UUID | 🔒S | P0 | ✅ |
| 208 | Exception filter global (erreurs standardisées) | 🎯F | P0 | ✅ |
| 209 | Documentation Postman / Bruno collection | 📚D | P2 | ⬜ |
| 210 | Tests E2E — API endpoints critiques | ✅T | P1 | ⬜ |

## 14. Sécurité

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 211 | Hash bcrypt/argon2 sur mots de passe | 🔒S | P0 | ✅ |
| 212 | JWT signé RS256 (access token 15min) | 🔒S | P0 | ✅ |
| 213 | Refresh token stocké côté serveur (DB + hash) | 🔒S | P0 | ⬜ |
| 214 | Rotation refresh token à chaque usage | 🔒S | P0 | ⬜ |
| 215 | Invalidation token (logout + changement mdp) | 🔒S | P0 | ⬜ |
| 216 | Rate limiting auth endpoints (5 tentatives / min) | 🔒S | P0 | ⬜ |
| 217 | Verrouillage compte après N échecs consécutifs | 🔒S | P1 | ⬜ |
| 218 | Délai progressif entre tentatives | 🔒S | P1 | ⬜ |
| 219 | Politique mot de passe : 12+ car, maj, min, chiffre, spécial | 🔒S | P0 | ⬜ |
| 220 | Vérification mot de passe compromis (HIBP) | 🔒S | P2 | ⬜ |
| 221 | Expiration session inactive (30min) | 🔒S | P1 | ⬜ |
| 222 | 2FA/TOTP optionnel | 🔒S | P1 | ⬜ |
| 223 | Rôles : Admin, RH, Manager, Employé | 🔒S | P0 | ✅ |
| 224 | Permissions granulaires (CRUD par ressource) | 🔒S | P0 | ✅ |
| 225 | Guards NestJS sur tous les endpoints protégés | 🔒S | P0 | ✅ |
| 226 | Principe moindre privilège — audit | 🔒S | P1 | ⬜ |
| 227 | Helmet.js (X-XSS-Protection, X-Content-Type-Options…) | 🔒S | P0 | ⬜ |
| 228 | Content-Security-Policy (CSP) configurée | 🔒S | P0 | ⬜ |
| 229 | CSRF Protection (double submit cookie / SameSite) | 🔒S | P0 | ⬜ |
| 230 | HTTPS uniquement (HSTS) | 🔒S | P0 | ⬜ |
| 231 | Fichiers upload — validation type + taille (10MB) | 🔒S | P0 | ✅ |
| 232 | Secrets (DB, JWT, API keys) — vault / variables env | 🔒S | P0 | ⬜ |
| 233 | Audit logs (connexions, modifications, accès) | 🔒S | P1 | ⬜ |
| 234 | Base de données — connexion TLS | 🔒S | P0 | ⬜ |
| 235 | Chiffrement au repos (données sensibles) | 🔒S | P1 | ⬜ |
| 236 | Chiffrement fichiers upload (AES-256) | 🔒S | P1 | ⬜ |
| 237 | Container / VM — non-root user | 🔒S | P0 | ⬜ |
| 238 | Plan de réponse incident documenté | 🔒S | P1 | ⬜ |
| 239 | Tests sécurité (OWASP ZAP / npm audit) | ✅T | P2 | ⬜ |

## 15. Tests

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 240 | Tests unitaires — tous les services backend (553 tests) | ✅T | P0 | ✅ |
| 241 | Tests unitaires — tous les controlleurs | ✅T | P1 | ⬜ |
| 242 | Tests d'intégration (module NestJS) | ✅T | P1 | ⬜ |
| 243 | Tests E2E — parcours auth complet | ✅T | P1 | ⬜ |
| 244 | Tests E2E — workflow congés (demande → validation → rejet) | ✅T | P1 | ⬜ |
| 245 | Tests E2E — workflow signature électronique | ✅T | P1 | ⬜ |
| 246 | Tests E2E — workflow recrutement | ✅T | P1 | ⬜ |
| 247 | Tests E2E — workflow note de frais | ✅T | P1 | ⬜ |
| 248 | Tests frontend — composants clés (RTL) | ✅T | P2 | ⬜ |
| 249 | Tests frontend — hooks personnalisés | ✅T | P2 | ⬜ |
| 250 | Couverture minimale backend ≥ 80% | ✅T | P0 | ⬜ |
| 251 | Couverture minimale frontend ≥ 60% | ✅T | P2 | ⬜ |
| 252 | Fakes / factories pour données de test | ✅T | P1 | ⬜ |
| 253 | Mutation testing (Stryker) | ✅T | P3 | ⬜ |
| 254 | Test de charge — 100 utilisateurs simultanés (K6) | ✅T | P2 | ⬜ |
| 255 | Test de sécurité (OWASP ZAP / npm audit) | ✅T | P2 | ⬜ |
| 256 | Pipeline CI — tests automatisés | 🚀C | P0 | ⬜ |
| 257 | Quality gate — couverture ≥ 80% bloque merge | 🚀C | P1 | ⬜ |

## 16. CI/CD

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 258 | Pipeline CI — lint + typecheck + build | 🚀C | P0 | ⬜ |
| 259 | Pipeline CI — tests unitaires + intégration | 🚀C | P0 | ⬜ |
| 260 | Pipeline CI — analyse sécurité (npm audit, Snyk) | 🚀C | P1 | ⬜ |
| 261 | Pipeline CI — qualité code (SonarQube / CodeClimate) | 🚀C | P1 | ⬜ |
| 262 | Pipeline CD — déploiement staging automatique (push develop) | 🚀C | P0 | ⬜ |
| 263 | Pipeline CD — déploiement production manuel (tag) | 🚀C | P0 | ⬜ |
| 264 | Gate qualité — couverture ≥ 80%, zero vuln critique | 🚀C | P1 | ⬜ |
| 265 | Build Docker multi-stage (backend + frontend) | 🚀C | P1 | ⬜ |
| 266 | Push image registry (Docker Hub / GHCR) | 🚀C | P1 | ⬜ |
| 267 | Tags sémantiques (SemVer + git tag + GitHub Release) | 🚀C | P1 | ⬜ |
| 268 | Changelog généré automatiquement (git-cliff) | 🚀C | P1 | ⬜ |
| 269 | Smoke tests post-déploiement | 🚀C | P1 | ⬜ |
| 270 | Husky — pre-commit (lint + format) | 🚀C | P0 | ⬜ |
| 271 | Husky — pre-push (tests) | 🚀C | P0 | ⬜ |

## 17. Monitoring

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 272 | Uptime monitoring (BetterStack / UptimeRobot) | 🚀C | P1 | ⬜ |
| 273 | APM — performance applicative (Sentry / Datadog) | 🚀C | P1 | ⬜ |
| 274 | Error tracking (Sentry) backend + frontend | 🚀C | P1 | ⬜ |
| 275 | Alerting — email + Slack (CPU, mémoire, 5xx, uptime) | 🚀C | P1 | ⬜ |
| 276 | Logs centralisés (ELK / Grafana Loki / CloudWatch) | 🚀C | P2 | ⬜ |
| 277 | Métriques Prometheus (requêtes, latence, erreurs) | 🚀C | P2 | ⬜ |
| 278 | Dashboard Grafana (vue d'ensemble système) | 🚀C | P2 | ⬜ |
| 279 | Détection requêtes lentes (slow query log DB) | ⚡P | P1 | ⬜ |
| 280 | Health check endpoint (/health) | 🎯F | P0 | ✅ |
| 281 | Health check — dépendances (DB, Redis, S3) | 🚀C | P1 | ⬜ |
| 282 | Logger structuré (JSON) backend | 📚D | P1 | ⬜ |
| 283 | Graceful shutdown (SIGTERM → arrêt propre) | 🚀C | P1 | ⬜ |

## 18. Performance

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 284 | Indexation base de données (audit EXPLAIN complet) | ⚡P | P0 | ⬜ |
| 285 | Cache Redis — requêtes fréquentes (employés, congés) | ⚡P | P1 | ⬜ |
| 286 | Cache invalidation (event-driven) | ⚡P | P1 | ⬜ |
| 287 | Pagination sur toutes les listes (limit + offset) | ⚡P | P0 | ✅ |
| 288 | Lazy-load relations TypeORM (éviter N+1) | ⚡P | P0 | ⬜ |
| 289 | Connexion DB — pool max 20 | ⚡P | P1 | ⬜ |
| 290 | Compression Gzip/Brotli (reverse proxy) | ⚡P | P0 | ⬜ |
| 291 | Bundle JS initial < 200KB | ⚡P | P1 | ⬜ |
| 292 | Code splitting (React.lazy + Suspense) | ⚡P | P1 | ⬜ |
| 293 | Bundle analysis (source-map-explorer / vite-bundle-visualizer) | ⚡P | P1 | ⬜ |
| 294 | Tree-shaking vérifié (vite config) | ⚡P | P0 | ⬜ |
| 295 | Virtual scrolling (listes > 500 items) | ⚡P | P1 | ⬜ |
| 296 | Mise en cache React Query / SWR (frontend) | ⚡P | P0 | ⬜ |
| 297 | Optimisation re-renders (React.memo, useMemo, useCallback) | ⚡P | P1 | ⬜ |
| 298 | TTFB < 500ms | ⚡P | P0 | ⬜ |
| 299 | FCP < 1.5s | ⚡P | P0 | ⬜ |
| 300 | LCP < 2.5s | ⚡P | P0 | ⬜ |
| 301 | CLS < 0.1 | ⚡P | P0 | ⬜ |
| 302 | Lighthouse score ≥ 90 sur toutes les pages | ⚡P | P1 | ⬜ |

## 19. Accessibilité

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 303 | Contraste couleurs minimum AA (WCAG 2.1) | 🎨U | P2 | ⬜ |
| 304 | Labels explicites sur tous les champs de formulaire | 🎨U | P2 | ⬜ |
| 305 | Navigation clavier complète (Tab, Enter, Escape, Arrow) | 🎨U | P2 | ⬜ |
| 306 | ARIA landmarks (banner, navigation, main, complementary) | 🎨U | P2 | ⬜ |
| 307 | ARIA attributs (aria-label, aria-expanded, aria-hidden…) | 🎨U | P2 | ⬜ |
| 308 | Focus visible (outline 2px) sur tous les éléments interactifs | 🎨U | P2 | ⬜ |
| 309 | Messages d'erreur accessibles (aria-live="polite") | 🎨U | P2 | ⬜ |
| 310 | Taille texte adaptable (unités rem, pas de px fixes) | 🎨U | P2 | ⬜ |
| 311 | Test avec lecteur d'écran (NVDA / VoiceOver) | 🎨U | P2 | ⬜ |
| 312 | Images — attribut alt descriptif | 🎨U | P2 | ⬜ |
| 313 | Titres de page (balise title) uniques et descriptifs | 🎨U | P2 | ⬜ |
| 314 | Skip to content (lien d'évitement) | 🎨U | P2 | ⬜ |
| 315| Taille cible tactile ≥ 44x44px (boutons, liens) | 🎨U | P2 | ⬜ |

## 20. SEO

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 316 | Balises meta title + description uniques par page | 🎨U | P2 | ⬜ |
| 317 | Balises Open Graph (og:title, og:description, og:image) | 🎨U | P2 | ⬜ |
| 318 | Sitemap.xml généré dynamiquement | 🎨U | P2 | ⬜ |
| 319 | Robots.txt (indexation publique / privée) | 🎨U | P2 | ⬜ |
| 320 | URLs canoniques (rel=canonical) | 🎨U | P3 | ⬜ |
| 321 | SSR/SSG pour pages publiques (offres emploi, blog RH) | 🎨U | P3 | ⬜ |
| 322 | Structured data (JSON-LD Organisation, JobPosting) | 🎨U | P3 | ⬜ |
| 323 | Performance mobile (Mobile First Index) | 🎨U | P1 | ⬜ |

## 21. PWA

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 324 | Manifest.json (name, short_name, icons, theme_color) | 🎨U | P2 | ⬜ |
| 325 | Service worker — cache stratégique (StaleWhileRevalidate) | 🎨U | P2 | ⬜ |
| 326 | Service worker — offline fallback page | 🎨U | P2 | ⬜ |
| 327 | Install prompt (beforeinstallprompt event) | 🎨U | P2 | ⬜ |
| 328 | Push notifications (service worker + FCM) | 🎨U | P2 | ⬜ |
| 329 | Synchronisation fond (Background Sync) | 🎨U | P3 | ⬜ |
| 330 | Test Lighthouse PWA (audit checklist) | 🎨U | P2 | ⬜ |

## 22. Mobile

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 331 | Design responsive — mobile (< 640px) | 🎨U | P1 | ⬜ |
| 332 | Design responsive — tablette (640-1024px) | 🎨U | P1 | ⬜ |
| 333 | Menu hamburger mobile | 🎨U | P1 | ⬜ |
| 334 | Navigation bottom tab (mobile) | 🎨U | P1 | ⬜ |
| 335 | Swipe gestures (liste → action, drawer) | 🎨U | P2 | ⬜ |
| 336 | Clic téléphone → lien tel: sur numéros | 🎨U | P2 | ⬜ |
| 337 | Touch events — pas de hover problématique | 🎨U | P1 | ⬜ |
| 338 | Clavier virtuel — pas de champ caché | 🎨U | P2 | ⬜ |
| 339 | Deep links (navigation directe vers ressource) | 🎨U | P2 | ⬜ |
| 340 | Biometric auth (fingerprint / Face ID) | 🎨U | P3 | ⬜ |
| 341 | Intégration appareil photo (scan QR, upload photo) | 🎨U | P2 | ⬜ |
| 342 | Test sur iOS Safari + Android Chrome | 🎨U | P1 | ⬜ |

## 23. Documentation

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 343 | README principal complet (installation, dev, stack) | 📚D | P0 | ⬜ |
| 344 | Guide d'installation environnement local (dev) | 📚D | P0 | ⬜ |
| 345 | Guide de déploiement (staging + production) | 📚D | P0 | ⬜ |
| 346 | Guide des migrations base de données | 📚D | P1 | ⬜ |
| 347 | Guide contribution (CONTRIBUTING.md) | 📚D | P1 | ⬜ |
| 348 | Architecture globale — diagramme C4 (context, container, component) | 📚D | P1 | ⬜ |
| 349 | Schéma base de données (ERD) | 📚D | P1 | ⬜ |
| 350 | ADR (Architecture Decision Records) — décisions clés | 📚D | P2 | ⬜ |
| 351 | Variables d'environnement documentées (toutes) | 📚D | P0 | ⬜ |
| 352 | Swagger/OpenAPI — hébergé (Swagger UI / Redoc) | 📚D | P1 | ⬜ |
| 353 | Postman / Bruno collection exportable | 📚D | P2 | ⬜ |
| 354 | Manuel utilisateur (Fonctionnalités par module) | 📚D | P2 | ⬜ |
| 355 | Guide administration RH (gestion des utilisateurs, congés, paie) | 📚D | P2 | ⬜ |
| 356 | Guide administration technique (serveurs, backups, monitoring) | 📚D | P2 | ⬜ |
| 357 | FAQ utilisateur | 📚D | P2 | ⬜ |
| 358 | Runbook — procédures opérationnelles (incident, recovery) | 📚D | P2 | ⬜ |
| 359 | Changelog (historique des versions) | 📚D | P1 | ⬜ |

## 24. Déploiement

| # | Tâche | Aspect | Prio | Statut |
|---|-------|--------|------|--------|
| 360 | Docker-compose (backend + frontend + PostgreSQL + Redis) | 🚀C | P0 | ⬜ |
| 361 | Dockerfile — multi-stage (build + production) | 🚀C | P1 | ⬜ |
| 362 | Reverse proxy Nginx / Caddy (SSL termination) | 🚀C | P0 | ⬜ |
| 363 | HTTPS — certificat Let's Encrypt (auto-renew cron) | 🚀C | P0 | ⬜ |
| 364 | Environnement staging (miroir production) | 🚀C | P1 | ⬜ |
| 365 | Environnement production (HA / redondance) | 🚀C | P1 | ⬜ |
| 366 | Base de données — backup automatisé (quotidien) | 🚀C | P0 | ⬜ |
| 367 | Base de données — restauration testée (procédure) | 🚀C | P0 | ⬜ |
| 368 | Base de données — réplication (failover automatique) | 🚀C | P2 | ⬜ |
| 369 | Stockage fichiers — S3-compatible (MinIO / AWS S3) | 🚀C | P1 | ⬜ |
| 370 | Script migration automatique (typeorm migration:run) | 🚀C | P0 | ⬜ |
| 371 | Rollback migration (typeorm migration:revert) | 🚀C | P0 | ⬜ |
| 372 | Variables d'environnement — validation au démarrage | 🚀C | P0 | ⬜ |
| 373 | Exemple .env.example à jour | 🚀C | P0 | ✅ |
| 374 | Plan de reprise d'activité (PRA) documenté | 🚀C | P2 | ⬜ |
| 375 | Scaling horizontal (docker swarm / kubernetes) | 🚀C | P3 | ⬜ |
| 376 | Feature flags (déploiement progressif) | 🚀C | P3 | ⬜ |
| 377 | Smoke tests post-déploiement automatisés | 🚀C | P1 | ⬜ |
| 378 | Plan de communication release (interne) | 🚀C | P2 | ⬜ |
| 379 | Release notes (GitHub Release) | 🚀C | P1 | ⬜ |

---

## Synthèse globale

| Module | Points | ✅ | 🔄 | ⬜ | % |
|--------|--------|----|----|----|---|
| 1. Employés | 28 | 14 | 0 | 14 | 50% |
| 2. Présences | 17 | 5 | 0 | 12 | 29% |
| 3. QR Code | 12 | 4 | 0 | 8 | 33% |
| 4. Congés | 22 | 13 | 0 | 9 | 59% |
| 5. Paie | 25 | 10 | 0 | 15 | 40% |
| 6. Documents | 13 | 4 | 0 | 9 | 31% |
| 7. Signature électronique | 13 | 7 | 0 | 6 | 54% |
| 8. Réunions | 12 | 6 | 0 | 6 | 50% |
| 9. IA | 11 | 0 | 0 | 11 | 0% |
| 10. Recrutement | 15 | 8 | 0 | 7 | 53% |
| 11. Messagerie | 11 | 4 | 0 | 7 | 36% |
| 12. Notifications | 10 | 3 | 0 | 7 | 30% |
| 13. API | 19 | 10 | 0 | 9 | 53% |
| 14. Sécurité | 29 | 9 | 0 | 20 | 31% |
| 15. Tests | 18 | 1 | 0 | 17 | 6% |
| 16. CI/CD | 14 | 0 | 0 | 14 | 0% |
| 17. Monitoring | 12 | 1 | 0 | 11 | 8% |
| 18. Performance | 19 | 2 | 0 | 17 | 11% |
| 19. Accessibilité | 13 | 0 | 0 | 13 | 0% |
| 20. SEO | 8 | 0 | 0 | 8 | 0% |
| 21. PWA | 7 | 0 | 0 | 7 | 0% |
| 22. Mobile | 12 | 0 | 0 | 12 | 0% |
| 23. Documentation | 17 | 3 | 0 | 14 | 18% |
| 24. Déploiement | 20 | 1 | 0 | 20 | 5% |
| **Total** | **379** | **104** | **0** | **275** | **27%** |

### Par priorité

| Priorité | Total | ✅ | ⬜ |
|----------|-------|----|----|
| P0 (critique) | 109 | 58 | 51 |
| P1 (haute) | 128 | 37 | 91 |
| P2 (normale) | 125 | 9 | 116 |
| P3 (basse) | 17 | 0 | 17 |

### Par aspect

| Aspect | Total | ✅ | ⬜ |
|--------|-------|----|----|
| 🎯 Fonctionnalité | 149 | 66 | 83 |
| 🔒 Sécurité | 39 | 15 | 24 |
| ⚡ Performance | 21 | 3 | 18 |
| 🎨 UX/UI | 30 | 11 | 19 |
| ✅ Tests | 41 | 11 | 30 |
| 📚 Documentation | 22 | 9 | 13 |
| 🚀 Déploiement/CI | 77 | 1 | 76 |

---

*Document généré le 2026-07-10 — **379 points de contrôle** répartis en 24 modules pour le pilotage de la Release 1.0.*
