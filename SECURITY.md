# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Reporting a Vulnerability

We take the security of VBS App seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue
- Discuss the vulnerability publicly
- Share the vulnerability with others until it has been resolved

### Please DO:

1. **Email us directly** at [INSERT SECURITY EMAIL] with the subject line: `[SECURITY] Brief description of the vulnerability`

2. **Include the following information**:
   - Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
   - Full paths of source file(s) related to the vulnerability
   - The location of the affected code (tag, branch, or commit hash)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the vulnerability, including how an attacker might exploit it
   - Your suggested fix (if you have one)

3. **Allow time for response**: We will acknowledge your email within 48 hours and provide a more detailed response within 7 days indicating the next steps in handling your report.

### What to Expect

- **Acknowledgment**: You will receive an acknowledgment of your report within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 7 days
- **Updates**: We will keep you informed of our progress every 7-10 days
- **Resolution**: We will notify you when the vulnerability is resolved

### Disclosure Policy

- We will credit you for the discovery (unless you prefer to remain anonymous)
- We will work with you to understand and resolve the issue quickly
- We will notify you before public disclosure
- We will coordinate public disclosure with you

## Security Best Practices

When using VBS App, please follow these security best practices:

### Environment Variables

- **Never commit** `.env` files to version control
- Use strong, unique values for `NEXTAUTH_SECRET`
- Rotate secrets regularly in production
- Use environment-specific configuration files

### Database Security

- Use strong database passwords
- Restrict database access to necessary IPs only
- Regularly update PostgreSQL to the latest version
- Enable SSL/TLS for database connections in production

### Authentication

- Use strong email verification
- Enable rate limiting (already implemented)
- Monitor for suspicious login attempts
- Regularly review user accounts and permissions

### Deployment

- Keep dependencies up to date: `npm audit` and `npm update`
- Use HTTPS in production
- Configure proper security headers (already implemented)
- Regularly backup your database
- Monitor application logs for suspicious activity

### Access Control

- Follow the principle of least privilege
- Regularly audit user roles and permissions
- Remove unused accounts
- Use strong passwords for admin accounts

## Known Security Features

VBS App includes the following security features:

- ✅ Input validation using Zod schemas
- ✅ SQL injection protection via Prisma ORM
- ✅ XSS protection with HTML escaping
- ✅ CSRF protection via NextAuth and Next.js Server Actions
- ✅ Rate limiting on authentication endpoints
- ✅ Security headers configured
- ✅ Account lockout after failed login attempts
- ✅ Role-based access control (RBAC)
- ✅ IDOR protection on all resources

For detailed security documentation, see `Docs/SECURITY_COMPLETE.md`.

## Security Updates

Security updates will be released as patches to the latest version. We recommend:

- Keeping your installation up to date
- Subscribing to repository notifications
- Monitoring the [Security Advisories](https://github.com/YOUR_USERNAME/vbs-app/security/advisories) page

## Thank You

Thank you for helping keep VBS App and its users safe! Security researchers who follow this policy will be recognized (unless they prefer to remain anonymous).



