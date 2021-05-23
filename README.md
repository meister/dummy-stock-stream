# Dummy Stock Stream Server

This is a dummy data generator emulating a very simple Stock price updates stream. It can be used to build test tasks or just play around with TCP sockets.

Status:
![Build Status](https://github.com/meister/dummy-stock-stream/actions/workflows/node.js.yml/badge.svg)

## Install

### With Docker

```
docker pull meistr/dummy-stock-stream
docker run --rm -it -p 8777:8777 meistr/dummy-stock-stream
```

### From NPM Package

*Note: WIP* Not ready, yet.
```
npx -p @meister/dummy-stock-stream stream-server
```

### Testing the Setup

Once the server is up, you can check whether it’s working, by running:
```
nc 127.0.0.1 8777
```

This opens the TCP stream to the server and you can use the commands described in the [next section](#protocol)

### Configuration Options

There are a few ENV variables you can modify to your needs

ENV | Default | Description
--- | --- | ---
`PORT` | `8777` | TCP Port that the server listens to
`POLLING_RATE` | `100` | Specifies the amount of messages produced per second
`DEBUG` | _undefined_ | Display additional debug logs by changing default to `*`

For Docker version add env variable parameters to run command (i.e. `-e DEBUG=*`).

## Protocol

### Commands

To issue commands on the TCP socket, send message use following strings:

Command | Description
---     | ---
`READY` | Ready to receive updates. This will start the data flow
`STOP`  | Stop receiving updates. This will stop the server from sending additional updates
`BYE`   | Disconnects from the server

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
