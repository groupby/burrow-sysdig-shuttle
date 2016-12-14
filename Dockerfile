FROM node:7

MAINTAINER GroupByInc

RUN mkdir /app

WORKDIR /app

COPY . /app

RUN npm install --production --silent

EXPOSE 8080

CMD ["node", "index.js"]
