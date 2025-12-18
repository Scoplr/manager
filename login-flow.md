# Login Flow Documentation

## Overview

wrkspace uses NextAuth.js with a Credentials provider for authentication. Users log in with email + password.

---

## Login Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        /login page                           │
│              User enters email + password                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    NextAuth authorize()                      │
│                    src/lib/auth.ts                          │
└──────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│    Super Admin Check    │     │     Regular User Check       │
│ haris.edu14@gmail.com   │     │ Lookup user in database      │
│ Password: Haris@102     │     │ Verify bcrypt password       │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   JWT Token Created                          │
│           Contains: id, email, name, role                    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                  Redirect to Dashboard                       │
└──────────────────────────────────────────────────────────────┘
```

---

## Hardcoded Super Admin

> **This is the bypass for testing/development.**

| Field | Value |
|-------|-------|
| Email | `haris.edu14@gmail.com` |
| Password | `Haris@102` |
| Role | `admin` |
| ID | `super-admin-haris` |

**Location:** `src/lib/auth.ts` lines 22-34

```typescript
if (email === "haris.edu14@gmail.com") {
    if (password === "Haris@102") {
        return {
            id: "super-admin-haris",
            email: email,
            name: "Super Admin",
            role: "admin",
        };
    }
}
```

**Note:** This user is NOT in the database. The check happens before database lookup.

---

## Seed Data Users

When you run `npx tsx src/db/seed.ts`, the following users are created:

| Name | Email | Role | Password |
|------|-------|------|----------|
| Haris | `haris@acme.com` | admin | `Test123!` |
| Sarah Chen | `sarah.chen@acme.com` | admin | `Test123!` |
| Priya Sharma | `priya.sharma@acme.com` | manager | `Test123!` |
| Marcus Johnson | `marcus.johnson@acme.com` | manager | `Test123!` |
| Robert Taylor | `robert.taylor@acme.com` | manager | `Test123!` |
| Alice Walker | `alice.walker@acme.com` | member | `Test123!` |
| David Kim | `david.kim@acme.com` | member | `Test123!` |
| Emma Rodriguez | `emma.rodriguez@acme.com` | member | `Test123!` |
| Lisa Nguyen | `lisa.nguyen@acme.com` | member | `Test123!` |
| James Wilson | `james.wilson@acme.com` | member | `Test123!` |

---

## Domain Restrictions

Regular users (non-super-admin) cannot log in with public email domains:

- gmail.com, yahoo.com, hotmail.com, outlook.com, icloud.com, aol.com

**Location:** `src/lib/auth.ts` lines 38-43

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/auth.ts` | NextAuth config with Credentials provider |
| `src/app/login/page.tsx` | Login UI |
| `src/db/seed.ts` | Creates test users with `Test123!` password |
| `src/scripts/set-password.ts` | CLI to reset user password |
| `src/scripts/create-tenant.ts` | CLI to create new organization + admin |

---

## Invite Flow (Alternative)

New users can also join via invite:

1. Admin invites user → `inviteToken` set in DB
2. User clicks invite link → `/invite?token=xxx`
3. User sets password → `acceptInviteAction()` hashes password
4. User can now log in normally

**Location:** `src/app/actions/auth.ts`

---

## Session Structure

After login, the session contains:

```typescript
{
  user: {
    id: string,       // UUID or "super-admin-haris"
    email: string,
    name: string,
    role: "admin" | "manager" | "member"
  }
}
```
