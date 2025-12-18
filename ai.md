# App Health Audit

Based on the "vibe-coded MVP red flags" checklist, here's an honest assessment:

---

## 1. Data Model Drift ✅ GOOD

**Can you explain your data model clearly?**

```
organizations (multi-tenant root)
├── users (with roles: admin/manager/member)
├── leaves (FK to users, with status indexes)
├── tasks (with assignee, org+status composite indexes)
├── expenses (FK to users)
├── assets (assigned to users)
├── documents (with version history)
├── holidays, leavePolicies, departments...
└── auditLogs (tracking all mutations)
```

**Strengths:**
- ✅ Single source of truth - all tables have `organizationId` for multi-tenancy
- ✅ Proper database indexes on hot query paths (status, assignee, composite)
- ✅ TypeScript types generated from schema via Drizzle
- ✅ Enums for constrained values (user_role, leave_status, task_priority)
- ✅ Foreign key references ensure referential integrity

**Concerns:**
- ⚠️ Some JSON columns (settings, salaryDetails) - flexible but no schema enforcement
- ⚠️ Payslip amounts stored as text ("103") instead of integer cents

---

## 2. Happy Path Logic ⚠️ NEEDS ATTENTION

**Can you tell why the last bug happened?**

**Strengths:**
- ✅ Server actions have input validation before mutations
- ✅ Role-based guards on sensitive actions (requireAdmin, requireHR)
- ✅ Organization context required for all tenant-scoped data

**Concerns:**
- ⚠️ Limited try-catch in server actions (0 found in actions/*.ts)
- ⚠️ Errors bubble up to Next.js error boundaries, but:
  - No user-friendly error messages
  - No retry mechanisms
  - Double-submit not prevented on all forms
- ⚠️ No transaction wrapping for multi-step operations (e.g., invite + user creation)
- ⚠️ Edge cases: What if user refreshes during leave approval?

**Recommendations:**
```typescript
// Current (implicit error handling)
await db.insert(users).values({...});

// Better
try {
  await db.transaction(async (tx) => {
    await tx.insert(users).values({...});
    await tx.insert(auditLogs).values({...});
  });
} catch (error) {
  console.error('[Action] Failed:', error);
  return { error: 'Failed to create user' };
}
```

---

## 3. Observability ⚠️ NEEDS ATTENTION

**Can you tell why the last bug happened?**

**Strengths:**
- ✅ Audit logs table exists (auditLogs in schema)
- ✅ Actions log to auditLogs for sensitive operations
- ✅ Scripts use colored console.log for visibility

**Concerns:**
- ⚠️ No structured logging (no winston, pino, etc.)
- ⚠️ No request/response tracing (no correlation IDs)
- ⚠️ No error tracking service (Sentry, LogRocket)
- ⚠️ No server-side metrics (latency, error rates)
- ⚠️ Cannot answer "what exactly failed for user X?"

**Recommendations:**
1. Add Sentry for error tracking (~5 min setup)
2. Add structured logging (pino or console.log with JSON)
3. Add correlation IDs to requests

---

## 4. Unit Economics ✅ GOOD

**Can you estimate cost per active user?**

**Current API usage:**
| Service | Cost | Usage |
|---------|------|-------|
| Database (Postgres) | ~$0 (Supabase/Railway free tier) | Main storage |
| Auth (NextAuth) | $0 | Self-hosted |
| Holidays API (Nager.Date) | $0 | Free, no limits |
| Email (Resend) | Free tier | Invites only |
| File uploads (Cloudinary) | Free tier 25GB | Optional attachments |

**No paid AI APIs detected.** The codebase does not use:
- ❌ OpenAI
- ❌ Image generation APIs
- ❌ Avatar generation
- ❌ AI completion

**Cost per user: ~$0** at current scale (free tiers)

**At scale concerns:**
- Database egress beyond free tier
- Resend email beyond 100/day
- Cloudinary beyond 25GB

---

## 5. Environment Separation ⚠️ NEEDS ATTENTION

**Can you safely change one feature without breaking another?**

**Strengths:**
- ✅ Build step exists (next build passes)
- ✅ TypeScript catches type errors at compile time
- ✅ Dev server separate from production

**Concerns:**
- ⚠️ No separate staging environment documented
- ⚠️ No feature flags system
- ⚠️ Same DB likely used for dev/staging/prod
- ⚠️ No CI/CD pipeline visible (GitHub Actions, etc.)
- ⚠️ Tests exist but coverage unclear

**Recommendations:**
1. Create separate .env.development, .env.staging, .env.production
2. Add feature flags (simple: just env vars)
3. Set up preview deployments (Vercel does this automatically)

---

## Summary Scorecard

| Criteria | Status | Score |
|----------|--------|-------|
| Can you explain your data model? | ✅ Yes | 4/5 |
| Can you tell why the last bug happened? | ⚠️ Partially | 2/5 |
| Can you estimate cost per active user? | ✅ Yes (~$0) | 5/5 |
| Can you safely change one feature? | ⚠️ Partially | 3/5 |

**Overall: 14/20 - Solid foundation, needs observability**

---

## Priority Fixes

### P0 (Do now)
1. Add Sentry error tracking
2. Wrap critical actions in try-catch with user-friendly errors

### P1 (This week)
3. Add transaction wrapping for multi-step mutations
4. Prevent double-submit on forms (useTransition already used in some places)

### P2 (Before scaling)
5. Add structured logging
6. Set up staging environment
7. Add correlation IDs for request tracing

---

*Audit generated 2024-12-18*
