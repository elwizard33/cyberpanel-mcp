# Contributing to CyberPanel MCP Server

First off, thank you for considering contributing to CyberPanel MCP Server! 🎉

This document provides guidelines and standards for contributing to this project. Following these guidelines helps maintain code quality and makes the contribution process smooth for everyone.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Git**
- A CyberPanel server for testing (optional but recommended)

### Types of Contributions

We welcome many types of contributions:

- 🐛 **Bug fixes** - Fix issues and improve stability
- ✨ **New features** - Add new tools or capabilities
- 📝 **Documentation** - Improve guides, README, or code comments
- 🧪 **Tests** - Add or improve test coverage
- 🎨 **Code quality** - Refactoring and optimization
- 🌐 **Translations** - Help internationalize the project

## 💻 Development Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/cyberpanel-mcp.git
   cd cyberpanel-mcp
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/elwizard33/cyberpanel-mcp.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Build the project**

   ```bash
   npm run build
   ```

6. **Run locally**

   ```bash
   CYBERPANEL_URL=https://your-server:8090 CYBERPANEL_API_KEY=your-key npm start
   ```

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## 📝 Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This leads to more readable messages and enables automatic changelog generation.

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, semicolons, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `build` | Changes to build system or dependencies |
| `ci` | Changes to CI configuration |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

### Scopes

Common scopes for this project:

- `tools` - MCP tools (websites, databases, email, etc.)
- `auth` - Authentication related changes
- `config` - Configuration changes
- `plugin` - API Keys plugin changes
- `deps` - Dependency updates

### Examples

```bash
# Feature
git commit -m "feat(tools): add WordPress multisite support"

# Bug fix
git commit -m "fix(auth): resolve API key validation on special characters"

# Documentation
git commit -m "docs: add troubleshooting section to README"

# Breaking change
git commit -m "feat(api)!: change authentication header format

BREAKING CHANGE: X-API-Key header now required instead of Authorization"
```

### Commit Best Practices

- ✅ Use the imperative mood ("add feature" not "added feature")
- ✅ Keep the subject line under 72 characters
- ✅ Capitalize the subject line
- ✅ Do not end the subject line with a period
- ✅ Separate subject from body with a blank line
- ✅ Reference issues in the footer (`Fixes #123`, `Closes #456`)

## 🔄 Pull Request Process

### Before Submitting

1. **Update your fork** with the latest upstream changes
2. **Create a feature branch** from `main`
3. **Make your changes** following our code style
4. **Test your changes** thoroughly
5. **Update documentation** if needed
6. **Ensure all commits** follow conventional commits

### Branch Naming

Use descriptive branch names:

```
feature/add-wordpress-tools
fix/database-connection-timeout
docs/update-installation-guide
refactor/simplify-auth-flow
```

### Submitting Your PR

1. **Push your branch** to your fork
2. **Open a Pull Request** against `main`
3. **Fill out the PR template** completely
4. **Link related issues** using keywords (`Fixes #123`)
5. **Request review** from maintainers

### PR Requirements

- [ ] All commits follow conventional commits format
- [ ] Code passes linting (`npm run lint`)
- [ ] Code builds successfully (`npm run build`)
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if applicable)
- [ ] No merge conflicts with `main`

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be included in the next release! 🎉

## 🎨 Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use explicit return types for functions
- Use interfaces over type aliases where possible
- Document public APIs with JSDoc comments

### File Organization

```
src/
├── client/          # CyberPanel API client
├── tools/           # MCP tools organized by category
│   ├── websites.ts
│   ├── databases.ts
│   ├── email.ts
│   └── ...
├── prompts/         # MCP prompts
├── resources/       # MCP resources
├── config.ts        # Configuration handling
└── index.ts         # Main entry point
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `cloud-backups-s3.ts` |
| Classes | PascalCase | `CyberPanelClient` |
| Functions | camelCase | `createWebsite` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_TIMEOUT` |
| Interfaces | PascalCase with I prefix (optional) | `WebsiteConfig` |

### Adding New Tools

When adding a new tool:

1. Create or update the appropriate file in `src/tools/`
2. Follow the existing tool structure:

```typescript
export const myNewTools: ToolDefinition[] = [
  {
    name: "category_action",
    description: "Clear description of what the tool does",
    inputSchema: {
      type: "object",
      properties: {
        param1: {
          type: "string",
          description: "Description of parameter"
        }
      },
      required: ["param1"]
    }
  }
];

export async function handleMyNewTools(
  name: string,
  args: Record<string, unknown>,
  client: CyberPanelClient
): Promise<ToolResponse> {
  // Implementation
}
```

3. Register the tool in `src/tools/index.ts`
4. Update the README with the new tool

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for new features and bug fixes
- Aim for meaningful test coverage
- Use descriptive test names
- Mock external dependencies

## 📚 Documentation

### When to Update Docs

- Adding new tools or features
- Changing existing behavior
- Updating configuration options
- Fixing incorrect information

### Documentation Locations

| Type | Location |
|------|----------|
| User guide | `README.md` |
| API reference | JSDoc in source code |
| Contributing | `CONTRIBUTING.md` |
| Issue templates | `.github/ISSUE_TEMPLATE/` |
| Changelog | `CHANGELOG.md` |

## ❓ Questions?

- Open a [Discussion](https://github.com/elwizard33/cyberpanel-mcp/discussions) for questions
- Check existing [Issues](https://github.com/elwizard33/cyberpanel-mcp/issues) for known problems
- Join the [CyberPanel Community](https://community.cyberpanel.net/) for support

---

Thank you for contributing to CyberPanel MCP Server! 🚀
