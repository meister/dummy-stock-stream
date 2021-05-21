import { randomElement, randomNumberBetween } from '../utils/random';

export interface StockPrice {
	ask: number;
	bid: number;
}

export interface MarketAction {
	action: 'SELL' | 'BUY';
	price: number;
}

class StocksGenerator {
	public price: StockPrice;
	public symbol: string;

	private medianMarket!: number;
	private maxSpread: number;

	constructor(symbol: string, startPrice: StockPrice) {
		this.symbol = symbol;
		this.price = startPrice;
		this.maxSpread = 0.005;
		this.calculateMedianPrice();
	}

	public generate(): MarketAction {
		const availableActions: Array<MarketAction['action']> = [];

		if (this.price.bid < this.medianMarket * (1 + this.maxSpread)) {
			availableActions.push('BUY');
		}

		if (this.price.ask > this.medianMarket * (1 - this.maxSpread)) {
			availableActions.push('SELL');
		}

		const action = randomElement(availableActions);
		const price = this[action](randomNumberBetween(0, this.maxSpread));

		return {
			action,
			price,
		};
	}

	private BUY(move: number): number {
		this.price.bid = this.medianMarket + move * this.medianMarket;
		this.calculateMedianPrice();

		return this.price.bid;
	}

	private SELL(move: number): number {
		this.price.ask = this.medianMarket - move * this.medianMarket;
		this.calculateMedianPrice();

		return this.price.ask;
	}

	private calculateMedianPrice(): void {
		this.medianMarket = (this.price.bid + this.price.ask) / 2;
	}

	public getMedianPrice(): number {
		this.calculateMedianPrice();

		return this.medianMarket;
	}
}

export default StocksGenerator;