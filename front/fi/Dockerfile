# Etapa de construcción
FROM node:18-slim AS build
WORKDIR /app

# Copia y instala solo las dependencias necesarias para el build
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Aumenta el límite de memoria para Node.js durante el build (3GB en este ejemplo)
ENV NODE_OPTIONS="--max-old-space-size=2056"

# Copia el código fuente y ejecuta el build
COPY . .
RUN npm run build

# Etapa de producción
FROM nginx:alpine
COPY ./config/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/app

# Expone el puerto para Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
