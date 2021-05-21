import { Socket } from 'net';
import { createLogger } from '../utils/logger';
import Client from './client';
import { dataProducer } from './data-producer';

const logger = createLogger('lib:client-list');

export default class ClientList {
	public clients: Client[];

	constructor() {
		this.clients = [];
	}

	public add(socket: Socket): Client {
		const client = new Client(socket);

		this.clients.push(client);

		console.log('clients', this.clients.length);

		client.on('message', (command => {
			logger.log('Received command:', command);

			if (command === 'READY') {
				logger.log('Connecting client', client.id, 'to dataProducer');

				client.ready = true;
				dataProducer.pipe(client.get());
			} else if (command === 'STOP') {
				logger.log('Disconnecting client', client.id, 'from dataProducer');

				client.ready = false;
				dataProducer.unpipe(client.get());
			}

			this.setDataProducerState();
		}));

		return client;
	}

	public remove(clientId: string, reason?: string): void {
		const index = this.clients.findIndex((client) => client.id === clientId);

		if (index < 0) {
			logger.important(`clientId not found: ${clientId}`);

			return;
		}

		const socket = this.clients[index].get();

		dataProducer.unpipe(socket);

		if (reason) {
			socket.write(`BYE:${reason}`);
		}

		socket.end();

		this.clients.splice(index, 1);

		if (this.clients.length === 0) {
			logger.important('No more clients, stopping dataProducer');
			dataProducer.stop();
		}
	}

	public purge(): void {
		this.clients.forEach(c => this.remove(c.id, 'Server shutting down!'));
	}

	private setDataProducerState(): void {
		const receivingClients = this.clients.reduce((num, c) => c.ready ? num + 1 : num, 0);

		logger.log('receivingClients', receivingClients);

		if (receivingClients > 0) {
			dataProducer.start();
		} else {
			dataProducer.stop();
		}
	}
}