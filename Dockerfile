FROM node:carbon

WORKDIR /opt/tsviewer

COPY package*.json ./
COPY yarn.lock ./

RUN apt-get update
RUN apt-get install sudo apt-transport-https -y
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN sudo apt-get update && sudo apt-get install yarn -y
RUN yarn
COPY . .
RUN yarn build

EXPOSE 5000

CMD ["yarn", "start"]