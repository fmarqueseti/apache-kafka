# Base Image
FROM node:24-bookworm

# Working Directory
WORKDIR /app

# Installing dependencies (copy package.json first to take advantage of caching)
COPY package.json ./
RUN npm install --omit=dev                                 # Installs the dependencies declared in package.json

# Copying the script
COPY producer.js ./

# Running the script
CMD ["node", "producer.js"]
