# GitHub Package Publishing Research

## Overview

This document explores methods for automating package publishing to GitHub Packages or npm registry using GitHub Actions. The goal is to establish a standardized, automated workflow for package releases.

## GitHub Actions for Package Publishing

### Key Benefits

- **Automation**: Trigger releases based on tags, branches, or manual events
- **Consistency**: Ensure packages are built and tested before publishing
- **Versioning**: Automate version management through conventional commits
- **Documentation**: Generate changelogs automatically
- **Security**: Store sensitive credentials as GitHub Secrets

### Publishing to npm Registry

GitHub Actions can be configured to publish packages to npm using the following approach:

1. **Authentication**: Use `NPM_TOKEN` stored as a GitHub Secret
2. **Workflow Triggers**: Publish on specific events (tag creation, manual trigger)
3. **Version Management**: Automate versioning using tools like semantic-release

### Publishing to GitHub Packages

GitHub Packages provides an alternative registry tightly integrated with GitHub:

1. **Authentication**: Uses GITHUB_TOKEN which is automatically available in workflows
2. **Scope & Visibility**: Packages can be scoped to organizations or users
3. **Integration**: Direct integration with GitHub repositories

## Proposed Workflow

The recommended workflow consists of:

1. **Development**: Make changes following standard development practices
2. **Commit**: Use conventional commits format for automated versioning
3. **Pull Request**: Review and approve changes
4. **Merge**: Changes are merged to main branch
5. **Tag Creation**: Either manual or automated tag creation
6. **Workflow Trigger**: GitHub Action triggered by new tag
7. **Build & Test**: Package is built and tested
8. **Version Update**: Package version is updated based on commits
9. **Publish**: Package is published to the registry
10. **Release Notes**: Changelog and release notes are generated

## Implementation Options

### Option 1: Manual Tag & Release

- Developer manually creates a tag after merge
- GitHub Action is triggered by the tag
- Simple approach with developer control over versions

### Option 2: Fully Automated Release

- Uses semantic-release to analyze commits
- Automatically determines version
- Creates tag, generates changelog, and publishes

### Option 3: Release on Demand

- Manual trigger in GitHub Actions
- Developer specifies version
- Provides flexibility for release timing

## Recommended Tools

- **semantic-release**: Automates versioning based on commit messages
- **@actions/setup-node**: Sets up Node.js environment
- **@actions/github-script**: For custom GitHub API operations
- **conventional-changelog**: Generates changelogs from commits

## Security Considerations

- Store npm tokens as GitHub Secrets
- Use GITHUB_TOKEN with minimal permissions
- Consider using OpenID Connect for more secure authentication

## Conclusion

GitHub Actions provides a robust platform for automating package publishing. The recommended approach is to implement a workflow triggered by tag creation, with options for manual oversight or full automation depending on project requirements.
