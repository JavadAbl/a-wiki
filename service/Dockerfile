# Use the official Node.js LTS (Long Term Support) Alpine image
FROM node:24.18.1

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (leverages Docker cache)
COPY package*.json ./

# Install production dependencies only
RUN npm ci 
# RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

RUN npx prisma generate
RUN npm run build

# Change ownership of the app files to the built-in 'node' user
# RUN chown -R node:node /app

# Switch to the non-root user for security
USER node

# Expose the port your app listens on
EXPOSE 3000

# Define the command to run your app
CMD ["node", "dist/src/main.js"]