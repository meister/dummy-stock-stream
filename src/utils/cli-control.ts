/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as readline from 'readline';

let paused = true;

type CallbackFnAsync = () => Promise<any>;
type CallbackFnParams = (data: any) => void;

export interface ControlConfig {
	onBegin?: CallbackFnAsync;
	onEnd?: CallbackFnAsync;
	onPause: CallbackFnAsync;
	onUnpause: CallbackFnAsync;
	onKey?: CallbackFnParams;
}

class CliControl {
	private onBegin: CallbackFnAsync;
	private onEnd: CallbackFnAsync;
	private onPause: CallbackFnAsync;
	private onUnpause: CallbackFnAsync;
	private onKey: CallbackFnParams;

	constructor(config: ControlConfig) {
		this.onBegin = config.onPause || (async (): Promise<void> => {});
		this.onEnd = config.onEnd || (async (): Promise<void> => {});
		this.onKey = config.onKey || ((): void => {});
		this.onPause = config.onPause;
		this.onUnpause = config.onUnpause;
	}

	public async togglePause(forceState?: boolean): Promise<void> {
		paused = typeof forceState === 'boolean' ? forceState : !paused;

		if (paused) {
			await this.onPause();
			console.log('-- PAUSED: Press `P` to unpause. --');
		} else {
			console.log('-- UNPAUSED: Press `P` to pause. --');
			await this.onUnpause();
		}
	}

	public async start(message?: string): Promise<void> {
		if (process.stdin.setRawMode) {
			readline.emitKeypressEvents(process.stdin);
			process.stdin.setRawMode(true);
			process.stdin.on('keypress', (s, key): void => {
				if (s === 'p') {
					this.togglePause();
				} else if (key.sequence === '\u0003') {
					process.stdin.setRawMode && process.stdin.setRawMode(false);
					console.log('CTRL+C: Exiting.');
					process.kill(process.pid, 'SIGTERM');
				}
			});

			this.printBanner(message);
			await this.togglePause(true);
			await this.onBegin();
		}
	}

	public async stop(): Promise<void> {
		process.stdin.setRawMode && process.stdin.setRawMode(false);
		await this.onEnd();
	}

	private printBanner(message?: string): void {
		const banner = [
			'-- STARTING: From stalled state. --',
			'        [P]  To toggle pause',
			'   [CTRL+C]  To exit script',
		];

		if (message) {
			banner.unshift(`-- ${message} --`);
		}

		const longest: number = banner.reduce((current: number, row: string): number => {
			return (row.length > current) ? row.length : current;
		}, 0);

		console.log('');
		banner.forEach((row: string): void => {
			console.log(row.substr(0, 1) === '-' ? row.padEnd(longest, '-') : row);
		});
		console.log(''.padEnd(longest, '-'));
		console.log('');
	}
}

export default CliControl;