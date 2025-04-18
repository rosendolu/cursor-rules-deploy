# Package Publishing Guide

This guide provides step-by-step instructions for setting up and using GitHub Actions to publish packages to npm or GitHub Packages.

## Setup Instructions

### Prerequisites

1. **GitHub Repository**: Your code must be hosted in a GitHub repository
2. **Node.js Package**: Your project must be a valid Node.js package with a `package.json` file
3. **GitHub Actions**: GitHub Actions must be enabled for your repository

### Setting Up for npm Publishing

1. **Create npm Account**: If you don't already have one, create an account at [npmjs.com](https://www.npmjs.com/)

2. **Generate npm Token**:

    - Log in to npm: `npm login`
    - Generate an access token: `npm token create`
    - Save the token securely (it will only be displayed once)

3. **Add npm Token to GitHub Secrets**:

    - Go to your GitHub repository
    - Navigate to Settings > Secrets and variables > Actions
    - Click "New repository secret"
    - Name: `NPM_TOKEN`
    - Value: Paste your npm token
    - Click "Add secret"

4. **Configure package.json**:

    - Ensure your package.json has required fields:
        ```json
        {
            "name": "your-package-name",
            "version": "1.0.0",
            "description": "Your package description",
            "main": "dist/index.js",
            "files": ["dist"],
            "scripts": {
                "build": "your-build-command",
                "test": "your-test-command"
            },
            "publishConfig": {
                "access": "public" // Required for scoped packages or can be "restricted"
            },
            "repository": {
                "type": "git",
                "url": "git+https://github.com/username/repo-name.git"
            }
        }
        ```

5. **Create GitHub Action Workflow**:
    - Create a directory: `.github/workflows/`
    - Add the workflow file: `npm-publish.yml` (use the example-npm-publish-workflow.yml content)

### Setting Up for GitHub Packages

1. **Configure package.json for GitHub Packages**:

    - Ensure your package name is scoped to your GitHub username or organization:
        ```json
        {
            "name": "@username/package-name",
            "publishConfig": {
                "registry": "https://npm.pkg.github.com"
            }
        }
        ```

2. **Create GitHub Action Workflow**:

    - Create a directory: `.github/workflows/`
    - Add the workflow file: `github-publish.yml` (use the example-github-packages-workflow.yml content)

3. **Set Permissions**:
    - For repositories in an organization, ensure the workflow has write access to packages
    - This is configured in the workflow file with the `permissions` section

## Publishing Process

### Option 1: Publishing with Tag Creation

1. **Create a Tag**:

    ```bash
    git tag -a v1.0.0 -m "Release v1.0.0"
    git push origin v1.0.0
    ```

2. **Monitor Workflow**:

    - Go to your GitHub repository
    - Click on the "Actions" tab
    - You should see the workflow running

3. **Verify Publication**:
    - For npm: Check your package on [npmjs.com](https://www.npmjs.com/package/your-package-name)
    - For GitHub Packages: Check the "Packages" section of your GitHub repository

### Option 2: Manual Trigger with Version Selection

1. **Trigger Workflow Manually**:

    - Go to your GitHub repository
    - Click on the "Actions" tab
    - Select the workflow (e.g., "Publish Package")
    - Click "Run workflow"
    - Select the release type (patch, minor, major)
    - Click "Run workflow"

2. **Monitor Workflow**:
    - Watch the workflow execution in the Actions tab
    - The workflow will:
        - Bump the version
        - Create a tag
        - Generate a changelog
        - Publish the package
        - Create a GitHub release

## Conventional Commits for Automated Versioning

For automated version management, use [Conventional Commits](https://www.conventionalcommits.org/) format:

- `feat`: Minor version bump (new feature)
- `fix`: Patch version bump (bug fix)
- `BREAKING CHANGE`: Major version bump

Examples:

```
feat: add new login feature
fix: correct calculation error
feat!: redesign API (BREAKING CHANGE)
```

## Troubleshooting

### Common Issues and Solutions

1. **Authentication Failure**:

    - Verify your NPM_TOKEN is correctly set in GitHub Secrets
    - Ensure token has not expired
    - Check package.json publishConfig

2. **Version Conflict**:

    - If version already exists, bump version manually:
        ```bash
        npm version patch
        git push --follow-tags
        ```

3. **Workflow Permission Issues**:

    - Check repository permissions
    - For GitHub Packages, ensure workflow has `packages: write` permission

4. **Build Failures**:
    - Review build scripts
    - Test build locally before pushing

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [npm Documentation](https://docs.npmjs.com/)
- [GitHub Packages Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
