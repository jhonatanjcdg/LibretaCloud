
# Base image
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine

# Install openssl and libc6-compat for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 4000

# Start the server
CMD ["npm", "run", "start:prod"]
