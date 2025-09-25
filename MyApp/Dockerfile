# Use Node.js base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /MyApp

# Copy package.json and package-lock.json first
COPY ./package.json package.json
COPY ./package-lock.json package-lock.json

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 8081

# Start your app
ENTRYPOINT ["npm", "run"]


