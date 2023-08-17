# First image to compile typescript to javascript
FROM node:16.20.2-alpine AS build-image
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
RUN npm test

# Second image, that creates an image for production
FROM node:16.20.2-alpine AS prod-image
WORKDIR /app
COPY --from=build-image ./app/dist ./dist
COPY package* ./
COPY migrations ./migrations
RUN npm ci --production
CMD [ "npm", "run", "start:prd" ]