FROM node:latest

WORKDIR /src

RUN npm update

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
