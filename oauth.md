# OAuth Setup Guide

Step-by-step instructions to get credentials for wrkspace integrations.

> **Note**: This is for **sync only** (calendar, notifications), NOT sign-in with Google.

---

## 1. Slack Integration

### Create Slack App
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From scratch"**
3. Name: `wrkspace` (or your brand)
4. Pick a workspace for development

### Configure OAuth
1. In your app settings → **OAuth & Permissions**
2. Add Redirect URL:
   ```
   https://your-domain.com/api/integrations/slack/callback
   ```
   (Use `http://localhost:3000/api/integrations/slack/callback` for dev)

3. Under **Scopes** → **Bot Token Scopes**, add:
   - `incoming-webhook` (post messages to channels)
   - `chat:write` (post messages)

### Get Credentials
1. Go to **Basic Information**
2. Copy:
   - **Client ID**
   - **Client Secret**

### Add to `.env`
```bash
SLACK_CLIENT_ID=your-client-id
SLACK_CLIENT_SECRET=your-client-secret
```

---

## 2. Google Calendar Sync

### Create Google Cloud Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project: `wrkspace` (or any name)
3. Select the project

### Enable Calendar API
1. Go to **APIs & Services** → **Library**
2. Search **"Google Calendar API"**
3. Click **Enable**

### Configure OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (allows any Google user)
3. Fill in:
   - App name: `wrkspace`
   - User support email: your email
   - Developer contact: your email
4. Click **Save and Continue**
5. **Scopes**: Click "Add or Remove Scopes"
   - Add `https://www.googleapis.com/auth/calendar.events`
   - Add `https://www.googleapis.com/auth/calendar.readonly`
6. **Publish** the app when ready for production

### Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Authorized redirect URIs:
   ```
   http://localhost:3000/api/integrations/google/callback
   https://your-domain.com/api/integrations/google/callback
   ```
5. Click **Create** and copy **Client ID** + **Client Secret**

### Add to `.env`
```bash
GOOGLE_CALENDAR_CLIENT_ID=your-client-id
GOOGLE_CALENDAR_CLIENT_SECRET=your-client-secret
```

---

## 3. Notion Integration

### Create Notion Integration
1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **"New integration"**
3. Name: `wrkspace`
4. Type: **Public** (for OAuth flow)

### Configure OAuth
1. Redirect URI:
   ```
   http://localhost:3000/api/integrations/notion/callback
   ```
2. Request capabilities: Read, Insert, Update content

### Get Credentials
Copy **Client ID** and **Client Secret**

### Add to `.env`
```bash
NOTION_CLIENT_ID=your-client-id
NOTION_CLIENT_SECRET=your-client-secret
```

---

## Summary: `.env` Variables

```bash
# Slack
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=

# Google Calendar (sync only, NOT login)
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=

# Notion
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
```

---

## Quick Reference

| Service | Console | Time |
|---------|---------|------|
| Slack | [api.slack.com/apps](https://api.slack.com/apps) | 5 min |
| Google | [console.cloud.google.com](https://console.cloud.google.com) | 10 min |
| Notion | [notion.so/my-integrations](https://www.notion.so/my-integrations) | 5 min |
