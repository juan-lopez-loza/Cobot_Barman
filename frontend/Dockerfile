FROM node:22-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5173
EXPOSE 5173


CMD [ "npm", "run", "dev", "--", "--port", "5173", "--host"]