#!/usr/bin/env node

import { deploy } from '@/commands/deploy.js';
import Logger from '@/utils/logger.js';
import { Command } from 'commander';

interface CommandOptions {
    [key: string]: unknown;
}

const program = new Command();

// Add more detailed description and examples
program
    .name('cursor-rules-deploy')
    .description(
        `🚀 CLI tool for deploying Cursor AI rules and templates

  This tool helps you set up the necessary directory structure and configuration files 
  for using Cursor AI with your projects.
  
  ✨ Features:
  • Creates directory structure
  • Deploys rule templates
  • Configures git and cursor settings
  • Generates documentation`
    )
    .version('1.1.0')
    .argument('<target-dir>', 'Target directory to deploy rules and templates')
    .usage('<target-dir>')
    .on('--help', () => {
        console.log('');
        Logger.info('Examples:');
        Logger.info("$ cursor-rules-deploy my-project    → Create in 'my-project' directory");
        Logger.info('$ cursor-rules-deploy .             → Create in current directory');
    })
    .action(async (targetDir: string, options: CommandOptions, command: Command) => {
        // Check for extra arguments
        if (command.args.length > 1) {
            Logger.error('Too many arguments provided');
            Logger.info('');
            Logger.info('✨ Correct usage:');
            Logger.info('$ cursor-rules-deploy <target-dir>');
            Logger.info('');
            Logger.info('💡 Examples:');
            Logger.info('$ cursor-rules-deploy my-project');
            Logger.info('$ cursor-rules-deploy .');
            process.exit(1);
        }

        try {
            await deploy(targetDir);
        } catch (error) {
            Logger.error(`Deployment failed: ${(error as Error).message}`);
            process.exit(1);
        }
    });

// Custom error handling for missing arguments
if (process.argv.length < 3) {
    console.log('\n❌ Error: Missing required argument\n');
    Logger.info('📌 Required:');
    Logger.info('target-dir - Where to deploy rules and templates\n');
    Logger.info('✨ Correct usage:');
    Logger.info('$ cursor-rules-deploy my-project\n');
    Logger.info('💡 Quick help:');
    Logger.info('• Use a dot (.) for current directory');
    Logger.info('• Run with --help for more information');
    Logger.info("• Directory will be created if it doesn't exist\n");
    process.exit(1);
}

program.parse();
