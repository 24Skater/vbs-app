# VBS App - Next Steps

> **Start Here** - Quick reference for immediate implementation

---

## 🎯 Recommended Order

```
1. Phase 1.1: Google OAuth          ← START HERE (highest impact)
2. Phase 1.2: Microsoft OAuth       
3. Phase 2.1-2.4: Student CRUD      ← Most requested feature
4. Phase 2.5: CSV Import            
5. Phase 4.1: GitHub Actions CI     ← Quality gate
6. Phase 3.2: Persistent Audit Log  
```

---

## 🚀 Phase 1.1: Google OAuth (START HERE)

### Step 1: Update Auth Config
**File**: `src/lib/auth-config.ts`

```typescript
// Add import at top:
import GoogleProvider from "next-auth/providers/google";

// Add to providers array (after EmailProvider):
...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
] : []),
```

### Step 2: Create OAuth Buttons Component
**File**: `src/components/OAuthButtons.tsx` (NEW)

See full code in `IMPLEMENTATION_GUIDE.md` → Phase 1 → Section 1.1

### Step 3: Update Sign-In Page
**File**: `src/app/auth/signin/page.tsx`

Add after `<SignInForm />`:
```tsx
<OAuthButtons />
```

### Step 4: Update Next Config
**File**: `next.config.mjs`

```javascript
env: {
  NEXT_PUBLIC_HAS_GOOGLE_OAUTH: process.env.GOOGLE_CLIENT_ID ? "true" : "false",
},
```

### Step 5: Update Environment
**File**: `.env` (and `.env.example`)

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Step 6: Test
1. Start dev server: `npm run dev`
2. Go to `/auth/signin`
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Verify user created in database

---

## 📁 Files to Create/Modify Summary

### Phase 1.1 (Google OAuth)
```
MODIFY: src/lib/auth-config.ts
CREATE: src/components/OAuthButtons.tsx
MODIFY: src/app/auth/signin/page.tsx
MODIFY: next.config.mjs
MODIFY: .env.example
```

### Phase 2.1 (Student List)
```
CREATE: src/app/admin/students/page.tsx
CREATE: src/components/StudentTable.tsx
MODIFY: src/components/AdminNav.tsx (add link)
```

### Phase 2.2 (Create Student)
```
CREATE: src/app/admin/students/new/page.tsx
CREATE: src/app/admin/students/actions.ts
```

---

## 🔗 Reference Documents

| Document | Purpose |
|----------|---------|
| `PRODUCTION_ROADMAP.md` | Full task list with acceptance criteria |
| `IMPLEMENTATION_GUIDE.md` | Code patterns and templates |
| `SECURITY_COMPLETE.md` | Current security status |
| `IMPROVEMENTS.md` | Historical improvements made |

---

## ✅ Before Starting Any Task

1. Read the acceptance criteria in `PRODUCTION_ROADMAP.md`
2. Check code patterns in `IMPLEMENTATION_GUIDE.md`
3. Create feature branch: `git checkout -b feature/[phase]-[name]`
4. Implement incrementally, testing as you go
5. Update progress in `PRODUCTION_ROADMAP.md`

---

## 🛑 Blockers to Watch For

| Issue | Solution |
|-------|----------|
| No GOOGLE_CLIENT_ID | Need to create Google Cloud project and OAuth credentials |
| Prisma errors | Run `npx prisma generate` after schema changes |
| Type errors | Run `npx tsc --noEmit` to check before committing |
| Build fails | Check `npm run build` locally before pushing |

---

## 📞 Getting Help

If stuck, check:
1. NextAuth.js v5 docs: https://authjs.dev
2. Prisma docs: https://www.prisma.io/docs
3. Next.js 15 docs: https://nextjs.org/docs

---

*Ready to start? Begin with Phase 1.1 above!*

