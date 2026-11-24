FROM oven/bun:1.4-alpine AS builder

WORKDIR /app
COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

ARG PUBLIC_PATH=/
ARG DEFAULT_MANIFEST_URL=
ENV NODE_ENV=production
ENV PUBLIC_PATH=$PUBLIC_PATH
ENV DEFAULT_MANIFEST_URL=$DEFAULT_MANIFEST_URL

RUN bun run build

FROM nginx:1.29-alpine AS runtime

ENV NGINX_HOST=_
ENV NGINX_PORT=80

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

