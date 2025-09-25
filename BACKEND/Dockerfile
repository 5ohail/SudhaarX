FROM node:20-alpine

WORKDIR /BACKEND

COPY ./package.json package.json
COPY ./package-lock.json package-lock.json

RUN npm install

COPY . .

EXPOSE 3000

ENTRYPOINT [ "npm","run" ]