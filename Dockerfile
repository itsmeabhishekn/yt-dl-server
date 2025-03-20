# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy application files
COPY . .

# Expose correct port
EXPOSE 8000  # Make sure this matches docker-compose.yml

# Start server
CMD ["node", "server.js"]
