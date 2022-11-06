FROM node
COPY package.json /root/scripts/
WORKDIR /root/scripts/
RUN npm install
COPY . /root/scripts/
COPY .env .
ENTRYPOINT node /root/scripts/client.js