FROM node:16.18.1 as base

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build dist
RUN npm run build

# Start production image build
#FROM gcr.io/distroless/nodejs:16
FROM node:16

# Copy node modules and build directory
COPY --from=base ./node_modules ./node_modules
COPY --from=base /dist /dist

# Copy static files
#COPY src/ dist/src/public

# Expose port 3000
EXPOSE 3000
CMD ["node", "dist/src/app.js"]