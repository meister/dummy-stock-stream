/* eslint-disable new-cap */
import StocksGenerator from './stocks-generator';

describe('StocksGenerator', () => {
	let stock: StocksGenerator;

	beforeEach(() => {
		stock = new StocksGenerator('AAPL', {
			ask: 125.22,
			bid: 126.00,
		});
	});

	test('creates initial data correctly', () => {
		expect(stock.symbol).toBe('AAPL');
		expect(stock.price.ask).toBe(125.22);
		expect(stock.price.bid).toBe(126);
		expect(stock.getMedianPrice()).toEqual(125.61);
	});

	test('generates random move', () => {
		const move = stock.generate();

		expect(move.action).toMatch(/^(BUY|SELL)$/);

		const median = stock.getMedianPrice();
		const maxPrice = 126 + median * 0.007;
		const minPrice = 125.22 - median * 0.007;

		if (move.action === 'BUY') {
			expect(move.price).toBeGreaterThanOrEqual(median);
			expect(move.price).toBeLessThanOrEqual(maxPrice);
		} else {
			expect(move.price).toBeLessThanOrEqual(median);
			expect(move.price).toBeGreaterThanOrEqual(minPrice);
		}
	});

	test('moves BUY correctly', () => {
		const maxSpread = 0.87927; // 125.61 * 0.007

		stock.setTrend('BUY', 100);
		stock.BUY(0.02);

		expect(stock.price.bid).toBe(126.02);
		expect(stock.price.ask).toBe(125.22);
		expect(stock.getMedianPrice()).toBe(125.62);

		stock.BUY(0.20);

		expect(stock.price.bid).toBe(126.22);
		expect(stock.price.ask).toBe(126.22 - maxSpread); // due to max spread

		const newAsk = 126.22 - maxSpread;
		const newMedian = (126.22 + newAsk) / 2;

		expect(stock.getMedianPrice()).toBe(newMedian);

		stock.setTrend('SELL', 100);
		stock.BUY(0.25);

		expect(stock.price.ask).toBe(newAsk); // unchanged due to trend reversal
		expect(stock.price.bid).toBe(newMedian + 0.25); // from median due to trend reversal
	});

	test('moves SELL correctly', () => {
		// const maxSpread = 0.87927; // 125.61 * 0.007

		stock.setTrend('SELL', 100);
		stock.SELL(0.22);

		expect(stock.price.ask).toBe(125);
		expect(stock.price.bid).toBe(125.87927);

		const newMedian = (125 + 125.87927) / 2;

		stock.setTrend('BUY', 100);
		stock.SELL(0.25);

		expect(stock.price.ask).toBe(newMedian - 0.25);
		expect(stock.price.bid).toBe(125.87927);
	});
});