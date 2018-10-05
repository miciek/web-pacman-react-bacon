FROM node:8.12.0
COPY . .
RUN npm install
RUN npm install -g serve
CMD serve -s build
EXPOSE 5000
