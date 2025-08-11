# frontend/Dockerfile

# --- STAGE 1: Build the React App ---
    FROM node:20-alpine AS builder

    # Set working directory
    WORKDIR /app
    
    # Copy package.json and install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy the rest of the source code
    COPY . .
    
    # Build the static files
    # Note: We pass the backend URL as a build argument
    ARG REACT_APP_API_BASE_URL=http://localhost:8000
    ENV VITE_API_BASE_URL=$REACT_APP_API_BASE_URL
    RUN npm run build
    
    # --- STAGE 2: Serve the App with Nginx ---
    FROM nginx:stable-alpine
    
    # Copy the built static files from the 'builder' stage
    COPY --from=builder /app/dist /usr/share/nginx/html
    
    # Copy the nginx config file
    # You will need to create this file (see below)
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expose port 80
    EXPOSE 80
    
    # Start Nginx
    CMD ["nginx", "-g", "daemon off;"]