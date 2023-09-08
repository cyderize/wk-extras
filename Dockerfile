FROM node:lts-alpine as build

COPY . /src

WORKDIR /src

RUN npm ci && \
    npm run build -- --outDir /dist

FROM busybox:1.36

COPY --from=build /dist/ /var/www/html

WORKDIR /var/www/html

CMD ["busybox", "httpd", "-f", "-v"]
