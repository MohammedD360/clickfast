FROM nginx:1.27.3-alpine

RUN sed -i -e 's|^pid .*|pid /tmp/nginx.pid;|' -e '/^user /d' /etc/nginx/nginx.conf \
    && sed -i 's|listen       80;|listen       8080;|' /etc/nginx/conf.d/default.conf \
    && chown -R nginx:nginx /var/cache/nginx

COPY index.html style.css script.js /usr/share/nginx/html/

USER nginx
EXPOSE 8080
