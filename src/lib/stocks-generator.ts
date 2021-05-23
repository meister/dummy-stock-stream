import { randomElement, randomElementWeighted, randomNumberBetween } from '../utils/random';

const Action = {
	BUY: 1,
	SELL: -1,
};

const ActionString: { [key: number]: keyof typeof Action;} = {
	1: 'BUY',
	[-1]: 'SELL',
};

export interface StockPrice {
	ask: number;
	bid: number;
}

export interface MarketAction {
	action: 'BUY' | 'SELL';
	price: number;
}

class StocksGenerator {
	public price: StockPrice;
	public symbol: string;

	private medianMarket!: number;
	private maxSpread: number;
	private trend: MarketAction['action'];
	private trendStrength: number;
	private minPrice: number;

	constructor(symbol: string, startPrice: StockPrice) {
		this.symbol = symbol;
		this.price = startPrice;
		this.calculateMedianPrice();
		this.trend = randomElement(['BUY', 'SELL']);
		this.trendStrength = 100;
		this.maxSpread = 0.007 * this.medianMarket;
		this.minPrice = 0.1 * this.medianMarket;
	}

	public generate(): MarketAction {
		let trend = Action[this.trend];

		// Chance for trend reversal
		if (randomNumberBetween(0, 100) > this.trendStrength) {
			trend *= -1;
			this.setTrend(ActionString[trend], Math.min(100, this.trendStrength + 20));
		}

		// Get current action (weighted for trend)
		const action = ActionString[randomElementWeighted<keyof typeof ActionString>([
			[trend, this.trendStrength],
			[trend * -1, (100 - this.trendStrength)],
		])];

		const move = randomNumberBetween(0, this.maxSpread);
		const price = this[action](move);

		this.trendStrength = Math.max(this.trendStrength - 2, 30);

		return {
			action,
			price,
		};
	}

	public BUY(move: number): number {
		if (this.trend === 'BUY') {
			this.price.bid = this.price.bid + move;
		} else {
			this.price.bid = this.medianMarket + move;
		}

		this.correctPrice('ask', this.price.bid - this.maxSpread);
		this.calculateMedianPrice();

		return this.price.bid;
	}

	public SELL(move: number): number {
		if (this.trend === 'SELL') {
			this.price.ask = this.price.ask - move;
		} else {
			this.price.ask = this.medianMarket - move;
		}

		if (this.price.ask < this.minPrice) {
			this.price.ask = this.minPrice;
		}

		this.correctPrice('bid', this.price.ask + this.maxSpread);
		this.calculateMedianPrice();

		return this.price.ask;
	}

	private correctPrice(type: 'bid' | 'ask', value: number): void {
		if (this.price.bid - this.price.ask > this.maxSpread) {
			this.price[type] = value;
		}
	}

	private calculateMedianPrice(): void {
		this.medianMarket = (this.price.bid + this.price.ask) / 2;
	}

	public getMedianPrice(): number {
		this.calculateMedianPrice();

		return this.medianMarket;
	}

	public setTrend(trend: MarketAction['action'], trendStrength: number): void {
		this.trend = trend;
		this.trendStrength = trendStrength;
	}
}

export default StocksGenerator;