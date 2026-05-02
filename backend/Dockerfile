# =====================================================
# Backend Dockerfile — NestJS
# =====================================================
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy prisma schema first and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Build the NestJS app
RUN npm run build

# Expose port
EXPOSE 3000

# Run migrations then start
CMD npx prisma migrate deploy && node dist/main
