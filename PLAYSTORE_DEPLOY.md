# 🚀 Guide de Déploiement sur Google Play Store

Ce guide vous accompagne dans le processus de déploiement de l'application **myIETV** sur le Google Play Store.

---

## 📋 Prérequis

### 1. Compte Google Play Console
- Créer un compte développeur Google Play : [https://play.google.com/console](https://play.google.com/console)
- Frais unique de 25$ pour l'inscription
- Compléter les informations de profil et les informations fiscales

### 2. Compte Expo
- Créer un compte gratuit : [https://expo.dev](https://expo.dev)
- Se connecter avec : `eas login`

### 3. Outils installés
✅ EAS CLI est déjà installé
✅ Node.js et npm sont configurés
✅ Configuration `app.json` et `eas.json` complétée

---

## 🔧 Étape 1 : Configuration initiale

### 1.1 Se connecter à EAS
```bash
eas login
```

### 1.2 Configurer le projet
```bash
eas build:configure
```

### 1.3 Vérifier la configuration
Assurez-vous que `app.json` contient :
- ✅ `package`: com.myietv.app
- ✅ `versionCode`: 2
- ✅ `version`: 2.0.0

---

## 🏗️ Étape 2 : Créer le keystore (première fois uniquement)

EAS peut générer automatiquement un keystore pour vous :

```bash
eas credentials
```

Sélectionnez :
1. Android
2. Production
3. Set up new Android Keystore
4. Generate new keystore

**IMPORTANT** : EAS va stocker votre keystore de manière sécurisée. Vous n'avez pas à le gérer manuellement.

---

## 📦 Étape 3 : Build de production

### 3.1 Lancer le build AAB (Android App Bundle)
```bash
eas build --platform android --profile production
```

Cette commande va :
- 📤 Upload votre code vers les serveurs Expo
- 🔨 Compiler l'application en AAB
- 🔐 Signer l'application avec votre keystore
- ⏳ Durée estimée : 10-20 minutes

### 3.2 Télécharger le AAB
Une fois le build terminé, vous recevrez un lien pour télécharger le fichier `.aab`.

Alternative : télécharger depuis [https://expo.dev/accounts/[votre-compte]/projects/myIETV/builds](https://expo.dev)

---

## 📱 Étape 4 : Préparer les assets pour le Play Store

### 4.1 Captures d'écran requises
Prendre des captures d'écran de votre application :
- **Minimum 2 captures** (recommandé : 4-8)
- Format : PNG ou JPEG
- Dimensions :
  - Téléphone : 1080 x 1920 px ou 1080 x 2340 px
  - Tablette 7" : 1200 x 1920 px
  - Tablette 10" : 1600 x 2560 px

### 4.2 Icône de l'application
- ✅ Déjà configuré : `./assets/images/icon.png`
- Format : PNG 512 x 512 px
- Icône haute résolution (512x512) sans transparence

### 4.3 Image de présentation (Feature Graphic)
- Dimensions : **1024 x 500 px**
- Format : PNG ou JPEG
- Utilisé dans le Play Store comme bannière

### 4.4 Description de l'application
Préparer :
- **Titre** : max 50 caractères (ex: "myIETV - Vidéos de formation")
- **Description courte** : max 80 caractères
- **Description complète** : max 4000 caractères
- Indiquer les fonctionnalités principales, avantages, etc.

---

## 🌐 Étape 5 : Créer l'application sur Play Console

### 5.1 Accéder à Play Console
1. Aller sur [https://play.google.com/console](https://play.google.com/console)
2. Cliquer sur **"Créer une application"**

### 5.2 Informations de base
- **Nom** : myIETV
- **Langue par défaut** : Français
- **Type** : Application / Jeu → Application
- **Gratuite ou payante** : Gratuite
- Accepter les déclarations de contenu

### 5.3 Configuration requise
Compléter les sections suivantes dans le menu de gauche :

#### a) Fiche du Play Store
- Icône de l'application (512x512)
- Image de présentation (1024x500)
- Captures d'écran
- Descriptions courte et complète
- Catégorie de l'application
- Coordonnées (email de support)
- URL du site web (optionnel)

#### b) Classification du contenu
- Répondre au questionnaire
- Déclarer la catégorie d'âge cible
- Identifier le contenu sensible éventuel

#### c) Confidentialité et sécurité
- **Politique de confidentialité** : URL obligatoire
  - Vous pouvez utiliser un générateur gratuit : [https://www.freeprivacypolicy.com](https://www.freeprivacypolicy.com)
  - Héberger sur votre site ou GitHub Pages
- Déclarer les données collectées (Firebase Auth, Storage, etc.)
- Permissions utilisées justifiées

#### d) Public cible et contenu
- Âge minimum
- Attrait particulier pour les enfants (oui/non)

---

## 📤 Étape 6 : Upload du AAB sur Play Console

### 6.1 Méthode 1 : Upload manuel

1. Dans Play Console, aller à **"Production"** → **"Versions"**
2. Cliquer sur **"Créer une version"**
3. Upload le fichier `.aab` téléchargé à l'étape 3.2
4. Ajouter les **notes de version** (nouveautés)
   ```
   Version 1.0.0
   - Lancement initial de l'application
   - Vidéos de formation IETV
   - Système de favoris
   - Recherche de vidéos
   - Support thème clair/sombre
   ```
5. Enregistrer et vérifier

### 6.2 Méthode 2 : Soumission automatique avec EAS (Recommandé)

#### Configuration du Service Account

1. Dans Google Play Console :
   - **Configuration** → **Accès API**
   - Créer un nouveau **Service Account**
   - Télécharger le fichier JSON (ex: `google-service-account.json`)

2. Placer le fichier dans le dossier racine :
   ```bash
   # Copier le fichier téléchargé
   # C:\Users\USER\Desktop\ProjetSoutenance\myIETV\google-service-account.json
   ```

3. **Ajouter au .gitignore** :
   ```bash
   echo "google-service-account.json" >> .gitignore
   ```

4. Lancer la soumission automatique :
   ```bash
   eas submit --platform android --profile production
   ```

   EAS va :
   - 📤 Upload l'AAB sur Play Console
   - 🔐 Utiliser le service account pour l'authentification
   - 📝 Créer une nouvelle version en "Internal Testing"

---

## 🧪 Étape 7 : Tests internes (Internal Testing)

### 7.1 Créer une piste de test interne
1. **Play Console** → **Tests** → **Tests internes**
2. Créer une version
3. Ajouter des testeurs (emails)
4. Les testeurs recevront un lien pour télécharger l'app

### 7.2 Tests Alpha/Beta (optionnel)
- **Alpha** : Tests fermés avec un groupe restreint
- **Beta** : Tests ouverts ou fermés avec un groupe plus large
- Permet de collecter des retours avant la production

---

## 🚀 Étape 8 : Publication en production

### 8.1 Vérifications finales
- ✅ Toutes les sections de la fiche Play Store complétées
- ✅ Classification du contenu validée
- ✅ Politique de confidentialité publiée
- ✅ AAB uploadé et validé (aucune erreur)
- ✅ Tests effectués

### 8.2 Soumettre pour examen
1. **Play Console** → **Production** → **Versions**
2. Promouvoir la version depuis les tests ou créer une nouvelle
3. Cliquer sur **"Publier"** ou **"Envoyer pour examen"**

### 8.3 Délai d'examen
- ⏱️ Google examine l'application : **quelques heures à quelques jours**
- Vous recevrez une notification par email
- Statuts possibles :
  - ✅ **Approuvée** : Application publiée
  - ❌ **Rejetée** : Corriger les problèmes et soumettre à nouveau

---

## 🔄 Mises à jour futures

### Pour publier une nouvelle version :

1. **Mettre à jour les versions** dans `app.json` :
   ```json
   {
     "version": "1.0.1",
     "android": {
       "versionCode": 2
     }
   }
   ```

2. **Rebuild et submit** :
   ```bash
   eas build --platform android --profile production
   eas submit --platform android --profile production
   ```

3. **Ajouter les notes de version** dans Play Console

---

## 🛠️ Commandes utiles

### Vérifier le statut des builds
```bash
eas build:list
```

### Voir les credentials
```bash
eas credentials
```

### Build local (test)
```bash
eas build --platform android --profile preview --local
```

### Logs du dernier build
```bash
eas build:view
```

---

## 📚 Ressources

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [Documentation EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Guide Google Play Console](https://support.google.com/googleplay/android-developer/)
- [Politiques Google Play](https://play.google.com/about/developer-content-policy/)

---

## ⚠️ Points importants

### Sécurité
- ❌ **NE JAMAIS** commit `google-service-account.json` sur Git
- ✅ Ajouter au `.gitignore`
- ✅ EAS stocke le keystore de manière sécurisée

### Versioning
- **`version`** : Version lisible (1.0.0, 1.0.1, 1.1.0...)
- **`versionCode`** : Nombre entier incrémental (1, 2, 3, 4...)
- ⚠️ Chaque nouvelle version doit avoir un `versionCode` > précédent

### Package name
- `com.myietv.app` est **permanent** et **unique**
- ❌ Ne peut pas être changé après la première publication

### Firebase
- Assurez-vous que Firebase est correctement configuré
- Ajoutez le SHA-1 du keystore de production dans Firebase Console
  ```bash
  eas credentials
  # Sélectionner Android > Production > Keystore
  # Copier le SHA-1 et l'ajouter dans Firebase
  ```

---

## 🎯 Checklist finale

Avant de soumettre en production :

- [ ] Tests internes effectués
- [ ] Aucun crash majeur détecté
- [ ] Toutes les fonctionnalités testées
- [ ] Icônes et images de haute qualité
- [ ] Description claire et attractive
- [ ] Politique de confidentialité publiée
- [ ] Coordonnées de contact valides
- [ ] Classification du contenu complétée
- [ ] Firebase correctement configuré
- [ ] AAB signé et uploadé

---

## 🆘 Problèmes courants

### Erreur : "Package name already exists"
- Le package name est déjà utilisé
- Changer dans `app.json` : `"package": "com.myietv.app2"`

### Erreur : "Version code must be greater"
- Incrémenter `versionCode` dans `app.json`

### Build échoué
- Vérifier les logs : `eas build:view`
- Souvent lié aux dépendances ou à la configuration

### Upload AAB échoué
- Vérifier que le service account a les permissions nécessaires
- Vérifier le chemin du fichier JSON

---

**Félicitations ! Votre application est maintenant prête à être déployée sur le Play Store ! 🎉**
