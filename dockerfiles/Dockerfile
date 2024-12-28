FROM node:20-alpine

WORKDIR /app

COPY --chown=node:node . .

RUN npm install

CMD ["npm", "run", "start"]
