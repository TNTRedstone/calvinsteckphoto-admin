# Use a Node.js image as the base
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the SvelteKit app runs on
EXPOSE 5173

# Command to run both the dev server and the monitoring script
CMD npm run dev -- --host & npm run monitor && wait -n