# Teamspeak 3 Viewer

[![Build Status](https://travis-ci.org/TheNoim/ts3viewer.svg?branch=master)](https://travis-ci.org/TheNoim/ts3viewer)

### Docker
[Docker Repository](https://hub.docker.com/r/3003/tsviewer/)

### Requirements
- NodeJS
- yarn or npm (If npm, replace all yarn commands below with npm)
- MongoDB

### Build
```bash
yarn install
yarn build
```

### Start
```bash
yarn start // you first need to build with yarn build
```

### Development
1. `yarn watch` Watches for file changes and updates the public directory
2. `yarn start` Starts the fastify server

### Supported settings
You need to use env variables.

##### List of env variables:
| Variable         | Description                    | Default                         | Example                          |
|------------------|--------------------------------|---------------------------------|----------------------------------|
|TSVSERVERIP       | Teamspeak server ip/host       | `127.0.0.1`                     | `myserver.com`                   |
|TSVSERVERPORT     | Teamspeak server query port    | `10011`                         | `10011`                          |
|TSVSERVERUSERNAME | Teamspeak query admin username | `serveradmin`                   | `serveradmin`                    |
|TSVSERVERPASSWORD | Teamspeak query admin password |                                 | `mypassword`                     |
|TSVSERVER         | Teamspeak virtual server id    | `1`                             | `1`                              |
|TSVMONGO          | MongoDB address                | `mongodb://localhost/teamspeak` | `mongodb://172.17.0.6/teamspeak` |
|TSVCACHE          | Cache time in ms               | `120000`                        | `2000`                           |
|TSVPORT           | Webserver port                 | `5000`                          | `8080`                           |
|TSVHOST           | Webserver host                 | `0.0.0.0`                       | `127.0.0.1`                      |
|TSVDARKMODE       | UI dark mode default           | `true`                          | `false`                          |
|TSVBBCODE         | BBCode enabled (WIP)           | `true`                          | `false`                          |
 