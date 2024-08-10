FROM node:alpine as build 
WORKDIR /app 
COPY package*.json ./
RUN npm ci 
COPY . . 
RUN npm run build 

FROM nginx:alpine
ADD ./config/default.conf /etc/nginx/conf.d/default.conf 
COPY --from=build /app/dist /var/www/app 
EXPOSE 80 
CMD ["nginx","-g","daemon off;"]