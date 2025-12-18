-- Database Performance Indexes
-- Run these SQL commands to add indexes for common query patterns

-- ============ ORGANIZATION SCOPING (Critical) ============
-- These indexes speed up all org-scoped queries

CREATE INDEX IF NOT EXISTS idx_tasks_org_status ON tasks(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_org_assignee ON tasks(organization_id, assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_due ON tasks(organization_id, due_date);

CREATE INDEX IF NOT EXISTS idx_leaves_org_status ON leaves(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_leaves_org_user ON leaves(organization_id, user_id);
CREATE INDEX IF NOT EXISTS idx_leaves_dates ON leaves(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_expenses_org_status ON expenses(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_org_user ON expenses(organization_id, user_id);

CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_org_role ON users(organization_id, role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_author ON documents(organization_id, author_id);

CREATE INDEX IF NOT EXISTS idx_announcements_org ON announcements(organization_id);
CREATE INDEX IF NOT EXISTS idx_announcements_org_pinned ON announcements(organization_id, pinned);

CREATE INDEX IF NOT EXISTS idx_feedback_org ON feedback(organization_id);
CREATE INDEX IF NOT EXISTS idx_feedback_org_to ON feedback(organization_id, to_user_id);

CREATE INDEX IF NOT EXISTS idx_assets_org ON assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_assets_org_status ON assets(organization_id, status);

-- ============ APPROVALS & WORKFLOWS ============
CREATE INDEX IF NOT EXISTS idx_internal_requests_org_status ON internal_requests(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_org ON payroll_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_payslips_run ON payslips(payroll_run_id);

-- ============ TIME-BASED QUERIES ============
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaves_created ON leaves(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_submitted ON expenses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);

-- ============ MEETINGS & 1:1s ============
CREATE INDEX IF NOT EXISTS idx_meetings_org_date ON meetings(organization_id, date);
CREATE INDEX IF NOT EXISTS idx_one_on_ones_org ON one_on_one_notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_one_on_ones_manager ON one_on_one_notes(manager_id);

-- ============ ACTIVITY & AUDIT ============
CREATE INDEX IF NOT EXISTS idx_activity_log_org ON activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ============ PROJECTS & GOALS ============
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_goals_org ON goals(organization_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);

-- Run with: psql -d your_database -f indexes.sql
