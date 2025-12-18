# Pending: Integrations

> Paused on 2024-12-18. Resume when OAuth credentials are ready.

---

## Completed ✅

### Phase 1: Data Exports
- [x] Export actions (CSV/JSON/iCal) for all modules
- [x] ExportDataSection UI in Settings
- [x] Backward compatibility with existing export buttons

---

## Pending ⏸️

### Phase 2: Live Integrations

#### Prerequisites (You do this once)
See `oauth.md` for setup guide.
- [ ] Create Slack app → get `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`
- [ ] Create Google Cloud project → get `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`
- [ ] Create Notion integration → get `NOTION_CLIENT_ID`, `NOTION_CLIENT_SECRET`

#### Implementation (After credentials ready)
- [ ] **Slack per-org webhooks**
  - OAuth callback route
  - Store webhook per org
  - Push notifications to Slack channel

- [ ] **Google Calendar sync**
  - OAuth callback route
  - Push leaves to user's calendar
  - Read calendar for conflict detection

- [ ] **Notion task sync**
  - OAuth callback route
  - Push tasks to Notion database

- [ ] **Integrations settings page**
  - Connect/disconnect buttons
  - Status indicators
  - Event toggles

---

### Phase 3: Direct Integrations (Future)
- [ ] Gusto payroll sync
- [ ] QuickBooks expense sync

---

## Files Created for This Feature
- `integrations.md` - Strategy and philosophy
- `oauth.md` - Credential setup guide
- `src/app/actions/export.ts` - Export actions
- `src/components/settings/export-data-section.tsx` - Export UI

---

## To Resume
1. Follow `oauth.md` to get credentials
2. Add to `.env`
3. Continue with Phase 2 implementation
