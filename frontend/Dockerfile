FROM node:18.17.1-alpine3.18

WORKDIR /app 

COPY package*.json ./

RUN npm i 

COPY . .

EXPOSE 5173 

CMD ["npm", "run", "dev"]