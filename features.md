# wrkspace - Features Overview

> **wrkspace** is the operating layer for people and decisions in small companies.  
> It connects team management, time-off, expenses, and approvals in one place.

---

## Core Philosophy

We are a **system of coordination**, not a system of record.

- ✅ Simple, fast, opinionated
- ✅ Reduces tool sprawl
- ✅ Covers core people operations
- ❌ Not Rippling (we sit above payroll providers)
- ❌ Not Notion (we don't compete on docs)
- ❌ Not enterprise HR software

---

## The Spine (What Makes wrkspace Valuable)

### 1. Time Off / Leave Management

**What it does:**
- Employees request leave (casual, sick, privilege)
- Managers/HR approve in unified inbox
- Balance tracking with carry-over policies
- Conflict detection (team availability)

**Key Flow:**
```
Employee → LeaveForm → Consequence Preview (balance impact + conflicts)
  → Submit → Notification to Approver
  → Approver reviews in Inbox → Approve/Reject
  → Balance updated → Calendar updated
```

**Configuration:** Preset-first leave policies (Standard Startup, Unlimited PTO, etc.)

---

### 2. Approvals Inbox

**What it does:**
- Unified inbox for everything requiring approval
- Leaves, expenses, requests
- Bulk actions for efficiency
- Stale item alerts (> 3 days pending)

**Flow:**
```
Any approval request → Notification → Inbox
  → Approver sees list with age indicators
  → Quick approve/reject with optional comment
  → Requester notified
```

---

### 3. People Directory + Org Structure

**What it does:**
- Team directory with profiles
- Department hierarchy
- Org chart visualization
- Role-based access

**Includes:**
- Contact info, designation, department
- Manager relationships
- Working hours & availability status

---

### 4. Onboarding / Offboarding

**What it does:**
- Templated checklists for new hires
- Progress tracking (X/Y steps complete)
- Exit checklists for departing employees
- Step types: tasks, documents, checklists

**Onboarding Flow:**
```
HR creates template → Assigns to new hire
  → New hire sees progress widget on dashboard
  → Completes steps → HR tracks completion
```

---

### 5. Expenses

**What it does:**
- Submit expense claims with receipts
- Category-based approval routing
- Receipt upload (Cloudinary)
- Approval and reimbursement tracking

**Flow:**
```
Employee uploads receipt → Selects category → Enters amount
  → Submits → Goes to approvals inbox
  → Approved → Finance marks reimbursed
```

---

### 6. Announcements

**What it does:**
- Company-wide announcements
- Priority levels (normal, important, urgent)
- Pinning for persistent visibility
- Read tracking

---

### 7. Calendar

**What it does:**
- Unified view of:
  - Approved leaves (who's out)
  - Company holidays
  - Room bookings
  - Birthdays/anniversaries
- Week/month views

---

### 8. Tasks

**What it does:**
- Personal and assigned task tracking
- Priority levels with visual indicators
- Due dates and project grouping
- Status: todo → in-progress → done

**Not:** A full project management tool. For complex projects, use Linear/Asana.

---

## Supporting Features

### Payroll Prep

**What it does:**
- Prepare payslip data for export
- Review employee salary information
- Export CSV for upload to Gusto/Deel/etc.

**What it's NOT:** Actual payroll processing. No tax calculations. No bank transfers.

---

### Documents

**What it does:**
- Company knowledge storage
- Markdown documents with versioning
- Templates for common documents
- Tagged and searchable

**Framing:** "Company memory" — not a wiki or Notion replacement.

---

### Projects

**What it does:**
- Group related tasks
- Basic project status tracking
- Owner assignment

---

### Assets

**What it does:**
- Track hardware/software assigned to employees
- Renewal date reminders for licenses
- Offboarding asset handoff

---

### Bookings (Meeting Rooms)

**What it does:**
- Simple room reservation
- Calendar-integrated
- Capacity and amenities info

---

### Internal Requests

**What it does:**
- IT support tickets
- Equipment requests
- Access requests

---

## Configuration

### Quick Setup (3 essentials)
1. Organization (name, timezone)
2. Holidays
3. Leave Policies (presets available)

### Advanced (behind toggle)
- Departments
- Offboarding templates
- Expense categories
- Approval rules
- Integrations

---

## Roles & Access

| Role | Access |
|------|--------|
| **Admin** | Full access, all settings |
| **HR** | People hub, approvals, operations |
| **Manager** | Team view, their team's approvals |
| **Employee** | Personal data, requests |

---

## What We Don't Do (Intentionally)

| Feature | Why Not |
|---------|---------|
| Tax calculations | Liability — use Gusto/Deel |
| Bank transfers | Regulated — use payroll provider |
| Performance reviews | Feature creep — use Lattice/15Five |
| OKR alignment | Adds complexity, rarely used well |
| Gantt charts | Enterprise — use Linear/Asana |
| Built-in chat | Don't compete with Slack |
| Risk register | Compliance smell for our ICP |
| Pulse surveys | Needs follow-up infrastructure first |

---

## Technical Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **File Storage:** Cloudinary
- **Multi-tenant:** Organization-scoped data

---

*wrkspace: Where everything about your team comes together.*
