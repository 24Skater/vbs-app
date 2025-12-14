# Phase 1: Authentication Enhancement - Implementation Prompt

> **Copy everything below this line and paste as a new conversation**

---

## Task: Implement Phase 1 - Authentication Enhancement for VBS App

You are implementing Phase 1 of the VBS App production roadmap. This phase adds OAuth providers (Google, Microsoft) and credentials-based authentication.

### 📚 Required Reading First

Before making ANY changes, read these files completely:
1. `Docs/PRODUCTION_ROADMAP.md` - Full task definitions
2. `Docs/IMPLEMENTATION_GUIDE.md` - Code patterns to follow
3. `src/lib/auth-config.ts` - Current auth configuration
4. `src/lib/auth-instance.ts` - NextAuth instance
5. `src/components/SignInForm.tsx` - Current sign-in form
6. `src/app/auth/signin/page.tsx` - Current sign-in page

### 🎯 Scope - ONLY These Tasks

Implement in this exact order:

#### Task 1.1: Google OAuth Provider
- **Modify**: `src/lib/auth-config.ts` - Add GoogleProvider
- **Create**: `src/components/OAuthButtons.tsx` - OAuth button component
- **Modify**: `src/app/auth/signin/page.tsx` - Add OAuthButtons
- **Modify**: `next.config.mjs` - Add NEXT_PUBLIC env vars
- **Modify**: `.env.example` - Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

**Acceptance Criteria**:
- [ ] Google button only shows if GOOGLE_CLIENT_ID is set
- [ ] OAuth flow completes successfully
- [ ] User created in database with email
- [ ] Existing email users can link Google account
- [ ] New OAuth users default to VIEWER role

#### Task 1.2: Microsoft/Azure AD Provider
- **Modify**: `src/lib/auth-config.ts` - Add AzureADProvider
- **Modify**: `src/components/OAuthButtons.tsx` - Add Microsoft button
- **Modify**: `.env.example` - Add AZURE_AD vars

**Acceptance Criteria**:
- [ ] Microsoft button only shows if AZURE_AD_CLIENT_ID is set
- [ ] Works with personal Microsoft accounts
- [ ] Works with Azure AD organizational accounts
- [ ] Tenant ID is optional (defaults to "common")

#### Task 1.3: Credentials Provider (Email + Password)
- **Modify**: `prisma/schema.prisma` - Add password field to User
- **Create**: `prisma/migrations/[timestamp]_add_password/migration.sql`
- **Modify**: `src/lib/auth-config.ts` - Add CredentialsProvider
- **Create**: `src/app/auth/register/page.tsx` - Registration page
- **Create**: `src/app/api/auth/register/route.ts` - Registration API
- **Modify**: `src/components/SignInForm.tsx` - Add password field toggle

**Acceptance Criteria**:
- [ ] User can register with email + password
- [ ] Password hashed with bcrypt (12 rounds)
- [ ] Password requires 8+ chars, uppercase, lowercase, number
- [ ] User can sign in with email + password
- [ ] Clear error messages for invalid credentials

#### Task 1.4: User Invitation System
- **Modify**: `prisma/schema.prisma` - Add Invitation model
- **Create**: `prisma/migrations/[timestamp]_add_invitations/migration.sql`
- **Create**: `src/lib/invitations.ts` - Invitation utilities
- **Create**: `src/app/admin/users/invite/page.tsx` - Invite form
- **Modify**: `src/app/admin/users/page.tsx` - Add invite button
- **Modify**: `src/lib/auth-config.ts` - Check invitation on sign-in

**Acceptance Criteria**:
- [ ] Admin can invite user by email with pre-assigned role
- [ ] Invitation email sent with signup link
- [ ] Invited user gets assigned role on first sign-in
- [ ] Pending invitations shown in admin panel
- [ ] Invitations expire after 7 days

### 🚫 DO NOT

- Do NOT modify any files not listed above
- Do NOT add features not specified
- Do NOT refactor existing working code
- Do NOT add new dependencies unless specified
- Do NOT create tests (that's Phase 6)
- Do NOT add i18n/translations (that's Phase 9)
- Do NOT over-engineer or add "nice to haves"

### ✅ Implementation Rules

1. **Follow existing patterns** - Match the code style in existing files
2. **Use existing utilities** - Use `src/lib/` functions where they exist
3. **Server components by default** - Only use "use client" when needed
4. **Validate all inputs** - Use Zod schemas for validation
5. **Audit log changes** - Use existing `auditLog()` function
6. **Error handling** - Use existing error classes from `src/lib/errors.ts`

### 📝 Code Patterns to Follow

Get patterns from `Docs/IMPLEMENTATION_GUIDE.md`:
- OAuth provider configuration
- OAuthButtons component
- Registration API route
- Invitation system

### 🔄 After Each Task

1. Run `npm run lint` - fix any errors
2. Run `npx tsc --noEmit` - fix type errors  
3. Test the feature manually in browser
4. Confirm acceptance criteria are met
5. Report what was completed

### 📦 Dependencies

These are already installed:
- `next-auth` (includes Google, AzureAD, Credentials providers)
- `bcryptjs` (for password hashing)
- `zod` (for validation)

No new packages needed for Phase 1.

### 🏁 Completion

When all 4 tasks are complete:
1. List all files created/modified
2. Confirm all acceptance criteria met
3. Note any issues encountered
4. Update `Docs/PRODUCTION_ROADMAP.md` progress section

---

## Start Now

Begin with Task 1.1 (Google OAuth). Read the required files first, then implement following the patterns in `Docs/IMPLEMENTATION_GUIDE.md`.

Report your plan before making changes.

