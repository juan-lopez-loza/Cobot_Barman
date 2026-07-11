# Frontend - Cobot Barman (React + Vite + TypeScript)

Ce répertoire contient l'interface utilisateur web du projet **Cobot Barman**. Elle permet à la fois aux clients de commander leurs boissons en libre-service et aux administrateurs de configurer le système en temps réel.

---

## 🛠️ Stack Technique

* **Framework** : [React 18](https://react.dev/)
* **Outil de Build & Serveur Dev** : [Vite](https://vitejs.dev/) (ultra-rapide pour le développement)
* **Langage** : [TypeScript](https://www.typescriptlang.org/) (assure la sécurité des types pour les props, les states et les données API)
* **Requêtes HTTP** : [Axios](https://axios-http.com/)
* **Styles CSS** : CSS standard moderne avec responsive design

---

## 📂 Structure du Projet

* **`src/pages/`** :
  * **[HomePage.tsx](file:///Users/juan/Dev/pro/Stage/Cobot_Barman/frontend/src/pages/HomePage.tsx)** : L'interface principale destinée aux clients. Elle affiche les différents cocktails et boissons disponibles et permet de lancer la préparation d'une boisson en envoyant une commande au robot.
  * **[AdminPage.tsx](file:///Users/juan/Dev/pro/Stage/Cobot_Barman/frontend/src/pages/AdminPage.tsx)** : Espace sécurisé réservé aux administrateurs. Il permet d'éditer les cocktails, de voir l'état physique des verres, de gérer les stocks ou d'interagir directement avec le robot.
* **`src/components/`** :
  * **[CocktailCard.tsx](file:///Users/juan/Dev/pro/Stage/Cobot_Barman/frontend/src/components/CocktailCard.tsx)** : Composant réutilisable pour afficher les détails d'un cocktail (nom, ingrédients/mouvements) avec un bouton de commande.
  * **`admin/`** : Composants dédiés aux onglets d'administration (gestion des verres, des configurations, etc.).
* **`src/services/`** :
  * Fichiers de configuration Axios pour l'appel des différentes routes du backend (`/orders`, `/cocktails`, `/glasses`, `/robot`).
* **`src/hooks/`** :
  * Custom hooks React pour la gestion de l'état ou le polling du statut du robot.

---

## 🔧 Intégration avec le Backend

L'application communique avec le backend FastAPI à l'aide de requêtes HTTP.
L'URL de l'API est injectée dynamiquement via la variable d'environnement :
* **`VITE_API_URL`** (définit l'adresse du backend FastAPI, ex: `http://localhost:8000`).

### Authentification de l'Espace Admin
L'accès à l'espace d'administration et aux modifications se fait via un JWT Token (JSON Web Token) stocké localement après une authentification réussie sur la route `/admin/login`. Ce token est ensuite automatiquement envoyé dans le header `Authorization: Bearer <token>` lors des appels API d'administration.

---

## 🚀 Lancement en Local (sans Docker)

Si vous préférez exécuter l'application localement en mode développement sans passer par Docker :

1. **Installer les dépendances Node.js** :
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement** :
   Créez un fichier `.env` dans le dossier `frontend` (ou utilisez le `.env` à la racine) contenant :
   ```env
   VITE_API_URL="http://localhost:8000"
   ```

3. **Démarrer le serveur de développement Vite** :
   ```bash
   npm run dev
   ```
   L'interface sera disponible sur [http://localhost:5173](http://localhost:5173).

4. **Compiler l'application pour la production** :
   ```bash
   npm run build
   ```
   Le dossier `dist/` généré contiendra les fichiers HTML/JS/CSS statiques prêts à être déployés sur un serveur web.
