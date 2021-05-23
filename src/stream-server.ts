import net from 'net';
import { createLogger } from './utils/logger';
import ClientList from './lib/client-list';

const PORT = process.env.PORT || 8777;

const logger = createLogger('stream-server');

const clientList = new ClientList();

const server = net.createServer((socket) => {
	const client = clientList.add(socket);

	logger.important('Client connected', client.id);

	client.send(`HELLO: ${client.id}`);

	client.on('message', (message) => {
		logger.log('RCV', client.id, message);

		if (message === 'BYE') {
			logger.important('Client said BYE', client.id);
		} else {
			client.send(`ECHO: ${message}`);
		}
	});
});

server.on('error', (err) => {
	// Handle errors here.
	throw err;
});

// Grab an arbitrary unused port.
server.listen(PORT, () => {
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