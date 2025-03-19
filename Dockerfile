# Use official Node.js image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy app files into container
COPY . .

# Install dependencies
RUN npm install

# Expose the application port
EXPOSE 3000

# Command to run the server
CMD ["node", "server.js"]
