FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/client/package.json packages/client/package.json
COPY packages/server/package.json packages/server/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci

COPY . .
RUN npm run build

FROM build AS production-dependencies
RUN npm prune --omit=dev

FROM node:24-alpine AS server
ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /app
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/packages/server/package.json ./packages/server/package.json
COPY --from=build /app/packages/server/dist ./packages/server/dist
EXPOSE 3001
CMD ["node", "packages/server/dist/index.js"]

FROM nginx:stable-alpine AS client
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/client/dist /usr/share/nginx/html
EXPOSE 80
