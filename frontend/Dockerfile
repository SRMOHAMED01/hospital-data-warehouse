# ══════════════════════════════════════════
# ÉTAPE 1 : Build de l'application React/Vite
# ══════════════════════════════════════════
FROM node:20-alpine AS build

WORKDIR /app

# Récupération de la variable d'API lors du build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ══════════════════════════════════════════
# ÉTAPE 2 : Serveur web Nginx léger pour la production
# ══════════════════════════════════════════
FROM nginx:alpine

# Copie des fichiers statiques générés
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]