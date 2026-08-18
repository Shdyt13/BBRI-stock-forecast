# Frontend Dockerfile - React + Vite
# Base image: Node.js 18 Alpine (lightweight)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose port 3000 (we'll configure Vite to use this port)
EXPOSE 3000

# Command to run Vite dev server
# --host 0.0.0.0 makes it accessible from outside the container
# --port 3000 sets the port explicitly
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
