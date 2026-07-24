FROM node:24-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=4000

COPY backend/package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY backend ./

RUN mkdir -p /app/backend/data /app/backend/uploads

EXPOSE 4000

CMD ["node", "--no-warnings=ExperimentalWarning", "src/server.js"]
