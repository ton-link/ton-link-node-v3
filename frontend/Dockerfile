FROM node
COPY package.json /root/scripts/web/
WORKDIR /root/scripts/web/
RUN npm install
COPY . /root/scripts/web/
COPY .env .
EXPOSE 3000