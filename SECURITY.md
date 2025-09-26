# Security Policy

## Least-Privilege Principles

This project is built with security-first principles, emphasizing least-privilege access and secure defaults.

### Core Security Practices

#### Environment Variables
- **Never commit sensitive data**: All secrets and sensitive configuration must use environment variables
- **Principle of least access**: Only grant the minimum permissions required for functionality
- **Environment isolation**: Separate configurations for development, staging, and production

#### Code Security
- **Type Safety**: Leverage TypeScript's type system to prevent runtime errors
- **Input Validation**: Validate all external inputs and configuration values
- **Dependency Management**: Regularly audit and update dependencies using `pnpm audit`
- **No Hardcoded Secrets**: All sensitive values must be externalized

#### Access Control
- **Identity Constants**: Personal identity information is centralized but not sensitive
- **Slack Integration**: Member IDs are considered semi-public but should not be exposed unnecessarily
- **Configuration Security**: Sensitive config values must be encrypted at rest and in transit

### Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

### Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **Do not** open a public GitHub issue
2. Email security concerns to: security@fikra.ventures
3. Include detailed steps to reproduce the issue
4. Allow reasonable time for assessment and resolution

### Security Checklist for Developers

- [ ] Environment variables are properly configured
- [ ] No hardcoded credentials or secrets
- [ ] Dependencies are up to date
- [ ] Input validation is implemented
- [ ] Logging doesn't expose sensitive information
- [ ] Access permissions follow least-privilege principle

### Threat Model

This library primarily handles:
- **Personal identity constants** (non-sensitive)
- **Configuration management** (potentially sensitive)
- **Logging utilities** (may contain sensitive data in logs)

Key threats to consider:
- Exposure of configuration secrets
- Sensitive data in application logs
- Dependency vulnerabilities
- Environment variable leakage
