import Logger from '@/utils/logger.js';
import fs from 'fs-extra';
import path from 'path';

export async function copyFile(src: string, dest: string): Promise<void> {
    try {
        if (await fs.pathExists(dest)) {
            Logger.info(`Skipping existing file: ${path.basename(dest)}`);
            return;
        }
        await fs.copy(src, dest);
        Logger.success(`Copied new file: ${path.basename(dest)}`);
    } catch (error) {
        Logger.error(`Failed to copy file ${src} to ${dest}: ${(error as Error).message}`);
        throw error;
    }
}

export async function ensureDir(dirPath: string): Promise<void> {
    try {
        await fs.ensureDir(dirPath);
        Logger.success(`Ensured directory exists: ${dirPath}`);
    } catch (error) {
        Logger.error(`Failed to create directory ${dirPath}: ${(error as Error).message}`);
        throw error;
    }
}

export async function copyDirectory(
    src: string,
    dest: string,
    options: {
        overwrite?: boolean;
        filter?: (src: string) => boolean;
    } = {}
): Promise<void> {
    try {
        const defaultOptions = {
            overwrite: false,
            filter: () => true,
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
        };

        await fs.copy(src, dest, {
            overwrite: mergedOptions.overwrite,
            filter: mergedOptions.filter,
        });

        Logger.success(`Copied directory: ${path.basename(src)}`);
    } catch (error) {
        Logger.error(`Failed to copy directory ${src} to ${dest}: ${(error as Error).message}`);
        throw error;
    }
}

export async function updateFile(filePath: string, updateFn: (content: string) => string): Promise<void> {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const updatedContent = updateFn(content);

        if (content !== updatedContent) {
            await fs.writeFile(filePath, updatedContent);
            Logger.success(`Updated ${path.basename(filePath)}`);
        } else {
            Logger.info(`No changes needed for ${path.basename(filePath)}`);
        }
    } catch (error) {
        Logger.error(`Failed to update ${filePath}: ${(error as Error).message}`);
        throw error;
    }
}
