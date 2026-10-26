FROM nginx:1.27.3-alpine

RUN mkdir -p /var/run/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/run/nginx \
    && chown -R nginx:nginx /usr/share/nginx/html

COPY index.html style.css script.js /usr/share/nginx/html/

USER nginx
EXPOSE 8080
