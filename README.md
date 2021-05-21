# Dummy Stock Stream Server

This is a dummy data generator emulating a very simple Stock price updates stream. It can be used to build test tasks or just play around with TCP sockets.

Status:
![Build Status](https://github.com/meister/dummy-stock-stream/actions/workflows/node.js.yml/badge.svg)

## Install

### With Docker

```
docker pull meister/dummy-stock-stream
docker run --rm -it -p 8777:8777 meister/dummy-stock-stream
```

### From NPM Package

```
npx -p @meister/dummy-stock-stream stream-server
```


## Protocol

### Commands

To issue commands on the TCP socket, send message use following strings:

Command | Description
---     | ---
`READY` | Ready to receive updates. This will start the data flow
`STOP`  | Stop receiving updates. This will stop the server from sending additional updates

### Responses

Message | Description
---     | ---
`HELLO:${clientId}` | Returns on successful connection
`ECHO:${message}`   | Returns the received command
`TICK:${action}:${price}:${timestamp}` | Stock ticker, receives `action`, `price` and `timestamp` variables
`BYE:${reason}`     | Connection closed. Optional `reason` message.

## Contributions

Currently this repo serves a very specific purpose, and thus contributions are not open to public. Should you find this (somehow) and find it useful, feel free to contact me in Github.

## License

[MIT](../blob/master/LICENSE)
