# wrkspace V3 Implementation Plan

> **Created**: December 16, 2025  
> **Source**: Product Review Panel + UI/UX Audit + Strategic Analysis  
> **Scope**: Complete implementation roadmap based on ALL feedback

---

## Strategic Foundation

### What wrkspace V3 IS

> "wrkspace is the place where everything about your team comes together — who's working, who's off, what needs approval, what's blocked, and what needs attention today. It doesn't replace Slack, payroll providers, or calendars. It connects them, adds context, and makes sure nothing falls through the cracks."

### What wrkspace V3 is NOT

- ❌ A system of record (we are a **system of coordination**)
- ❌ A Rippling competitor (we sit **above** payroll providers)
- ❌ A compliance enforcer (we **surface risk**, not enforce law)
- ❌ A Slack/Calendar replacement (we **integrate and reflect**)
- ❌ A policy modeling engine (we provide **sane defaults**)

---

## Implementation Phases

### Phase 0: Strategic Cleanup & Demotions
*Subtraction before addition*

### Phase 1: Integration Layer
*Meet users where they are*

### Phase 2: Proactive Intelligence
*Make the app feel alive*

### Phase 3: Preset-First Configuration
*Hide complexity behind intent*

### Phase 4: UX Polish & Accessibility
*Finish what was started*

### Phase 5: Feature Demotions & Removals
*Stop competing upmarket*

---

# Phase 0: Strategic Cleanup & Demotions

> **Goal**: Remove features from the product's center of gravity before adding anything new.

## 0.1 Payroll Reframing

**Current problem**: Payroll feels like a "final action" with liability implications.

**Strategic shift**: Reframe from "run payroll" to "prepare/review/handoff payroll"

### Tasks

- [ ] **Rename payroll section**
  - Change "Payroll" to "Payroll Prep" or "Compensation Review"
  - Update sidebar label, page headers, and hub tabs
  - File: `src/app/(dashboard)/operations/layout.tsx`

- [ ] **Reframe payroll run actions**
  - Rename "Run Payroll" → "Prepare Payroll"
  - Rename "Finalize" → "Mark as Reviewed" or "Export & Complete"
  - Add explicit "This does not process payments" disclaimer
  - Files: `src/app/(dashboard)/operations/payroll/*`

- [ ] **Add payroll export functionality**
  - CSV export for payslips (for upload to external providers)
  - Summary PDF for records
  - File: `src/app/actions/payroll.ts`

- [ ] **Remove tax calculation expectations**
  - Ensure no UI implies tax calculation
  - Add help text: "For tax calculations, export to your payroll provider"
  - Add links to popular providers (Gusto, Deel, etc.)

- [ ] **Add consequence preview**
  - Before generating payslips: "This will create payslips for X employees"
  - Before marking complete: "This will lock this run and notify employees"

## 0.2 Configuration Hiding

**Current problem**: 11 settings sections intimidate users.

### Tasks

- [ ] **Create "Quick Setup" vs "Advanced Settings" split**
  - Quick Setup: Organization name, holidays, basic leave
  - Advanced: Everything else behind "Show Advanced" toggle
  - File: `src/app/(dashboard)/settings/page.tsx`

- [ ] **Hide empty/unused sections**
  - Don't show Risk Register link if empty
  - Don't show Analytics until data exists
  - Progressive disclosure based on usage

- [ ] **Add "Recommended" badges**
  - Mark sensible defaults as "Recommended"
  - Show which settings most teams skip

## 0.3 Dashboard Decluttering (Already Partially Done)

- [x] Charts moved to ExpandableSection ✓
- [ ] **Remove redundant KPIs**
  - Audit each widget: does it demand action?
  - Remove "Total X" stats that don't lead anywhere
  - Keep only actionable items

- [ ] **Consolidate competing widgets**
  - Merge overlapping information
  - One "Needs Attention" widget instead of multiple
  - File: `src/app/(dashboard)/page.tsx`

---

# Phase 1: Integration Layer

> **Goal**: Slack, calendar, and email aren't "integrations" — they're interfaces.
> This is the single most important phase for daily relevance.

## 1.1 Slack Integration

### 1.1.1 Webhook Notifications (MVP)

- [ ] **Create Slack webhook configuration**
  - Settings page for Slack webhook URL
  - Test connection button
  - File: `src/app/(dashboard)/settings/integrations/page.tsx`

- [ ] **Approval notifications to Slack**
  - When leave/expense is submitted → notify approver
  - When approved/rejected → notify requester
  - Include quick action buttons (Approve/Reject) via Slack Block Kit
  - File: `src/lib/integrations/slack.ts` (new)

- [ ] **Daily digest to Slack channel**
  - Morning summary: pending approvals, who's out, upcoming deadlines
  - Configurable channel and time
  - File: `src/app/api/cron/daily-digest.ts` (new)

### 1.1.2 Slack App (Future)

- [ ] **Slack App manifest**
  - OAuth flow for workspace connection
  - Slash commands: `/leave`, `/approve`, `/whosout`

- [ ] **Interactive approvals**
  - Approve/reject directly from Slack
  - No need to open wrkspace

## 1.2 Calendar Integration

### 1.2.1 Google Calendar

- [ ] **OAuth integration setup**
  - Google Cloud Console configuration
  - OAuth flow in settings
  - File: `src/lib/integrations/google-calendar.ts` (new)

- [ ] **Auto-block calendar for approved leaves**
  - When leave approved → create "Out of Office" event
  - When leave cancelled → remove event
  - All-day event with proper free/busy status

- [ ] **Sync holidays to team calendars**
  - Push company holidays to shared calendar
  - Optional per-user sync

### 1.2.2 Outlook/Microsoft 365

- [ ] **Microsoft Graph API integration**
  - OAuth flow for M365
  - Same functionality as Google

## 1.3 Email Notifications

### 1.3.1 Transactional Emails

- [ ] **Email templates**
  - Approval request submitted
  - Approval decision made
  - Task assigned/due
  - Onboarding step reminder
  - File: `src/lib/email/templates/*` (new)

- [ ] **Email sending infrastructure**
  - Integration with Resend/SendGrid/Postmark
  - Environment variable configuration
  - File: `src/lib/email/send.ts` (new)

### 1.3.2 Daily Digest Email

- [ ] **Personal daily digest**
  - "You have 3 pending approvals"
  - "2 tasks due today"
  - "Sarah is on leave tomorrow"
  - Sent at 8am user's timezone
  - Unsubscribe option

- [ ] **Manager weekly summary**
  - Team capacity this week
  - Overdue items
  - Pending > 3 days warnings

---

# Phase 2: Proactive Intelligence

> **Goal**: Make wrkspace feel like it's "watching your back"
> Surface risks, warn before mistakes, explain consequences

## 2.1 Consequence Previews

### 2.1.1 Leave Balance Impact

- [ ] **Show balance impact before submission**
  - "This will reduce your casual leave from 5 to 3 days"
  - "After this request, you'll have 0 sick days remaining"
  - File: `src/components/leaves/leave-form.tsx`

- [ ] **Conflict warnings**
  - "2 other people in Engineering are off these dates"
  - "This overlaps with the Q4 deadline"
  - Use existing `checkLeaveConflicts()` function
  - Make it more prominent in UI

### 2.1.2 Policy Change Previews

- [ ] **"This affects X people" warnings**
  - Before saving leave policy: "This will affect 23 employees"
  - Before changing department: "12 people will be reassigned"
  - File: `src/components/settings/leave-policy-form.tsx`

### 2.1.3 Payroll Previews

- [ ] **Pre-generation summary**
  - "This will generate payslips for 34 employees"
  - "Total gross: $XXX,XXX"
  - "3 employees have incomplete salary data"

## 2.2 Stale Item Surfacing

### 2.2.1 Pending Approval Escalation

- [x] **Age indicators on approvals** (already existed in `approvals-list.tsx`)
  - Yellow badge: pending > 2 days
  - Red badge: pending > 5 days

- [x] **Dashboard widget for stale items** (created and integrated)
  - Created `src/components/dashboard/stale-items-widget.tsx`
  - Integrated into manager and HR dashboards
  - "3 approvals waiting longer than 3 days" with direct links

### 2.2.2 Blocked Task Alerts

- [ ] **Surface blocked tasks prominently**
  - If a task has a dependency that's not done → show warning
  - "This task is blocked by: [task name]"
  - File: `src/components/tasks/task-card.tsx`

- [ ] **Dependency chain visualization**
  - Simple list of what's blocking what
  - Not a full Gantt chart (that's enterprise creep)

### 2.2.3 Onboarding Progress Reminders

- [ ] **New hire progress banner**
  - "You're 2/5 complete with onboarding"
  - Shown on dashboard for new employees
  - File: `src/components/dashboard/onboarding-progress-widget.tsx` (new)

- [ ] **HR reminder for stalled onboarding**
  - "3 new hires haven't completed onboarding in 2 weeks"

## 2.3 Smart Defaults & Auto-Actions

### 2.3.1 Task Assignment Suggestions

- [ ] **Suggest assignee based on history**
  - "Usually assigned to: Sarah"
  - Not mandatory, just a hint

### 2.3.2 Leave Type Suggestions

- [ ] **Suggest leave type based on duration**
  - 1 day → likely sick
  - 5+ days → likely privilege/vacation
  - Just a pre-selection, user can change

---

# Phase 3: Preset-First Configuration

> **Goal**: Hide complexity behind intent. Let users choose outcomes, not build systems.

## 3.1 Leave Policy Presets

- [ ] **Create preset templates**
  - "Standard Startup" (15 casual, 10 sick, 15 privilege, simple carry-over)
  - "Unlimited PTO" (tracked but no limits)
  - "Enterprise" (accrual-based, complex carry-over)
  - File: `src/lib/presets/leave-policies.ts` (new)

- [ ] **Preset selection UI**
  - Show presets first, then "Customize" button
  - Explain tradeoffs in one sentence each
  - File: `src/app/(dashboard)/settings/leave-policies/page.tsx`

## 3.2 Approval Rule Presets

- [ ] **Create approval presets**
  - "Simple" (manager approves everything)
  - "Standard" (manager approves leaves, HR approves expenses over $500)
  - "Multi-step" (manager → HR for all)
  - File: `src/lib/presets/approval-rules.ts` (new)

- [ ] **Plain-English rule summaries**
  - Show "Manager approves leaves" instead of JSON conditions
  - File: `src/components/settings/approval-rules-summary.tsx` (new)

## 3.3 Organization Setup Wizard

- [ ] **First-time setup flow**
  - Step 1: Company name, logo, timezone
  - Step 2: Choose leave preset
  - Step 3: Choose approval preset
  - Step 4: Invite first employees
  - File: `src/components/setup/org-wizard.tsx` (new)

- [ ] **"Standard Startup" one-click setup**
  - Apply all recommended defaults in one click
  - Skip the wizard entirely if desired

## 3.4 Advanced Mode Toggle

- [ ] **Global "Advanced Mode" preference**
  - When off: hide complex options everywhere
  - When on: show all configuration
  - Persist in user preferences
  - File: `src/lib/hooks/use-advanced-mode.ts` (new)

---

# Phase 4: UX Polish & Accessibility

> **Goal**: Finish the UX improvements identified in the audit

## 4.1 High Priority (from UI Review)

### 4.1.1 Dashboard Quick Actions (Partially Done)

- [x] Quick Leave button ✓
- [x] Quick Expense button ✓
- [ ] **⌘K Command Palette Enhancement**
  - Add quick actions: "Request leave", "Create task", "Search docs"
  - Not just search — actual shortcuts
  - File: `src/components/layout/command-palette.tsx` (new or enhance existing)

### 4.1.2 Form Prominence

- [x] Leave form has header button ✓
- [ ] **Task Quick Add prominence**
  - Add "New Task" button in page header (not just sidebar form)
  - File: `src/app/(dashboard)/tasks/page.tsx`

## 4.2 Medium Priority (from UI Review)

### 4.2.1 Unsaved Changes Warning

- [ ] **Integrate useUnsavedChanges hook**
  - Hook already exists at `src/hooks/use-unsaved-changes.tsx`
  - Apply to all forms with significant input
  - Priority forms: Leave request, Task edit, Settings pages
  - File: Various form components

### 4.2.2 Toast Feedback Consistency

- [ ] **Audit all form submissions**
  - Ensure sonner toast on every submit (success/error)
  - Consistent messaging format
  - Files: All `actions/*.ts` files that mutate data

### 4.2.3 Priority Visual Indicators

- [ ] **Add priority borders to task cards**
  - Utility exists at `src/lib/priority-styles.ts`
  - Apply to task list items
  - Color-coded left border (red=urgent, orange=high, etc.)
  - File: `src/components/tasks/task-card.tsx`

## 4.3 Low Priority (from UI Review)

### 4.3.1 Label Improvements

- [ ] **Rename "1:1 Notes" to "One-on-Ones"**
  - Update sidebar label
  - Update page header
  - Update all references
  - Files: `src/components/ui/sidebar.tsx`, `src/app/(dashboard)/people/layout.tsx`

### 4.3.2 Dark Mode Badge Contrast

- [ ] **Improve badge visibility in dark mode**
  - Change from `bg-green-50` to `bg-green-800/40` 
  - Apply to all status badges
  - File: Create `src/lib/badge-styles.ts` for consistent theming

### 4.3.3 Settings Information Architecture

- [ ] **Consider tabbed settings interface**
  - Alternative to current card grid
  - Tabs: General | People | Finance | Integrations
  - May reduce cognitive load

## 4.4 Accessibility Fixes

### 4.4.1 Aria Labels

- [ ] **Add aria-labels to icon-only buttons**
  - Notification bell
  - Theme toggle
  - Sidebar collapse
  - Search trigger
  - File: Various layout components

### 4.4.2 Focus Management

- [ ] **Verify modal focus trapping**
  - When modal opens, focus moves to modal
  - Tab cycles within modal
  - Escape closes modal
  - Focus returns to trigger on close

### 4.4.3 Screen Reader Announcements

- [ ] **Ensure toasts are announced**
  - Use appropriate aria-live regions
  - Sonner should handle this, verify

---

# Phase 5: Feature Demotions & Removals

> **Goal**: Stop competing upmarket. Remove things that push toward enterprise.

## 5.1 Features to Remove or Hide

### 5.1.1 Risk Register

- [ ] **Remove from navigation by default**
  - Hide from sidebar unless explicitly enabled in modules
  - Current path: `/operations/risks`
  - File: `src/components/ui/sidebar.tsx`, module config

- [ ] **Consider full removal**
  - Teams <100 don't need formal risk tracking
  - If kept, move to "Advanced" section

### 5.1.2 Redundant Reports/Analytics

- [ ] **Merge Analytics and Reports**
  - Currently separate tabs in Operations hub
  - Consolidate into one "Insights" section
  - Remove duplication

### 5.1.3 OKR Depth

- [ ] **Do not expand OKRs**
  - No alignment trees
  - No cascading goals
  - Keep simple goal tracking only
  - Resist feature requests in this direction

### 5.1.4 Advanced Approval Conditions

- [ ] **Hide complex rule builder**
  - Default to preset-based rules
  - Advanced conditions behind "I need more control" toggle
  - File: `src/app/(dashboard)/settings/approvals/page.tsx`

## 5.2 Features to NOT Build (Documented)

> These should never enter the backlog:

| Feature | Reason |
|---------|--------|
| Tax/deduction calculator | Liability — integrate with Gusto/Deel |
| Document e-signatures | Integrate with DocuSign/HelloSign |
| Advanced BI / custom dashboards | Export to CSV, use Looker/Metabase |
| Performance review cycles | Feature creep — use Lattice/15Five |
| Payroll bank integrations | Regulated territory, out of scope |
| Gantt charts | Enterprise brain — use Linear/Asana |
| OKR alignment trees | Adds complexity, rarely used well |
| Chat / messaging | Don't compete with Slack — integrate |

---

# Implementation Checklist (Prioritized)

## Must Do First (Behavioral Gravity)

- [ ] 1.1.1 Slack webhook notifications (approval alerts)
- [ ] 1.3.2 Daily digest email
- [x] 2.2.1 Pending approval age indicators (already existed in approvals-list.tsx)
- [x] 3.1 Leave policy presets (created `src/lib/presets/leave-policies.ts`)
- [x] 4.1.1 ⌘K command palette with quick actions (already existed with Request Leave, Create Task, File Expense, Create Document)

## Should Do Soon (Trust Building)

- [ ] 0.1 Payroll reframing (prep/review/export)
- [ ] 0.2 Configuration hiding (Quick Setup vs Advanced)
- [ ] 1.2.1 Google Calendar integration
- [x] 2.1.1 Leave balance impact preview (created `src/components/leaves/consequence-preview.tsx`)
- [ ] 2.1.2 "This affects X people" warnings

## Good to Have (Polish)

- [ ] 4.2.1 Unsaved changes warning
- [ ] 4.2.2 Toast feedback consistency audit
- [x] 4.2.3 Priority visual indicators on cards (enhanced task-card.tsx with urgent priority)
- [x] 4.3.1 Rename "1:1 Notes" to "One-on-Ones" (updated people/layout.tsx)
- [ ] 4.3.2 Dark mode badge contrast

## Later / As Needed

- [ ] 1.1.2 Full Slack App with OAuth
- [ ] 1.2.2 Outlook/M365 integration
- [ ] 3.3 Full organization setup wizard
- [ ] 4.3.3 Tabbed settings interface

## Never Do

- [ ] ❌ Tax calculations
- [ ] ❌ Payroll bank transfers
- [ ] ❌ E-signature integration (build it ourselves)
- [ ] ❌ Performance review cycles
- [ ] ❌ Gantt charts
- [ ] ❌ OKR alignment trees
- [ ] ❌ Built-in chat

---

# Success Metrics

## Behavioral Gravity (Primary)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Daily active users | 60%+ of team | Analytics |
| Time to first value | < 5 minutes | Onboarding funnel |
| Approval turnaround | < 24 hours avg | Database query |
| Setup completion | > 80% | Wizard funnel |

## Feature Adoption (Secondary)

| Metric | Target |
|--------|--------|
| Slack integration enabled | 50%+ of orgs |
| Calendar sync enabled | 30%+ of orgs |
| Leave requests via wrkspace | > 90% |
| Task completion rate | > 70% |

## Negative Indicators (Watch for)

| Signal | Action |
|--------|--------|
| Feature requests for tax calc | Redirect to integrations |
| "It's too simple" feedback | Probably wrong audience |
| "I still use spreadsheets for X" | Investigate gap |

---

# Appendix: Files Likely to Change

## New Files to Create

```
src/lib/integrations/slack.ts
src/lib/integrations/google-calendar.ts
src/lib/email/send.ts
src/lib/email/templates/
src/lib/presets/leave-policies.ts
src/lib/presets/approval-rules.ts
src/components/setup/org-wizard.tsx
src/components/dashboard/stale-items-widget.tsx
src/components/dashboard/onboarding-progress-widget.tsx
src/components/settings/approval-rules-summary.tsx
src/components/layout/command-palette.tsx
src/app/api/cron/daily-digest.ts
```

## Existing Files to Modify

```
src/app/(dashboard)/page.tsx                    # Dashboard declutter
src/app/(dashboard)/settings/page.tsx           # Quick vs Advanced split
src/app/(dashboard)/settings/leave-policies/    # Presets
src/app/(dashboard)/settings/approvals/         # Presets + hiding
src/app/(dashboard)/operations/layout.tsx       # Payroll rename
src/app/(dashboard)/operations/payroll/         # Payroll reframing
src/components/ui/sidebar.tsx                   # Navigation updates
src/components/leaves/leave-form.tsx            # Balance preview
src/components/approvals/approval-list.tsx      # Age indicators
src/components/tasks/task-card.tsx              # Priority borders
src/hooks/use-unsaved-changes.tsx               # Apply to forms
src/lib/priority-styles.ts                      # Apply to cards
```

---

*Last updated: December 16, 2025*
