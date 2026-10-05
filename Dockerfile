FROM node:26-alpine

WORKDIR /app
ENV NODE_ENV=production NPM_CONFIG_UPDATE_NOTIFIER=false

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node knexfile.js ./
COPY --chown=node:node src ./src

USER node
EXPOSE 3000

CMD ["node", "src/server.js"]
