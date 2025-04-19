import chalk from 'chalk';
import ora, { Ora } from 'ora';

class Logger {
    static info(message: string): void {
        console.info(chalk.blue('ℹ'), message);
    }

    static error(message: string): void {
        console.error(chalk.red('✖'), message);
    }

    static warn(message: string): void {
        console.warn(chalk.yellow('⚠'), message);
    }

    static success(message: string): void {
        console.info(chalk.green('✔'), message);
    }

    static complete(message: string): void {
        console.info(chalk.magenta('🎉'), message);
    }

    static debug(message: string): void {
        console.debug(chalk.gray('🔍'), message);
    }

    static progress(message: string): Ora {
        return ora({
            spinner: 'dots',
            text: message,
            color: 'blue',
        });
    }
}

export default Logger;
