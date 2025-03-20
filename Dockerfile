# Use an appropriate base image
FROM node:18

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y wget python3 python3-pip ffmpeg

# Install yt-dlp from GitHub
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && ln -s /usr/local/bin/yt-dlp /usr/bin/yt-dlp  # Create a symlink

# Verify installation
RUN yt-dlp --version

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire application
COPY . .

# Expose the necessary port
EXPOSE 8000

# Start the server
CMD ["npm", "start"]
