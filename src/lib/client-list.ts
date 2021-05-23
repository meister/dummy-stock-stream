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
		const client = new Client(socket, dataProducer);

		this.clients.push(client);

		logger.important('Connected clients:', this.clients.length);

		client.on('message', () => {
			this.setDataProducerState();
		});

		client.on('end', () => {
			this.remove(client.id);
			this.setDataProducerState();
		});

		return client;
	}

	public remove(clientId: string): void {
		const index = this.clients.findIndex((client) => client.id === clientId);

		if (index < 0) {
			logger.important(`clientId not found: ${clientId}`);

			return;
		}

		logger.log('debug', 'Removing client at index', index);
		this.clients.splice(index, 1);

		if (this.clients.length === 0) {
			logger.important('No more clients, stopping dataProducer');
			dataProducer.stop();
		}
	}

	public purge(): void {
		this.clients.forEach(c => c.close('Server shutting down!'));
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