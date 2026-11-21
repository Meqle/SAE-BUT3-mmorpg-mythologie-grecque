#!/bin/sh
# Lancé par Docker au premier démarrage de PostgreSQL (après schema, seed, demo).
# Crée les rôles limités de roles.sql avec les mots de passe du fichier .env.
# (Un fichier .sql seul ne peut pas lire les variables d'environnement : d'où ce petit script.)
set -e

if [ -z "$POSTGRES_APP_PASSWORD" ] || [ -z "$POSTGRES_LECTURE_PASSWORD" ]; then
    echo "04_roles.sh : POSTGRES_APP_PASSWORD et POSTGRES_LECTURE_PASSWORD doivent être définis" >&2
    exit 1
fi

psql -v ON_ERROR_STOP=1 \
     --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
     -v app_password="$POSTGRES_APP_PASSWORD" \
     -v lecture_password="$POSTGRES_LECTURE_PASSWORD" \
     -f /etc/mythologia/roles.sql
