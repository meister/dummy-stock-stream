import { Readable } from 'stream';
import StocksGenerator from './stocks-generator';
import { createLogger } from '../utils/logger';

const logger = createLogger('lib:data-producer');

let POLLING_RATE = Number(process.env.POLLING_RATE || 20);

const stock = new StocksGenerator('AAPL', {
	ask: 125.22,
	bid: 126.00,
});

class DataProducer extends Readable {
	private pollTimeout: number;
	private timer: NodeJS.Timeout | null;

	constructor() {
		super({
			objectMode: true,
			read() {},
		});

		this.pollTimeout = 1000 / POLLING_RATE;
		this.timer = null;
	}

	public start(): void {
		if (!this.timer) {
			this.setTimer(this.pollTimeout);
		}
	}

	public stop(): void {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	public setPollingRate(rate = 10): void {
		POLLING_RATE = rate;
	}

	private setTimer(timeout: number): void {
		this.timer = setInterval(() => {
			const data = stock.generate();

			logger.log('debug', 'tick', stock.symbol, data);
			this.push(`${stock.symbol}:${data.action}:${data.price}:${Date.now()}\n`);
		}, timeout);
	}
}

export const dataProducer = new DataProducer();

export default DataProducer;