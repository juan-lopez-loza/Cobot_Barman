# Backend - Cobot Barman (FastAPI + Python + UV)

Ce répertoire contient l'API et la logique de contrôle du cobot **Universal Robots UR10** et de sa pince **OnRobot RG6 V2**.

---

## 🛠️ Stack Technique

* **Langage** : Python 3.12+
* **Gestionnaire de dépendances & environnement** : [uv](https://github.com/astral-sh/uv) (alternative moderne, ultra-rapide à pip)
* **Framework Web** : [FastAPI](https://fastapi.tiangolo.com/) (pour les routes et la documentation automatique)
* **ORM / Base de données** : [SQLModel](https://sqlmodel.tiangolo.com/) (combinaison de SQLAlchemy et Pydantic)
* **Serveur de Base de Données** : MariaDB (via le pilote `pymysql`)
* **Communication Robot** : Client Socket TCP/IP (port 30002) + Serveur XML-RPC (port 8080)
* **Sécurité & Authentification** : JWT (JSON Web Tokens) et cryptage de mot de passe avec `bcrypt`

---

## ⚙️ Concepts Clés du Fonctionnement du Robot

Le backend sert de chef d'orchestre pour le robot UR10 en coordonnant les commandes, la génération de trajectoires et la synchronisation des états :

### 1. Génération de scripts URScript dynamiques
Dans la méthode `create_script` (définie dans [robot.py](Cobot_Barman/backend/app/utils/robot.py)), le backend :
1. Récupère la recette du cocktail commandé.
2. Identifie les coordonnées cartésiennes de départ et d'arrivée (ex. position du verre libre, position de distribution du sirop/eau).
3. Lit le fichier de base `init_onrobot.script` (qui initialise le pilote de la pince OnRobot RG6).
4. Concatène des instructions de mouvement de type `movej` (mouvement dans l'espace articulaire) ou `movel` (mouvement linéaire dans l'espace cartésien), ainsi que les commandes d'ouverture/fermeture de la pince (`rg_command`).
5. Intègre des appels XML-RPC pour notifier le backend de son état d'exécution.

### 2. Le Serveur XML-RPC
Un serveur XML-RPC écoute sur le port `8080` (démarré de manière asynchrone dans un thread séparé). Le robot UR10 exécute des requêtes RPC vers ce serveur pour modifier le statut global (ex: `set_status_program_started()` et `set_status_program_finished()`).
Cela garantit une synchronisation parfaite entre les mouvements physiques du robot et le statut renvoyé par l'API Web.

### 3. File d'attente Preemptive (Thread-safe)
Les commandes envoyées au robot passent par une file d'attente (`Queue`).
* Si le robot est inactif (`IDLE`), le script compilé lui est immédiatement envoyé via Socket.
* Si le robot est déjà occupé (`RUNNING`), la commande reste dans la file d'attente.
* Dès que le robot termine et appelle `set_status_program_finished()` via XML-RPC, un callback dépile la commande suivante de la file d'attente après un temps de sécurité de 2 secondes.

---

## 🗄️ Structure de la Base de Données

Les modèles SQLModel définis dans [db.py](Cobot_Barman/backend/database/db.py) sont les suivants :

* **Cocktail** : Nom du cocktail et liste des étapes.
* **RecipeStep** : Une étape individuelle d'une recette (associée à une boisson spécifique, ordre de l'étape, description, et points de trajectoire).
* **TrajectoryPoint** : Points cartésiens (`x, y, z, rx, ry, rz`), vitesse, et durée du mouvement pour une étape donnée.
* **GlassSlot** : Emplacement physique des verres (`x, y, z, rx, ry, rz`) et leur état de disponibilité (`is_free`).
* **Drink** : Coordonnées de distribution de boissons individuelles (eau, sirops, etc.).
* **Admin** : Utilisateurs administrateurs stockés de manière sécurisée (nom d'utilisateur et mot de passe hashé en bcrypt) pour l'accès aux routes de gestion.

---

## 🔌 Liste des Routes API

### Authentification
* **`POST /admin/login`** : Permet à un administrateur de se connecter en échange d'un JWT Token (Bearer).

### Commandes
* **`POST /orders/`** : Ajoute une commande de boisson à la file d'attente. 
  * *Query Parameter* : `drink_id` (int)
  * *Fonctionnement* : Récupère la recette, trouve un verre disponible, met à jour son état, génère l'URScript, l'ajoute à la queue et déclenche le robot.

### Cocktails
* **`GET /cocktails/`** : Récupère la liste complète des cocktails disponibles.
* **`PUT /cocktails/edit/cocktail_id`** : Modifie la configuration d'un cocktail (Nom, mouvements). 
  * *Nécessite une authentification Admin.*

### Verres (Glasses)
* **`GET /glasses/`** : Récupère l'état et l'emplacement de tous les verres.
  * *Nécessite une authentification Admin.*
* **`PUT /glasses/edit_glasses/{glasses_id}`** : Modifie l'état de présence/disponibilité d'un verre.
  * *Nécessite une authentification Admin.*
* **`POST /glasses/add_glasses/{glasses_id}`** : Ajoute un nouvel emplacement ou une nouvelle configuration de verre.

### Robot
* **`GET /robot/status`** : Récupère le statut actuel du robot (IDLE, RUNNING, ERROR), la commande en cours et le timestamp de la dernière mise à jour.

---

## 🚀 Lancement en Local (sans Docker)

Si vous souhaitez démarrer le backend manuellement hors Docker :

1. **Installer `uv`** (si ce n'est pas déjà fait) :
   ```bash
   pip install uv
   ```
2. **Synchroniser l'environnement et installer les dépendances** :
   ```bash
   uv sync
   ```
3. **Configurer les variables d'environnement** dans un fichier `.env`.
4. **Démarrer le serveur FastAPI** :
   ```bash
   uv run fastapi run api/main.py --host 0.0.0.0 --port 8000
   ```
