import { randomElement, randomNumberBetween } from './random';

test('picks random element from array', () => {
	expect(randomElement(['a', 'b', 'c'])).toMatch(/^[abc]$/);
});

test('picks random number between two numbers', () => {
	const tests = [
		[0, 10],
		[1, 2],
		[500, 600],
		[1000, 1000.01],
	];

	for (const test of tests) {
		const [ min, max ] = test;
		const number = randomNumberBetween(min, max);
		expect(number).toBeGreaterThan(min);
		expect(number).toBeLessThan(max);
	}
});