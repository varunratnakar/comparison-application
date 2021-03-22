FROM node:latest

WORKDIR /src

COPY package.json .
COPY package-lock.json .

RUN npm update
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
