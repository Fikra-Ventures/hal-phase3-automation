# Make.com Integration

This directory contains Make.com blueprints for HAL Phase 3 automation.

## Blueprint Structure

- `hal-phase3-sample.json`: Sample automation blueprint with webhook and Slack integration
- `hal-error-monitoring.json`: Error monitoring and alerting blueprint

## Deployment

Blueprints are automatically deployed to Make.com when:
1. Changes are pushed to the main branch
2. Files under `make/blueprints/*.json` are modified

The deployment uses:
- `MAKE_API_TOKEN`: API token for Make.com
- `MAKE_TEAM_ID`: Team ID for Make.com

## API Reference

Blueprints are deployed via the Make.com API:
- Endpoint: `https://api.make.com/v2/blueprints/import`
- Method: POST
- Headers: Authorization, X-Team-Id, Content-Type