FROM node
COPY package.json /root/back/
WORKDIR /root/back/
RUN npm install
COPY . /root/back/
COPY .env .
EXPOSE 80