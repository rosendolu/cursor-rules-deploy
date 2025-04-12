import { copyDirectory, ensureDir } from '@/services/fileManager.js';
import Logger from '@/utils/logger.js';
import fs from 'fs-extra';
import path from 'path';

export async function generateReadme(targetDir: string): Promise<void> {
    const readmePath = path.join(targetDir, 'README.md');

    try {
        // Skip if README already exists
        if (await fs.pathExists(readmePath)) {
            Logger.info(`Skipping existing file: README.md`);
            return;
        }

        // Generate README content
        await fs.writeFile(readmePath, generateReadmeContent());
        Logger.success(`Generated README.md`);
    } catch (error) {
        Logger.error(`Failed to generate README.md: ${(error as Error).message}`);
        throw error;
    }
}

export async function generateWorkflowDocs(targetDir: string): Promise<void> {
    const docsDir = path.join(targetDir, 'docs');
    const workflowDocsPath = path.join(docsDir, 'workflow-rules.md');

    try {
        // Ensure docs directory exists
        await ensureDir(docsDir);

        // Skip if workflow docs already exist
        if (await fs.pathExists(workflowDocsPath)) {
            Logger.info(`Skipping existing file: workflow-rules.md`);
            return;
        }

        // Generate workflow docs content
        await fs.writeFile(workflowDocsPath, generateWorkflowDocsContent());
        Logger.success(`Generated workflow-rules.md`);
    } catch (error) {
        Logger.error(`Failed to generate workflow docs: ${(error as Error).message}`);
        throw error;
    }
}

export async function copyTemplates(targetDir: string): Promise<void> {
    const templatesDir = path.join(targetDir, '.cursor/templates');

    try {
        // Skip if templates directory doesn't exist
        if (!(await fs.pathExists(templatesDir))) {
            Logger.info(`No templates directory found, skipping template copy`);
            return;
        }

        const spinner = Logger.progress(`Copying templates`);
        spinner.start();

        // Copy templates
        await copyDirectory(templatesDir, path.join(process.cwd(), 'templates'));
        spinner.succeed(`Templates copied successfully`);
    } catch (error) {
        Logger.error(`Failed to copy templates: ${(error as Error).message}`);
        throw error;
    }
}

function generateReadmeContent(): string {
    return `# Cursor AI Rules and Templates

This repository contains custom rules and templates for enhancing your development workflow with Cursor AI.

## Directory Structure

\`.cursor/\` - Contains Cursor AI configuration
  ├── \`rules/\` - Custom rules for Cursor AI
  │   ├── \`core-rules/\` - Core rule definitions
  │   └── \`{sub-folders}/\` - Additional rule categories
  └── \`templates/\` - Reusable code templates

## Getting Started

1. Install [Cursor](https://cursor.sh)
2. Clone this repository
3. Open your project in Cursor
4. Start using the custom rules and templates

## Documentation

See \`docs/workflow-rules.md\` for detailed documentation on available rules and templates.

## Contributing

Feel free to contribute by:
1. Adding new rules
2. Improving existing rules
3. Creating useful templates
4. Enhancing documentation

## License

MIT
`;
}

function generateWorkflowDocsContent(): string {
    return `# Cursor AI Workflow Rules

This document describes the custom rules and templates available for enhancing your development workflow with Cursor AI.

## Core Rules

The core rules provide fundamental AI assistance for common development tasks:

- \`rule-generating-agent.mdc\` - Helps create new Cursor AI rules
- \`code-review.mdc\` - Assists with code review tasks
- \`documentation.mdc\` - Helps generate and maintain documentation

## Usage

1. Open your project in Cursor
2. Access rules through the command palette
3. Follow rule-specific instructions

## Creating New Rules

1. Use the rule generator template
2. Follow the rule format guidelines
3. Test thoroughly
4. Submit for review

## Best Practices

- Keep rules focused and specific
- Include clear examples
- Document edge cases
- Test with various inputs

## Templates

The \`.cursor/templates\` directory contains reusable code templates for:

- Common patterns
- Project structures
- Documentation formats

## Customization

You can customize rules by:

1. Modifying rule parameters
2. Adding new conditions
3. Extending existing rules
4. Creating rule combinations

## Troubleshooting

If you encounter issues:

1. Check rule syntax
2. Verify file paths
3. Review error messages
4. Update Cursor version

## Contributing

See README.md for contribution guidelines.
`;
}
