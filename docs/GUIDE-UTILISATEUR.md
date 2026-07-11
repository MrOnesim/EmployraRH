# GUIDE UTILISATEUR — EmployraRH

## 1. Premiers pas

### Connexion

1. Ouvrez votre navigateur (Chrome, Edge, Firefox récent recommandé)
2. Rendez-vous sur l'adresse fournie par votre administrateur
3. Saisissez votre **email professionnel** et votre **mot de passe**
4. Cliquez sur **Se connecter**

_Mot de passe oublié ?_ Contactez votre responsable RH — la réinitialisation est effectuée par un administrateur.

### Interface

```
┌─────────────────────────────────────────────────┐
│  ☰ Menu    EmployraRH          🔔  👤 John    │
├─────────────────────────────────────────────────┤
│                                                 │
│   ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  │
│   │ Heures │  │ Heures│  │ Congés│  │ Dern. │  │
│   │ 7h45   │  │ sup.  │  │ rest. │  │ paie  │  │
│   │        │  │ 0h    │  │ 18j   │  │ 637K  │  │
│   └───────┘  └───────┘  └───────┘  └───────┘  │
│                                                 │
│   Graphique des heures hebdomadaires            │
│   ████████████████░░░░░░░░░░░░░░░░              │
│                                                 │
│   Mes derniers congés      Mes bulletins        │
│   ┌────────────────────┐   ┌────────────────┐   │
│   │ En attente : 1     │   │ Nov 2024       │   │
│   │ Approuvés : 1      │   │ Oct 2024       │   │
│   │ Refusés : 0        │   │ Sep 2024       │   │
│   └────────────────────┘   └────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 2. Modules utilisateur

### 2.1. Pointage (Arrivée / Départ)

**Méthode 1 — QR code (recommandé)**

1. Ouvrez l'application sur votre téléphone ou ordinateur
2. Allez dans **Scanner** (menu de gauche)
3. Pointez l'appareil photo vers le QR code affiché à l'entrée
4. Validez : l'heure d'arrivée est enregistrée
5. Répétez pour **pause déjeuner**, **retour de pause**, et **départ**

_Si le scan ne fonctionne pas :_ saisissez le code `EP-XXXXXXXX` affiché sous le QR code.

**Méthode 2 — Agent de sécurité**
Présentez votre badge ou le QR code depuis l'écran d'accueil à l'agent de sécurité. L'agent enregistre votre pointage depuis sa borne.

### 2.2. Congés

**Demander un congé**

1. Menu **Congés** → **Nouvelle demande**
2. Choisissez le type (Annuel, Maladie, Maternité, Spécial)
3. Sélectionnez les dates de début et fin
4. Ajoutez un motif (optionnel mais recommandé)
5. Cliquez **Soumettre**

**Suivi de vos demandes**

| Statut        | Signification                                               |
| ------------- | ----------------------------------------------------------- |
| ⏳ En attente | Votre responsable n'a pas encore répondu                    |
| ✅ Approuvé   | Congé validé — vous êtes en congé ces jours                 |
| ❌ Refusé     | La demande a été refusée (un commentaire explique pourquoi) |

**Soldes disponibles**
Le tableau de bord affiche vos jours de congé annuel restants. Par défaut : 22 jours par an.

### 2.3. Bulletins de paie

1. Menu **Paie** → **Mes bulletins**
2. La liste des bulletins disponibles s'affiche (par mois)
3. Cliquez sur un bulletin pour le **consulter** ou le **télécharger en PDF**

_Détail affiché :_ salaire de base, primes, déductions, salaire net.

### 2.4. Missions et notes de frais

**Déclarer une mission**

1. Menu **Missions** → **Nouvelle mission**
2. Remplissez : destination, dates, objectif, budget estimé
3. Soumettez pour approbation

**Ajouter des notes de frais**

1. Depuis une mission approuvée, cliquez **Ajouter une note de frais**
2. Sélectionnez la catégorie (transport, hébergement, repas)
3. Saisissez le montant et joignez un justificatif (photo du reçu)

### 2.5. Formations

1. Menu **Formations** → **Catalogue**
2. Parcourez les cours disponibles
3. Cliquez **S'inscrire** pour commencer
4. Suivez les leçons et passez le quiz final
5. Obtenez votre **certificat** de réussite (téléchargeable)

### 2.6. Objectifs et évaluations

**Mes objectifs**

- Consultez vos objectifs de la période
- Mettez à jour leur avancement (En attente → En cours → Terminé)

**Mes évaluations**

- Lisez les évaluations soumises par votre responsable
- Accusez réception pour valider la revue

### 2.7. Messagerie et équipes

- **Messages** : échangez avec vos collègues (texte, images, fichiers)
- **Équipes** : consultez la composition de vos équipes
- **Fil d'actualité** : publiez des messages, likez et commentez

---

## 3. Fonctionnalités mobiles et hors ligne

### Application mobile (PWA)

L'application s'installe sur votre téléphone sans passer par un store :

**Android (Chrome)**

1. Ouvrez l'URL dans Chrome
2. Appuyez sur le menu ⋮ → **Installer l'application**
3. L'icône apparaît sur votre écran d'accueil

**iPhone (Safari)**

1. Ouvrez l'URL dans Safari
2. Appuyez sur **Partager** → **Sur l'écran d'accueil**
3. L'icône apparaît sur votre écran d'accueil

### Mode hors ligne

Les données déjà consultées restent accessibles sans connexion Internet. Les actions effectuées hors ligne (pointage, demande de congé) sont synchronisées automatiquement lorsque la connexion revient.

---

## 4. Problèmes courants

| Problème                             | Solution                                                                   |
| ------------------------------------ | -------------------------------------------------------------------------- |
| Je ne peux pas me connecter          | Vérifiez votre email/mot de passe. Contactez le RH si le problème persiste |
| Le QR code ne scanne pas             | Saisissez le code manuellement (`EP-...`). Utilisez Chrome ou Edge         |
| Je ne vois pas mes bulletins de paie | Les bulletins sont disponibles après le traitement de la paie du mois      |
| Mon congé est bloqué en "En attente" | Relancez votre responsable ou le service RH                                |
| L'affichage est déformé sur mobile   | Utilisez le menu hamburger ☰ pour naviguer                                |

---

## 5. Support

- **Documentation en ligne** : `/api/docs` (documentation technique)
- **Contact RH** : adressez-vous à votre responsable des ressources humaines
- **Contact technique** : service informatique de votre entreprise

---

_EmployraRH v1.0 — Document utilisateur_
