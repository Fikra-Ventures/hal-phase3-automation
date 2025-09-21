# Make.com Auto-Import Pipeline

This directory contains Make.com blueprints that are automatically deployed when changes are pushed to the repository.

## How it works

1. **Automatic Deployment**: When you push changes to files in `make/blueprints/**/*.json`, the GitHub workflow automatically deploys them to Make.com.

2. **Manual Deployment**: You can manually trigger the deployment workflow from the GitHub Actions tab.

3. **Blueprint Format**: Blueprints should follow the standard Make.com format with a `scenario` object containing modules and configuration.

## Example Blueprint

```json
{
  "version": 1,
  "scenario": {
    "name": "HAL Phase 3 - Task Automation",
    "description": "Automated task execution and monitoring for HAL Phase 3 project",
    "modules": [
      {
        "module": "http",
        "version": 1,
        "parameters": {
          "url": "https://api.github.com/repos/fikra-hal/hal-phase3-automation/actions/workflows",
          "method": "GET"
        }
      }
    ]
  }
}
```

## Required Secrets

The following GitHub secrets must be configured for the auto-import to work:

- `MAKE_API_TOKEN`: Your Make.com API token
- `MAKE_TEAM_ID`: Your Make.com team ID

## Deployment Process

1. The workflow is triggered on push to `main` branch when blueprint files change
2. Changed files are detected and filtered for `make/blueprints/*.json` files only
3. Each blueprint file is validated and uploaded to Make.com via their API
4. Scenario IDs are logged for reference
5. Any errors during upload will fail the build

## Adding New Blueprints

1. Create a new `.json` file in the `make/blueprints/` directory
2. Follow the Make.com blueprint format
3. Commit and push to the `main` branch
4. The workflow will automatically deploy your blueprint

## Troubleshooting

- Check the GitHub Actions logs if deployment fails
- Ensure your blueprint JSON is valid
- Verify that the required secrets are configured
- Blueprint files must be in the exact path `make/blueprints/*.json`