import net from 'net';
import { createLogger } from './utils/logger';
import ClientList from './lib/client-list';

const logger = createLogger('stream-server');

const clientList = new ClientList();

const server = net.createServer((socket) => {
	const client = clientList.add(socket);

	logger.important('Client connected', client.id);

	socket.on('end', () => {
		clientList.remove(client.id);
		logger.important('Client disconnected', client.id);
	});

	socket.write(`HELLO: ${client.id}\r\n`);

	socket.on('error', (err) => {
		logger.important('ERROR', 'Socket error', err);
		logger.important('Closing connection for client', client.id);

		socket.write(`BYE:Client error. ${err.message}`);

		socket.end();

		clientList.remove(client.id);
	});

	client.on('message', (data) => {
		logger.log('RCV', client.id, data);

		socket.write(`ECHO: ${data}`);
	});

	socket.pipe(socket);
});

server.on('error', (err) => {
	// Handle errors here.
	throw err;
});

// Grab an arbitrary unused port.
server.listen(8777, () => {
	console.log('Opened server on', server.address());
});

['SIGHUP', 'SIGTERM', 'SIGINT', 'SIGUSR1', 'SIGUSR2'].forEach((type: string): void => {
	const signalType = type as unknown as NodeJS.Signals;

	process.once(signalType, (): void => {
		logger.log('Closing connections');

		clientList.purge();

		server.close((err) => {
			if (err) {
				logger.important('error', err);
			}

			logger.important('Connections closed');
			process.exit(0);
		});
	});
});