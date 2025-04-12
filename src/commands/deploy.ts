import DegitManager from '@/services/degitManager.js';
import Logger from '@/utils/logger.js';
import fs from 'fs-extra';
import path from 'path';

export async function deploy(targetDir: string): Promise<void> {
    try {
        // Handle both absolute and relative paths
        const resolvedTargetDir: string = path.isAbsolute(targetDir) ? targetDir : path.resolve(process.cwd(), targetDir);

        Logger.info(`Deploying to: ${resolvedTargetDir}`);

        // Create target directory if it doesn't exist
        await fs.ensureDir(resolvedTargetDir);

        // Copy template using degit
        await DegitManager.copyTemplate(resolvedTargetDir);

        Logger.complete('Deployment completed successfully! 🎉');
        Logger.info(`Core rule generator: ${path.join(resolvedTargetDir, '.cursor/rules/core-rules/rule-generating-agent.mdc')}`);
        Logger.info(`Sample subfolders and rules: ${path.join(resolvedTargetDir, '.cursor/rules/{sub-folders}/')}`);
        Logger.info(`Sample Agile Workflow Templates: ${path.join(resolvedTargetDir, '.cursor/templates/')}`);
        Logger.info(`Workflow Documentation: ${path.join(resolvedTargetDir, 'docs/workflow-rules.md')}`);
    } catch (error) {
        Logger.error(`Deployment failed: ${(error as Error).message}`);
        process.exit(1);
    }
}
