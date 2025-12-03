# Dockerfile for Next.js Frontend (Development)

FROM node:20-alpine

# Install libc6-compat for compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for development)
RUN npm ci --legacy-peer-deps

# Copy application code
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=development

# Expose port
EXPOSE 3000

# Set environment variable for port
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })" || exit 1

# Start the development server with hot-reload
CMD ["npm", "run", "dev"]
