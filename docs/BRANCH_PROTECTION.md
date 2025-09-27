# 🔒 Branch Protection

This repository implements automated branch protection for the `main` branch to ensure code quality and maintain a secure development workflow.

## Protection Rules

The following protection rules are automatically applied to the `main` branch:

### ✅ Required Status Checks
- **Strict mode**: `true` - Branches must be up to date before merging
- **Required contexts**: `[]` - No specific status checks required (configurable)

### 👥 Pull Request Reviews  
- **Required approving reviews**: `1` - At least one approval required
- **Dismiss stale reviews**: `true` - Reviews dismissed when new commits are pushed
- **Require code owner reviews**: `false` - Code owner approval not mandatory

### 🔐 Administrative Enforcement
- **Enforce for administrators**: `true` - Rules apply to all users, including admins

### 🚫 Restrictions
- **Push restrictions**: `null` - No user/team restrictions on push access
- **Force pushes**: `false` - Force pushes to main branch are disabled
- **Deletions**: `false` - Branch deletion is disabled

## Workflow Automation

Branch protection rules are managed through the **🔒 Branch Protection** GitHub Actions workflow located at `.github/workflows/branch-protection.yml`.

### Manual Execution

You can manually trigger the workflow from the Actions tab:

1. Navigate to [Actions](../../actions/workflows/branch-protection.yml)
2. Click "Run workflow"
3. Choose run mode:
   - **Dry run**: `true` - Preview changes without applying them
   - **Dry run**: `false` - Apply protection rules to the main branch

### Workflow Features

- **🧪 Dry Run Mode**: Test configuration without making changes
- **📋 Detailed Logging**: Complete audit trail of protection rule application
- **✅ Validation**: Automatic verification of successful rule application
- **🔧 JSON Configuration**: Human-readable protection rule definitions

## Configuration Details

The branch protection configuration is defined as:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": []
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

## Benefits

- **🛡️ Code Quality**: Ensures all changes go through review process
- **🔍 Visibility**: Maintains clear audit trail of all main branch changes
- **⚡ Automation**: Reduces manual overhead in protection rule management
- **🎯 Consistency**: Standardized protection across all repositories
- **🔄 Flexibility**: Easy configuration updates through workflow parameters

## Troubleshooting

### Common Issues

**Q: Protection rules failed to apply**
- Verify the `BRANCH_PROTECT_TOKEN` secret has sufficient permissions
- Check that the token has `repo` scope for the organization
- Ensure the workflow has access to organization secrets

**Q: Cannot push to main branch**
- Protection rules are working correctly - use pull requests instead
- Create a feature branch and submit a PR for review
- Ensure PR has required approvals before merging

**Q: Status checks preventing merge**
- Verify all required CI/CD workflows are passing
- Update branch to latest main if strict mode is enabled
- Check workflow configuration for required status contexts

### Support

For additional support with branch protection:
- Review workflow logs in the [Actions](../../actions/workflows/branch-protection.yml) tab
- Check organization-level branch protection policies
- Contact repository administrators for access issues

---

> **Note**: This protection configuration balances security with development velocity. Modifications should be carefully considered and tested in dry-run mode first.

**Last Updated**: Auto-managed by Branch Protection Workflow  
**Workflow**: `.github/workflows/branch-protection.yml`  
**Branch**: `main`
