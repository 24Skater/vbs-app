# Contributing to VBS App

Thank you for your interest in contributing to VBS App! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Guidelines](#development-guidelines)
  - [Code Style](#code-style)
  - [Commit Messages](#commit-messages)
  - [Testing](#testing)
- [Project Structure](#project-structure)

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vbs-app.git
   cd vbs-app
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/vbs-app.git
   ```

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env` (if available) or create a `.env` file
   - Configure the required environment variables (see README.md)

3. **Start the database**:
   ```bash
   docker compose up -d
   ```

4. **Run database migrations**:
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** after following the steps
- **Describe the behavior you expected** to see instead
- **Include screenshots** if applicable
- **Include environment details** (OS, Node.js version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the steps
- **Describe the current behavior** and explain which behavior you expected to see instead
- **Explain why this enhancement would be useful**

### Submitting Pull Requests

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes** following the [Development Guidelines](#development-guidelines)

3. **Test your changes** thoroughly

4. **Commit your changes** with clear, descriptive commit messages:
   ```bash
   git add .
   git commit -m "Add: description of your changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub:
   - Use a clear and descriptive title
   - Provide a detailed description of your changes
   - Reference any related issues
   - Include screenshots if applicable

7. **Keep your branch up to date** with the main branch:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## Development Guidelines

### Code Style

- **TypeScript**: Follow TypeScript best practices and use type annotations
- **React**: Follow React best practices and use functional components with hooks
- **Formatting**: The project uses ESLint. Run `npm run lint` before committing
- **Naming**: Use descriptive names for variables, functions, and components
- **Comments**: Add comments for complex logic or non-obvious code

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

Example:
```
feat: add student search functionality
fix: resolve attendance export date formatting issue
docs: update README with new setup instructions
```

### Testing

- Test your changes locally before submitting
- Ensure all existing tests pass
- Add tests for new features when applicable
- Test edge cases and error handling

### Database Changes

- **Migrations**: Always create a migration for database schema changes
  ```bash
  npx prisma migrate dev --name your_migration_name
  ```
- **Schema**: Update `prisma/schema.prisma` before creating migrations
- **Seed Data**: Update seed files if adding new default data

### Security Considerations

- Never commit sensitive information (API keys, passwords, etc.)
- Validate all user inputs
- Follow security best practices outlined in `Docs/SECURITY_COMPLETE.md`
- Review security implications of your changes

## Project Structure

```
vbs-app/
├── prisma/              # Database schema and migrations
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   └── lib/            # Utility functions
├── public/             # Static assets
└── Docs/               # Documentation
```

## Questions?

If you have questions about contributing, please:
- Open an issue with the `question` label
- Check existing documentation in the `Docs/` directory
- Review existing issues and pull requests

Thank you for contributing to VBS App! 🎉



