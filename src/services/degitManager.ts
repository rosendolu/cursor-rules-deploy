import Logger from '@/utils/logger.js';
import degit from 'degit';
import fs from 'fs-extra';
import { globby } from 'globby';
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { rm } from 'node:fs/promises';
import os from 'os';
import path from 'path';
import { GitHubService } from './GitHubService.js';

// Register the autocomplete prompt
inquirer.registerPrompt('autocomplete', inquirerPrompt);

interface RepoChoice {
    name: string;
    value: string;
    description: string;
}

class DegitManager {
    static async cleanupTempDir(tempDir: string): Promise<void> {
        try {
            if (await fs.pathExists(tempDir)) {
                // First try to make everything writable
                const walk = async (dir: string): Promise<void> => {
                    try {
                        const entries = await fs.readdir(dir, { withFileTypes: true });
                        await Promise.all(
                            entries.map(async entry => {
                                const fullPath = path.join(dir, entry.name);
                                try {
                                    await fs.chmod(fullPath, 0o777);
                                    if (entry.isDirectory()) {
                                        await walk(fullPath);
                                    }
                                } catch (error) {
                                    Logger.debug(`Unable to chmod ${fullPath}: ${(error as Error).message}`);
                                }
                            })
                        );
                    } catch (error) {
                        Logger.debug(`Unable to read directory ${dir}: ${(error as Error).message}`);
                    }
                };

                await walk(tempDir);
                await fs.chmod(tempDir, 0o777);

                // Try multiple removal methods
                const removeMethods = [
                    () => fs.remove(tempDir),
                    () => fs.rm(tempDir, { force: true, recursive: true }),
                    () => rm(tempDir, { force: true, recursive: true }),
                ];

                for (const method of removeMethods) {
                    try {
                        await method();
                        break;
                    } catch (error) {
                        Logger.debug(`Removal method failed: ${(error as Error).message}`);
                    }
                }

                Logger.info('🧹 Cleaned up temporary directory');
            }
        } catch (error) {
            Logger.debug(`Final cleanup attempt failed: ${(error as Error).message}`);
            // Final attempt with native rm
            try {
                await rm(tempDir, { force: true, recursive: true });
            } catch (error) {
                Logger.debug(`Final rm attempt failed: ${(error as Error).message}`);
            }
        }
    }

    private static formatPath(filePath: string): string {
        // 移除开头的 ./ 或 /
        return filePath.replace(/^\.\/|^\//, '');
    }

    private static groupFilesByDirectory(files: string[]): Map<string, string[]> {
        const groups = new Map<string, string[]>();

        for (const file of files) {
            const formattedPath = this.formatPath(file);
            const dir = path.dirname(formattedPath);
            if (!groups.has(dir)) {
                groups.set(dir, []);
            }
            groups.get(dir)?.push(formattedPath);
        }

        return groups;
    }

    private static logGroupedFiles(groups: Map<string, string[]>, status: 'copied' | 'skipped'): void {
        const sortedDirs = Array.from(groups.keys()).sort();
        const icon = status === 'copied' ? '📦' : '⚠️';
        const action = status === 'copied' ? 'Copied' : 'Skipped existing';

        for (const dir of sortedDirs) {
            if (dir === '.') {
                // 根目录文件
                groups.get(dir)?.forEach(file => {
                    Logger.info(`${icon} ${action}: ${file}`);
                });
            } else {
                // 输出目录名
                Logger.info(`\n${dir}/`);
                // 输出该目录下的文件
                groups.get(dir)?.forEach(file => {
                    Logger.info(`  ${icon} ${action}: ${path.basename(file)}`);
                });
            }
        }
    }

    private static async copyWithCheck(src: string, dest: string): Promise<{ copied: boolean }> {
        try {
            // check if the file exists
            const exists = await fs.pathExists(dest);
            if (exists) {
                Logger.debug(`Skipped existing: ${dest}`);
                return { copied: false };
            }

            // ensure the destination directory exists
            await fs.ensureDir(path.dirname(dest));

            // copy the file
            await fs.copy(src, dest, {
                overwrite: false,
                errorOnExist: false,
            });

            return { copied: true };
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'EACCES') {
                throw new Error(`Permission denied: Unable to write to ${dest}`);
            }
            throw error;
        }
    }

    static async selectSourceRepo(): Promise<string> {
        const defaultRepo = 'bmadcode/cursor-custom-agents-rules-generator';
        const [owner, repo] = defaultRepo.split('/');

        try {
            const githubService = GitHubService.getInstance();
            const spinner = Logger.progress('Fetching available repositories');

            spinner.start();
            const [defaultRepoInfo, forks] = await Promise.all([githubService.getRepoInfo(owner, repo), githubService.listForks(owner, repo)]);
            spinner.stop();

            // Add the original repository to the list
            const allRepos: RepoChoice[] = [
                {
                    name: `${defaultRepo} (Original) (⭐ ${defaultRepoInfo.stargazers_count})`,
                    value: defaultRepo,
                    description: defaultRepoInfo.description,
                },
                ...forks.map(fork => ({
                    name: `${fork.full_name} (⭐ ${fork.stargazers_count})`,
                    value: fork.full_name,
                    description: fork.description,
                })),
            ];

            const { selectedRepo } = await inquirer.prompt([
                {
                    type: 'autocomplete',
                    name: 'selectedRepo',
                    message: 'Select a repository to clone from:',
                    source: async (answersSoFar: any, input: string = '') => {
                        if (!input) return allRepos;

                        const searchResults = await githubService.searchForks(owner, repo, input);
                        return [
                            allRepos[0],
                            ...searchResults.map(fork => ({
                                name: `${fork.full_name} (⭐ ${fork.stargazers_count})`,
                                value: fork.full_name,
                                description: fork.description,
                            })),
                        ];
                    },
                },
            ]);

            return selectedRepo;
        } catch (error) {
            Logger.warn('Failed to fetch repositories, using default repository');
            Logger.debug(`Error details: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return defaultRepo;
        }
    }

    static async copyTemplate(targetDir: string): Promise<void> {
        const sourceRepo = await this.selectSourceRepo();
        const spinner = Logger.progress('Copying template from repository\n');

        // Create a temporary directory
        const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cursor-rules-'));

        try {
            spinner.start();

            // Clone to temp directory
            const emitter = degit(sourceRepo, {
                cache: false,
                force: true,
                verbose: true,
            });
            await emitter.clone(tempDir);

            // Define base directories and files to process
            const baseItems = ['.cursor/**/*', 'docs/**/*', 'xnotes/**/*', '.cursorignore', '.cursorindexingignore'];

            // Find all files matching the patterns
            const files = await globby(baseItems, {
                cwd: tempDir,
                dot: true,
                onlyFiles: true,
            });

            const copiedFiles: string[] = [];
            const skippedFiles: string[] = [];

            // Process each matched file
            for (const file of files) {
                const src = path.join(tempDir, file);
                const dest = path.join(targetDir, file);

                const { copied } = await this.copyWithCheck(src, dest);
                if (copied) {
                    copiedFiles.push(file);
                } else {
                    skippedFiles.push(file);
                }
            }

            // Group and log files by directory
            if (copiedFiles.length > 0) {
                Logger.info('\n📦 Copied files:');
                this.logGroupedFiles(this.groupFilesByDirectory(copiedFiles), 'copied');
            }

            if (skippedFiles.length > 0) {
                Logger.info('\n⚠️ Skipped files:');
                this.logGroupedFiles(this.groupFilesByDirectory(skippedFiles), 'skipped');
                console.warn('\nSome files were skipped because they already exist.');
                console.warn('To update these files, please back them up and remove them first.');
            }

            if (copiedFiles.length > 0) {
                spinner.succeed('Template files copied successfully');
            } else {
                spinner.warn('No new files were copied - all files already exist');
            }
        } catch (error) {
            spinner.fail('Failed to copy template files');
            Logger.error(`Template deployment failed: ${(error as Error).message}`);
            throw error;
        } finally {
            await DegitManager.cleanupTempDir(tempDir);
        }
    }
}

export default DegitManager;
