import net from 'net';
import { createLogger } from './utils/logger';
import CliControl from './utils/cli-control';

const logger = createLogger('stream-client');
const client = new net.Socket();

client.connect(8777, '127.0.0.1', () => {
	console.log('Connected');
});

let paused = true;

const controller = new CliControl({
	// onBegin: async (): Promise<void> => queueProduceMessage(),
	onPause: async (): Promise<void> => {
		if (!paused) {
			paused = true;
			client.write('STOP\n');
		}
	},
	onUnpause: async (): Promise<void> => {
		if (paused) {
			paused = false;
			client.write('READY\n');
		}
	},
	onKey(key: string): void {
		logger.log('KEY: ', key);
	},
});

let messagesCount = 0;

client.on('data', (buffer) => {
	const data = buffer.toString();
	logger.log('RCV:', data);
	const [event] = data.split(':');

	messagesCount++;

	if (event === 'HELLO') {
		controller.start('Ready to receive messages.');
	}
});

client.on('end', () => {
	logger.log('Connection closed');
	logger.log('Stats: Received', messagesCount, 'messages');
});

['SIGHUP', 'SIGTERM', 'SIGINT', 'SIGUSR1', 'SIGUSR2'].forEach((type: string): void => {
	const signalType = type as unknown as NodeJS.Signals;

	process.once(signalType, async (): Promise<void> => {
		logger.log('Closing connection');
		controller.stop();
		client.end();
		logger.log('Connections closed');
		process.exit(0);
	});
});
