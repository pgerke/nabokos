# Stage 1, based on Node.js, to build and compile Angular
FROM node:13.5 as build

# Copy the package.json and package-lock.json from the project
COPY package.json package-lock.json ./
# Restore dependencies in another layer, to prevent unneccessary npm installs at every build.
RUN npm ci && mkdir /app && mv ./node_modules ./app

# Set the working directory
WORKDIR /app
# and copy the project
COPY . .

# Build the angular app in production mode and store the artifacts in dist folder
RUN npm run ng build -- --prod --output-path=dist

# Stage 2, based on nginx, to have only the production-ready, compiled app
FROM nginx:1.17
## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the Nginx config files
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy the artifacts from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Set the user
RUN chown -R 33 /usr/share/nginx/html
RUN chown -R 33 /etc/nginx/conf.d/default.conf && chmod 644 /etc/nginx/conf.d/default.conf
RUN chown -R 33 /var/cache/nginx && chmod -R 777 /var/cache/nginx
RUN touch /var/run/nginx.pid && chown 33 /var/run/nginx.pid && chmod 777 /var/run/nginx.pid
USER 33
# Expose a port larger than 1024, so we can run without root access
EXPOSE 8090