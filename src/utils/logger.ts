import debugLib from 'debug';

type LogFn = debugLib.Debugger;

const cBright = '\x1b[1m';
const cReset = '\x1b[0m';
const cFgBlack = '\x1b[30m';
const cFgRed = '\x1b[31m';
const cFgCyan = '\x1b[36m';

class Logger {
	public debugLib: debugLib.Debugger;

	constructor(logInstance?: Logger, namespace?: string) {
		if (logInstance) {
			this.debugLib = logInstance.debugLib.extend(`${namespace}`);
		} else {
			this.debugLib = debugLib('stock-ticker');
		}
	}

	public create(namespace?: string): Logger {
		return new Logger(this, namespace);
	}

	public log(...args: Parameters<LogFn>): ReturnType<LogFn> {
		switch (args[0].toLowerCase()) {
			case 'error':
				args[0] = `${cFgRed}error${cReset}`;
				break;
			case 'debug':
				args[0] = `${cFgBlack + cBright}debug${cReset}`;
				break;
			default:
				args.unshift(`${cFgCyan}info${cReset}`);
		}

		this.debugLib(...args);
	}

	public important(...args: Parameters<LogFn>): ReturnType<LogFn> {
		this.debugLib.enabled = true;
		this.log(...args);
		this.debugLib.enabled = false;
	}
}

const logger = new Logger();
const createLogger = (namespace?: string): Logger => logger.create(namespace);

export {
	createLogger,
};
