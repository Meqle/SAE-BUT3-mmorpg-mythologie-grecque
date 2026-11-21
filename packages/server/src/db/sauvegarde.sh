#!/bin/sh
# Sauvegarde automatique de PostgreSQL (service « sauvegarde » de docker-compose).
#
# - Une sauvegarde au démarrage, puis toutes les SAUVEGARDE_INTERVALLE secondes (24 h par défaut).
# - Format « custom » de pg_dump (-Fc) : compressé, et restaurable table par table.
# - On garde les SAUVEGARDE_JOURS derniers jours (7 par défaut) ; les plus anciennes sont supprimées.
# - SAUVEGARDE_UNE_FOIS=1 : une seule sauvegarde, puis arrêt (sauvegarde manuelle).
#
# Connexion : variables PGHOST, PGUSER, PGPASSWORD, PGDATABASE (lues directement par pg_dump).
set -eu

DOSSIER=/sauvegardes
INTERVALLE=${SAUVEGARDE_INTERVALLE:-86400}
JOURS=${SAUVEGARDE_JOURS:-7}
mkdir -p "$DOSSIER"

sauvegarder() {
    fichier="$DOSSIER/mythologia_$(date +%Y-%m-%d_%Hh%M).dump"
    # On écrit d'abord dans un fichier temporaire : si pg_dump échoue au milieu,
    # on ne laisse pas une sauvegarde incomplète qui aurait l'air valide.
    if pg_dump --format=custom --file="$fichier.tmp"; then
        mv "$fichier.tmp" "$fichier"
        echo "[sauvegarde] $(date '+%d/%m %H:%M') OK : $(basename "$fichier") ($(du -h "$fichier" | cut -f1))"
    else
        rm -f "$fichier.tmp"
        echo "[sauvegarde] $(date '+%d/%m %H:%M') ÉCHEC de pg_dump" >&2
        return 1
    fi
    # Rotation : supprime les sauvegardes de plus de JOURS jours.
    find "$DOSSIER" -name 'mythologia_*.dump' -mtime +"$JOURS" -print -delete | sed 's/^/[sauvegarde] supprimée (trop ancienne) : /'
}

if [ "${SAUVEGARDE_UNE_FOIS:-0}" = "1" ]; then
    sauvegarder
    exit $?
fi

while true; do
    sauvegarder || true      # un échec ponctuel n'arrête pas le service
    sleep "$INTERVALLE"
done
