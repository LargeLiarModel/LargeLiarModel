# Dockerfile
FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy rest of the code
COPY . .

# Expose ports (adjust as needed)
EXPOSE 3000 5173

# CMD will be overridden by docker-compose.yml
