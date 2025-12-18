# Integrations & Data Portability

> **Philosophy**: wrkspace is a lightweight orchestration layer. We streamline processes, push data to specialized tools, and make it effortless to leave.

---

## Core Principle: Data Freedom

| Principle | What It Means |
|-----------|---------------|
| **No lock-in** | Full data export anytime, any format |
| **Push, don't hoard** | Data flows to where users need it |
| **Basics only** | We do simple well, specialists do complex |
| **Easy exit** | Users can migrate away in minutes |

---

## Data Flow Architecture

```
                    ┌─────────────────────────────────┐
                    │           wrkspace              │
                    │   (Orchestration Layer)         │
                    │                                 │
                    │  ┌─────┐ ┌─────┐ ┌─────┐       │
                    │  │Leave│ │Tasks│ │People│ ...  │
                    │  └──┬──┘ └──┬──┘ └──┬──┘       │
                    └─────┼──────┼──────┼───────────┘
                          │      │      │
           ┌──────────────┼──────┼──────┼──────────────┐
           │              │      │      │              │
           ▼              ▼      ▼      ▼              ▼
       ┌───────┐    ┌─────────┐ ┌────┐ ┌─────┐   ┌─────────┐
       │Google │    │ Notion  │ │CSV │ │Slack│   │ Gusto   │
       │Calendar│   │ Asana   │ │JSON│ │Teams│   │ ADP     │
       └───────┘    │ Jira    │ │XML │ └─────┘   │ Rippling│
                    └─────────┘ └────┘           └─────────┘
```

---

## What We Do vs Push Elsewhere

| Module | We Handle | We Push To |
|--------|-----------|------------|
| **Leave** | Request, approve, balance | Calendar (Google/Outlook), iCal |
| **Tasks** | Create, assign, status | Notion, Asana, Jira, Linear |
| **Expenses** | Submit, approve, totals | QuickBooks, Xero, CSV |
| **Payroll** | View, calculate basics | Gusto, ADP, Deel, CSV |
| **People** | Directory, roles, org chart | BambooHR, CSV, JSON |
| **Notifications** | Generate, display | Slack, Teams, Email |
| **Documents** | Store, share | Google Drive, Dropbox |

---

## Export Formats (Day 1 Priority)

Every module supports one-click export:

| Data | Formats | Use Case |
|------|---------|----------|
| Employees | CSV, JSON | Import into any HRIS |
| Leave history | CSV, iCal | Spreadsheet, calendar import |
| Tasks | CSV, JSON, Notion | Migrate to any task tool |
| Expenses | CSV, QBO | QuickBooks, accounting software |
| Payroll runs | CSV, PDF | Accountant, payroll provider |
| Full org dump | ZIP (all JSON) | Complete migration |

### The "Goodbye Button"
```
Settings → Export → Download Everything
→ ZIP file with all org data in JSON/CSV
→ Ready to import into any other platform
```

---

## Live Sync Integrations

### 1. Calendar Sync (Google/Outlook)
**What flows**: Leave dates, holidays, team availability

| Direction | Data |
|-----------|------|
| → Push | Approved leave → User's calendar event |
| ← Pull | User's calendar → Conflict detection |

**Cost**: Free (Google Calendar API)

---

### 2. Slack/Teams Notifications
**What flows**: All notifications user would see in-app

| Event | Message |
|-------|---------|
| Leave requested | "🌴 John requested Dec 20-22 off" |
| Task assigned | "✅ 'Review budget' assigned to Sarah" |
| Expense approved | "💰 $150 expense approved" |

**Cost**: Free (incoming webhooks)

---

### 3. Notion/Asana/Jira (Tasks)
**What flows**: Tasks created in wrkspace

| Push | Format |
|------|--------|
| Task title | Page/Issue title |
| Assignee | Notion person / Asana user |
| Due date | Date property |
| Status | Select/Status field |

**User controls**: "Auto-sync tasks to Notion" toggle

**Cost**: Free (all have free API tiers)

---

### 4. Payroll Providers
**What flows**: Monthly payroll data

| Approach | How |
|----------|-----|
| **Export** | CSV in Gusto/ADP format → Upload there |
| **Direct** | OAuth connect → Auto-push payroll runs |

**Phase 1**: Export CSV (works with everyone)
**Phase 2**: Gusto direct integration

**Cost**: Free (Gusto Partner API is free)

---

## Integration Settings (Per Org)

```
Settings → Integrations

┌──────────────────────────────────────────┐
│ 🔗 Connected Services                    │
├──────────────────────────────────────────┤
│ ☑️ Slack        #general         [Edit]  │
│ ☑️ Google Cal   Sync leaves      [Edit]  │
│ ☐ Notion       Not connected    [Connect]│
│ ☐ Gusto        Not connected    [Connect]│
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ 📤 Export Data                           │
├──────────────────────────────────────────┤
│ [Export Employees]  CSV | JSON           │
│ [Export Leaves]     CSV | iCal           │
│ [Export Tasks]      CSV | Notion JSON    │
│ [Export Everything] Full ZIP             │
└──────────────────────────────────────────┘
```

---

## Why This Matters

### For Users
- "I can try wrkspace risk-free"
- "My data is always mine"
- "I can switch tools anytime"

### For Us
- Low support burden (basics only)
- Partnership opportunities (we send them users)
- Trust = retention (paradoxically)

### The Counter-Intuitive Truth
> Making it easy to leave makes people stay.

---

## Implementation Priority

### Phase 1: Exports (Week 1)
- [x] CSV export for all modules
- [ ] JSON export for all modules  
- [ ] Full org data dump (ZIP)
- [ ] iCal export for leaves

### Phase 2: Push Integrations (Week 2-3)
- [ ] Slack per-org webhooks
- [ ] Google Calendar sync
- [ ] Notion task push

### Phase 3: Direct Integrations (Month 2)
- [ ] Gusto payroll sync
- [ ] QuickBooks expense sync
- [ ] BambooHR people sync

---

## API Requirements Summary

| Service | Auth | Cost | Complexity |
|---------|------|------|------------|
| Slack | OAuth + Webhook | Free | Low |
| Google Calendar | OAuth 2.0 | Free | Medium |
| Notion | OAuth 2.0 | Free | Medium |
| Gusto | OAuth 2.0 | Free | Medium |
| QuickBooks | OAuth 2.0 | Free tier | Medium |

**Total Phase 1-2 cost: $0**
