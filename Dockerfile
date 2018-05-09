FROM node:7.8.0
COPY . .
RUN npm install
CMD npm start
EXPOSE 3000
