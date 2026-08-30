# Projet jetable de validation VPS

Ce projet valide la chaîne frontend → API → PostgreSQL avec migrations, logs, sauvegarde et restauration. Aucun service privé ne publie de port hôte : seul le frontend doit recevoir un domaine via le proxy Coolify.

## Services

- `frontend` : Nginx statique, point d'entrée HTTP interne 80.
- `api` : Node.js, API JSON et logs structurés.
- `db` : PostgreSQL 17, volume persistant, sans port public.
- rôle applicatif `test_app` : connexion autorisée sans privilège superutilisateur, sans création de base ni de rôle.

## Variables secrètes

Créer dans Coolify, sans les placer dans Git :

- `POSTGRES_ADMIN_PASSWORD` ;
- `APP_DB_PASSWORD`.

Utiliser deux valeurs aléatoires différentes. Le fichier `.env.example` ne contient que des exemples non fonctionnels.

## Validation attendue

1. Publier ce dossier dans un dépôt Git jetable.
2. Créer une application Docker Compose dans Coolify depuis ce dépôt.
3. Définir les deux variables secrètes.
4. Attribuer un domaine HTTPS uniquement au service `frontend` sur son port interne 80.
5. Déployer et vérifier que tous les conteneurs sont sains.
6. Créer puis relire une note dans l'interface.
7. Vérifier les logs JSON de l'API dans Coolify.
8. Exécuter `scripts/backup.sh` dans un checkout opérateur.
9. Exécuter `scripts/restore-test.sh <dump>` ; la restauration crée une base distincte et ne détruit jamais la source.
10. Vérifier la base restaurée avant de demander l'autorisation de la supprimer.

Le déploiement réel devra aussi copier le dump vers la destination externe retenue. Une copie laissée uniquement sur le VPS ne constitue pas une sauvegarde suffisante.
