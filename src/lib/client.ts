import { Socket } from 'net';
import { v4 as uuidv4 } from 'uuid';

export type ClientEvent = 'message';
export type ClientEventHandler = (data: string) => void;

export default class Client {
	private socket: Socket;

	public id: string;
	public ready: boolean;

	private eventHandlers: {
		message: Array<ClientEventHandler>,
	};

	constructor(socket: Socket) {
		this.socket = socket;
		this.id = uuidv4();
		this.ready = false;

		this.eventHandlers = {
			message: [],
		};

		this.socket.on('data', this.listener.bind(this));
	}

	private listener(data: Buffer) {
		const message = data.toString('utf-8').trim();

		this.eventHandlers.message.forEach(fn => fn(message));
	}

	public get(): Socket {
		return this.socket;
	}

	public on(event: ClientEvent, handler: ClientEventHandler): void {
		this.eventHandlers[event].push(handler);
	}
}