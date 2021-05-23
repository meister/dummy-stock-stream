export function randomElement<T>(elements: T[]): T {
	return elements[Math.floor(Math.random() * elements.length)];
}

export function randomElementWeighted<T>(elements: Array<[T, number]>): T {
	let result = elements[0][0];

	for (const el of elements) {
		const [value, weight] = el;

		if (randomNumberBetween(0, 100) <= weight) {
			result = value;
			break;
		}
	}

	return result;
}

export function randomNumberBetween(start: number, end: number): number {
	return start + (Math.random() * (end - start));
}