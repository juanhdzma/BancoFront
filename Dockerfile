# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy your static website files into the Nginx web root directory
COPY src/ /usr/share/nginx/html/

# Copy the custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to allow traffic to the Nginx server
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
