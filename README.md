# ClickFast

Jeu de clicker : 5 secondes pour cliquer le plus vite possible.
Servi par Nginx dans un conteneur, process non-root.

## Lancer le jeu en local

Ouvrir `index.html` dans un navigateur.

## Lancer via Docker

    docker build -t clickfast .
    docker run -d -p 8080:8080 clickfast

Ouvrir http://localhost:8080

## Journal de bord

### Étape 1 — Le jeu tourne en local
- Score, chrono 5 s, rejouable.
- Sans API, la console avertit "Envoi du score impossible" — attendu.

### Étape 2 — Image de production
- Base épinglée : `nginx:1.27.3-alpine`.
- `.dockerignore` exclut `.git`, `README.md`, `Dockerfile`, `node_modules`.
- Non-root : chown des dossiers nginx + `USER nginx` + port 8080.
- Mesures : (à compléter après build).
