# Test Users

All users use password: `Test123!`

## Admins

| Email | Name | Role |
|-------|------|------|
| `admin@acme.com` | Admin User | admin |
| `ceo@acme.com` | CEO User | admin |

## Managers

| Email | Name | Department |
|-------|------|------------|
| `hr@acme.com` | HR Manager | Human Resources |
| `manager@acme.com` | Team Manager | Engineering |
| `finance@acme.com` | Finance Manager | Finance |

## Employees

| Email | Name | Department |
|-------|------|------------|
| `employee@acme.com` | Employee User | Engineering |
| `dev@acme.com` | Developer User | Engineering |
| `designer@acme.com` | Designer User | Design |
| `sales@acme.com` | Sales Rep | Sales |
| `marketing@acme.com` | Marketing User | Marketing |

---

## Super Admin (Env-Based)

Set in `.env`:
```
SUPER_ADMIN_EMAIL=your-email@example.com
SUPER_ADMIN_PASSWORD_HASH=<bcrypt hash>
```
