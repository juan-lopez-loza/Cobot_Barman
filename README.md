# Cobot Barman - Projet de Stage (UR10 + OnRobot RG6 V2)

Ce projet a été réalisé dans le cadre de mon **stage de première année de Bachelor**, d'une durée de **1 mois** au sein de l'entreprise **Envoi du Net**.

L'objectif de ce projet est de programmer un robot collaboratif (cobot) **Universal Robots UR10** équipé d'une pince **OnRobot RG6 V2** afin de lui faire réaliser des tâches de barman (préparation et service de boissons/cocktails de manière automatisée).

---

## 🏗️ Architecture Globale

Le projet est divisé en trois composants principaux :

1. **Frontend (Vite + React + TypeScript)** : Interface utilisateur intuitive permettant aux clients de commander des boissons et aux administrateurs de gérer les stocks, l'état des verres et la configuration des cocktails.
2. **Backend (FastAPI + Python 3.12 + UV)** : Serveur central gérant la logique métier, la file d'attente des commandes, la génération de scripts URScript pour le cobot, la base de données, et la communication bidirectionnelle avec le robot.
3. **Base de données (MariaDB)** : Stockage relationnel pour la configuration des cocktails, les étapes de recettes, les coordonnées spatiales, et les informations d'administration.

```mermaid
graph TD
    Client[Interface Web Client / Admin] <-->|HTTP / JSON| API[FastAPI Backend]
    API <-->|SQL| DB[(MariaDB Database)]
    API --->|Socket TCP Port 30002 / URScript| UR10[Cobot UR10]
    UR10 --->|XML-RPC Callbacks| API
    UR10 <-->|I/O| RG6[Pince OnRobot RG6 V2]
```

---

## 🛠️ Concepts Techniques du Projet

### 1. Génération de scripts URScript à la volée
Le robot UR10 est programmé en **URScript**, un langage propriétaire d'Universal Robots proche du Python. Au lieu d'avoir un programme statique stocké sur le robot, le backend FastAPI génère dynamiquement du code URScript pour chaque boisson commandée en assemblant les trajectoires (points de passage, hauteurs de sécurité, coordonnées de verres et de distributeurs) lues depuis la base de données et les fichiers JSON.

### 2. Communication Socket TCP (Envoi des programmes)
Le script généré par le backend est envoyé directement au contrôleur de l'UR10 via une connexion **Socket TCP/IP** sur le port primaire/secondaire du robot (généralement `30002` ou `30001`). Le contrôleur du robot compile et exécute immédiatement le script reçu.

### 3. Serveur XML-RPC (Retour d'état en temps réel)
Pour synchroniser l'état du robot avec le backend, le script URScript envoyé au robot contient des appels **XML-RPC** vers le backend. 
- Au démarrage du mouvement, le robot appelle la méthode XML-RPC `set_status_program_started()`.
- À la fin du service, il appelle `set_status_program_finished()`.
Cela permet au backend de savoir précisément quand le robot est disponible pour la commande suivante.

### 4. File d'attente des commandes (Command Queue)
Pour éviter que des commandes simultanées n'interfèrent ou ne se perdent, le backend utilise une file d'attente (`Queue`) thread-safe. Si une commande est passée alors que le robot est déjà occupé, elle est mise en attente et automatiquement envoyée dès que le robot signale la fin de la tâche précédente via XML-RPC.

---

## 🚀 Lancement Rapide avec Docker

Le projet est entièrement conteneurisé à l'aide de **Docker** et **Docker Compose**, ce qui permet de le lancer en une seule commande sans avoir à configurer Python ou Node.js localement.

### Prérequis
- [Docker](https://www.docker.com/products/docker-desktop/) installé et démarré.
- Un fichier `.env` configuré à la racine du projet (vous pouvez copier et remplir le fichier `.env-ex`).

### Configuration du fichier `.env`
Renommez `.env-ex` en `.env` et ajustez les variables :
```env
# Variables du Robot (IP et Port de connexion TCP du contrôleur UR10)
ROBOT_HOST="192.168.1.100" # Mettre l'adresse IP réelle ou un simulateur
ROBOT_PORT=30002

# Base de données MariaDB
DB_USER="cobot_user"
DB_PASSWORD="your_password"
DB_ROOT_PASSWORD="your_root_password"
DB_DATABASE="cobot_barman"
DB_PORT=3306
DATABASE_URL="mysql+pymysql://cobot_user:your_password@cobot_db:3306/cobot_barman"

# Hôte Backend pour le serveur XML-RPC (accessible par le Robot)
BACKEND_HOST="192.168.1.50" # IP locale de la machine exécutant le backend Docker
BACKEND_RPC_PORT=8080

# Frontend (API URL)
VITE_API_URL="http://localhost:8000"

# Sécurité (JWT Token)
SECRET_KEY="votre_cle_secrete_super_securisee"
ALGORITHM="HS256"
```

### Commandes pour lancer l'application

1. **Démarrer tous les services (Database, Backend, Frontend) :**
   ```bash
   docker compose up --build
   ```

2. **Démarrer en arrière-plan (mode détaché) :**
   ```bash
   docker compose up -d
   ```

3. **Arrêter les services :**
   ```bash
   docker compose down
   ```

4. **Accéder aux interfaces :**
   - **Frontend (Application Web) :** [http://localhost:5173](http://localhost:5173)
   - **Backend API (Documentation interactive Swagger) :** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📂 Structure du Répertoire

- [backend/](file:///Users/juan/Dev/pro/Stage/Cobot_Barman/backend) : Code source FastAPI, logique de pilotage URScript, gestion XML-RPC, base de données SQLModel.
- [frontend/](file:///Users/juan/Dev/pro/Stage/Cobot_Barman/frontend) : Application React en TypeScript construite avec Vite (interface client & espace administration).
- [docker-compose.yml](file:///Users/juan/Dev/pro/Stage/Cobot_Barman/docker-compose.yml) : Fichier de configuration multi-conteneur pour orchestrer l'ensemble de la solution.