# cursor-rules-deploy Publishing Guide

This guide provides specific instructions for publishing the `cursor-rules-deploy` package using GitHub Actions.

## Prerequisites

1. **GitHub Repository**: Ensure you have push access to the repository
2. **Node.js**: Install Node.js version >=22.14.0
3. **npm Account**: Create an account at npmjs.com if publishing to npm

## Setting Up for First Release

### 1. Configure Package.json

Ensure your package.json is properly configured:

```json
{
    "name": "cursor-rules-deploy",
    "version": "1.0.0",
    "description": "Deploy Cursor AI rules and templates",
    "main": "dist/index.js",
    "files": ["dist"],
    "scripts": {
        "build": "tsc",
        "test": "jest",
        "lint": "eslint src/**/*.ts"
    },
    "publishConfig": {
        "access": "public"
    },
    "repository": {
        "type": "git",
        "url": "git+https://github.com/username/cursor-rules-deploy.git"
    }
}
```

### 2. Set Up GitHub Secrets

For npm publishing:

1. Generate an npm token:

    ```bash
    npm login
    npm token create --read-only
    ```

2. Add the token to GitHub repository:
    - Go to Settings > Secrets and variables > Actions
    - Add new repository secret named `NPM_TOKEN`
    - Paste the generated token

### 3. Create Initial Files

1. Create a `CHANGELOG.md` file:

    ```markdown
    # Changelog

    All notable changes to this project will be documented in this file.
    ```

## Publishing Workflow

### Option 1: Publishing with Git Tags

1. **Make Changes** to the codebase following conventional commits:

    ```bash
    git commit -m "feat: add new feature"
    git commit -m "fix: resolve issue"
    ```

2. **Push Changes** to the repository:

    ```bash
    git push origin main
    ```

3. **Create and Push a Tag**:

    ```bash
    git tag -a v1.0.0 -m "Release v1.0.0"
    git push origin v1.0.0
    ```

4. **Monitor GitHub Actions**:
    - Go to the GitHub repository
    - Click on the "Actions" tab
    - Watch the "Publish Package" workflow
    - Note: Tag-based releases default to npm registry

### Option 2: Manual Trigger with Version Selection

1. **Navigate to GitHub Actions**:

    - Go to the GitHub repository
    - Click on the "Actions" tab
    - Select "Publish Package" workflow
    - Click "Run workflow"

2. **Configure Release**:

    - Choose release type: patch, minor, or major
    - Select target registry: npm or github
    - Click "Run workflow"

3. **Monitor Progress**:
    - Watch the workflow execution
    - The workflow will automatically:
        - Bump the version
        - Generate a changelog
        - Create a tag
        - Publish the package to the selected registry
        - Create a GitHub release

## Registry-Specific Details

### Publishing to npm Registry

The workflow will:

- Use the package name as configured in your package.json
- Authenticate using NPM_TOKEN from GitHub Secrets
- Create a public package (or private if configured)

### Publishing to GitHub Packages

The workflow will:

- Automatically scope the package name to your GitHub organization/username
- Update package.json to use the GitHub Packages registry
- Authenticate using the default GITHUB_TOKEN
- Make the package available in your GitHub repository's Packages tab

### Installing Packages from GitHub Packages

```bash
# Add to .npmrc
@username:registry=https://npm.pkg.github.com

# Install package
npm install @username/cursor-rules-deploy
```

## Troubleshooting

### Authentication Issues

1. **NPM_TOKEN Invalid or Expired**:

    - Generate a new npm token
    - Update the GitHub secret

2. **GitHub Packages Access Issues**:
    - Ensure the repository has proper visibility settings
    - Check user permissions

### Build or Test Failures

1. **Failed Tests**:

    - Fix failing tests before attempting to publish
    - Run tests locally: `npm test`

2. **Build Errors**:
    - Ensure build process works locally: `npm run build`
    - Check for TypeScript errors

## Post-Release Tasks

1. **Verify Publication**:

    - For npm: `npm view cursor-rules-deploy`
    - For GitHub Packages: Check the Packages section in GitHub

2. **Update Documentation**:

    - Update README with new features
    - Update usage examples if API has changed

3. **Announce Release**:
    - Share release notes with users
    - Update documentation website if applicable
