#!/usr/bin/env bash
# Sube los cambios a GitHub solo si hay algo nuevo y pasa las revisiones.
# Uso:  ./subir.sh "mensaje del commit"      (pide confirmación)
#       ./subir.sh -y "mensaje del commit"   (sin confirmación)

cd "$(dirname "$0")" || exit 1

SI=0
if [ "${1:-}" = "-y" ]; then SI=1; shift; fi
MENSAJE="${1:-}"

# 1. ¿Hay cambios nuevos?
if [ -z "$(git status --porcelain)" ]; then
  echo "No hay cambios nuevos. No hay nada que subir."
  exit 0
fi

# 2. ¿El remoto tiene algo que no tengo?
if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
  git fetch -q 2>/dev/null
  atras=$(git rev-list --count 'HEAD..@{u}' 2>/dev/null || echo 0)
  if [ "$atras" -gt 0 ]; then
    echo "AVISO: GitHub tiene $atras commit(s) que no tienes aquí."
    echo "Ejecuta primero:  git pull --rebase"
    exit 1
  fi
fi

git add -A
fallo=0

# 3. Archivos prohibidos
prohibidos=$(git diff --cached --name-only | grep -E '(^|/)\.env$|(^|/)node_modules/|\.log$|(^|/)\.secretos\.local$')
if [ -n "$prohibidos" ]; then
  echo "ERROR: archivos que no deben subirse:"; echo "$prohibidos"; fallo=1
fi

# 4. Los workflows no pueden desaparecer
en_repo=$(git ls-tree -r --name-only HEAD -- workflows 2>/dev/null | wc -l)
en_stage=$(git ls-files -- workflows | wc -l)
if [ "$en_repo" -gt 0 ] && [ "$en_stage" -lt "$en_repo" ]; then
  echo "ERROR: se perderían $((en_repo - en_stage)) workflow(s) del repositorio."
  echo "       Revisa la carpeta workflows antes de subir."; fallo=1
fi

# 5. Secretos en las líneas que se van a subir
agregado=$(git diff --cached -U0 -- . ':(exclude)package-lock.json' ':(exclude)*/package-lock.json' | grep '^+' | grep -Ev '^\+\+\+')
patrones='[0-9a-f]{64}|Bearer [0-9a-f]{20}'
if [ -f .secretos.local ]; then
  while IFS= read -r linea; do
    [ -n "$linea" ] && patrones="$patrones|$linea"
  done < .secretos.local
fi
hallazgos=$(echo "$agregado" | grep -Ein "$patrones" | cut -c1-120)
if [ -n "$hallazgos" ]; then
  echo "ERROR: posibles secretos en lo que vas a subir:"; echo "$hallazgos" | head -10; fallo=1
fi

if [ "$fallo" -ne 0 ]; then
  git reset -q
  echo; echo "No se subió nada. Corrige lo anterior y vuelve a intentar."
  exit 1
fi

# 6. Resumen y mensaje
echo "Cambios a subir:"; git status --short
if [ -z "$MENSAJE" ]; then read -r -p "Mensaje del commit: " MENSAJE; fi
if [ -z "$MENSAJE" ]; then git reset -q; echo "Sin mensaje, cancelado."; exit 1; fi
if [ "$SI" -eq 0 ]; then
  read -r -p "¿Subir ahora? (s/n): " r
  if [ "$r" != "s" ]; then git reset -q; echo "Cancelado."; exit 0; fi
fi

git commit -q -m "$MENSAJE" && git push && echo "Listo: cambios subidos."
