export function randomElement<T>(elements: T[]): T {
	return elements[Math.floor(Math.random() * elements.length)];
}

export function randomNumberBetween(start: number, end: number): number {
	return start + (Math.random() * (end - start));
}