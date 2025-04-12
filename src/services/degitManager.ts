import Logger from '@/utils/logger.js';
import degit from 'degit';
import fs from 'fs-extra';
import { rm } from 'node:fs/promises';
import os from 'os';
import path from 'path';

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

    static async copyTemplate(targetDir: string): Promise<void> {
        const sourceRepo = 'bmadcode/cursor-custom-agents-rules-generator';
        const spinner = Logger.progress('Copying template from repository');

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

            // Check for existing files first
            const filesToMove: string[] = ['.cursor', 'docs', 'xnotes', '.cursorignore', '.cursorindexingignore'];

            let hasExistingFiles = false;
            const existingFiles: string[] = [];

            // First check which files already exist and verify permissions
            for (const file of filesToMove) {
                const dest = path.join(targetDir, file);
                if (await fs.pathExists(dest)) {
                    existingFiles.push(file);
                    hasExistingFiles = true;

                    // Check permissions on existing directories
                    try {
                        const stats = await fs.stat(dest);
                        if (stats.isDirectory()) {
                            await fs.access(dest, fs.constants.W_OK);
                        }
                    } catch (error) {
                        if ((error as NodeJS.ErrnoException).code === 'EACCES') {
                            throw new Error(`permission denied: Unable to access ${file}`);
                        }
                    }
                } else {
                    // Check write permissions for non-existing files
                    try {
                        const destDir = path.dirname(dest);
                        await fs.access(destDir, fs.constants.W_OK);
                    } catch (error) {
                        if ((error as NodeJS.ErrnoException).code === 'EACCES') {
                            throw new Error(`permission denied: Unable to write to ${file}`);
                        }
                        throw error;
                    }
                }
            }

            // Warn about existing files
            if (hasExistingFiles) {
                console.warn('⚠️ The following files/directories already exist and will be skipped:');
                for (const file of existingFiles) {
                    console.warn(`- ${file}`);
                }
                console.warn('To update these files, please back them up and remove them first.');

                // If all files exist, log appropriate message
                if (existingFiles.length === filesToMove.length) {
                    console.info('No new files were copied - all files already exist');
                    spinner.warn('No new files were copied - all files already exist');
                    return;
                }
            }

            // Move non-existing files (but log as copy for user clarity)
            let filesProcessed = false;
            for (const file of filesToMove) {
                const src = path.join(tempDir, file);
                const dest = path.join(targetDir, file);

                if (await fs.pathExists(src)) {
                    if (!(await fs.pathExists(dest))) {
                        try {
                            await fs.move(src, dest);
                            Logger.info(`📦 Copied ${file} to target directory`);
                            filesProcessed = true;
                        } catch (moveError) {
                            if ((moveError as NodeJS.ErrnoException).code === 'EACCES') {
                                throw new Error(`permission denied: Unable to write to ${file}`);
                            }
                            throw moveError;
                        }
                    }
                }
            }

            if (!filesProcessed && !hasExistingFiles) {
                spinner.warn('No files were processed');
            } else if (filesProcessed) {
                spinner.succeed('Template files copied successfully');
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
