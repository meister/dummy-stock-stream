import EventEmitter from 'events';
import { Socket } from 'net';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../utils/logger';
import DataProducer from './data-producer';

export type ClientEvent = 'message';
export type ClientEventHandler = (data: string) => void;

interface StreamError extends Error {
	code: string;
}

const logger = createLogger('lib:client');

export default class Client extends EventEmitter {
	private socket: Socket;

	public id: string;
	public ready: boolean;
	public connected: boolean;
	public dataProducer: DataProducer;

	constructor(socket: Socket, dataProducer: DataProducer) {
		super();

		this.socket = socket;
		this.dataProducer = dataProducer;
		this.id = uuidv4();
		this.ready = false;
		this.connected = true;

		const listener = this.listener.bind(this);

		this.socket.on('data', listener);

		this.socket.on('end', () => {
			this.socket.off('data', listener);
			this.connected = false;
			this.ready = false;
			this.dataProducer.unpipe(this.socket);
			logger.important('Client disconnected', this.id);
			this.emit('end');
		});

		this.socket.on('error', (err: StreamError) => {
			// If someone figures out why this happens when client sends `BYE`
			// I’d be happy to hear :D
			if (err.code === 'ERR_STREAM_WRITE_AFTER_END') {
				return;
			}

			if (err.code === 'ECONNRESET') {
				logger.important('ERROR', 'Client disconnected');
				return;
			}

			logger.important('ERROR', 'Socket error', err);
			logger.important('Closing connection for client', this.id);

			this.emit('error', {
				clientId: this.id,
				error: `Client error. ${err.message}`,
			});
		});

		this.socket.pipe(this.socket);
	}

	private listener(data: Buffer) {
		const message = data.toString('utf-8').trim();

		switch (message) {
			case 'READY':
				this.ready = true;
				this.dataProducer.pipe(this.socket);
				break;
			case 'STOP':
				this.ready = false;
				this.dataProducer.unpipe(this.socket);
				break;
			case 'BYE':
				this.ready = false;
				this.dataProducer.unpipe(this.socket);
				this.close();
		}

		if (['READY', 'STOP', 'BYE'].includes(message)) {
			this.emit(message.toLowerCase());
		}

		this.emit('message', message);
	}

	public get(): Socket {
		return this.socket;
	}

	public send(message: string): void {
		if (this.connected) {
			this.socket.write(`${message}\n\r`);
		} else {
			logger.log('Tried sending message when not connected', this.id);
		}
	}

	public close(reason?: string): void {
		if (reason) {
			this.send(`BYE:${reason}`);
		}

		this.socket.unpipe(this.socket);
		this.socket.end();
	}
}