# Contributing to Cursor Rules Deploy

Thank you for your interest in contributing to Cursor Rules Deploy! We're excited to have you join our community 🎉

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful, inclusive, and considerate of others.

## Getting Started

1. Fork the repository
2. Clone your fork:
    ```bash
    git clone https://github.com/rosendolu/cursor-rules-deploy.git
    cd cursor-rules-deploy
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Create a new branch:
    ```bash
    git checkout -b feature/your-feature-name
    ```

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and concise
- Use async/await for asynchronous operations
- Add appropriate error handling

### Rules Development

When contributing new rules or modifying existing ones:

1. Place rules in appropriate directories under `rules/`
2. Follow the rule naming convention: `rule-name-{auto|agent|manual|always}.mdc`
3. Include comprehensive descriptions in rule frontmatter
4. Provide both valid and invalid examples
5. Test rules thoroughly before submitting

### Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Add integration tests for rule deployments
- Test edge cases and error scenarios

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass locally
4. Update the README.md if necessary
5. Create a Pull Request with a clear title and description
6. Link any related issues
7. Wait for review and address feedback

### PR Title Format

Use one of these prefixes:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for adding tests
- `refactor:` for code refactoring
- `chore:` for routine tasks

Example: `feat: Add support for custom rule templates`

## Commit Guidelines

- Use clear and descriptive commit messages
- Reference issues in commit messages when applicable
- Keep commits focused and atomic
- Follow the conventional commits specification

Example commit messages:

```
feat: Add new rule validation feature
fix: Resolve template deployment issue #123
docs: Update rule creation guidelines
```

## Bug Reports and Feature Requests

- Use GitHub Issues for bug reports and feature requests
- Check existing issues before creating new ones
- Provide detailed descriptions and steps to reproduce
- Include relevant logs and error messages
- Tag issues appropriately

## Documentation

- Keep documentation up to date
- Use clear and concise language
- Include code examples where appropriate
- Document breaking changes
- Update changelog for significant changes

## Questions and Support

- Use GitHub Discussions for questions
- Check existing discussions before posting
- Be specific about your question
- Include relevant context and code examples

## License

By contributing to Cursor Rules Deploy, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to make Cursor Rules Deploy better! 🚀
