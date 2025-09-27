# Branch Protection (Automated)

This repo uses automated branch protection via GitHub Actions.

**Rules on the default branch:**
- 1 required PR approval (stale approvals dismissed on new commits)
- CI status checks required (strict mode; no named contexts)
- Applies to admins
- No force pushes, no branch deletion

**Run manually after merge:**
1. Go to **Actions** → **Configure Branch Protection**
2. Click **Run workflow**