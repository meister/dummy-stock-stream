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
		const maxPrice = median + median * 0.005;
		const minPrice = median - median * 0.005;

		if (move.action === 'BUY') {
			expect(move.price).toBeGreaterThanOrEqual(median);
			expect(move.price).toBeLessThanOrEqual(maxPrice);
		} else {
			expect(move.price).toBeLessThanOrEqual(median);
			expect(move.price).toBeGreaterThanOrEqual(minPrice);
		}
	});
});