# T2 Ticket Triage Workflow

## Purpose

The T2 Ticket Triage workflow automates the intake and routing of support tickets based on priority levels. It provides intelligent routing for urgent (P0/P1) vs standard (P2/P3) tickets with appropriate Slack notifications and Airtable record creation.

## Required Environment Variables

The following environment variables must be configured in your n8n instance:

```bash
# Slack Integration
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_ID_SUPPORT=C1234567890

# Airtable Integration  
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TABLE_TICKETS=tblXXXXXXXXXXXXXX

# Webhook Security
N8N_WEBHOOK_SECRET=your-webhook-secret
```

## Credentials Setup

### Slack OAuth2 Credentials
- **Name:** `slack-bot-token`
- **Type:** Slack OAuth2 API
- **Bot Token:** Use `SLACK_BOT_TOKEN` environment variable
- **Required Scopes:** `chat:write`, `channels:read`

### Airtable Token Credentials
- **Name:** `airtable-api-key`
- **Type:** Airtable Token API
- **Personal Access Token:** Use `AIRTABLE_API_KEY` environment variable

## Webhook Endpoint

Once deployed, the workflow will be available at:
```
POST https://your-n8n-instance.com/webhook/t2-triage
```

## Example cURL Request

```bash
curl -X POST https://your-n8n-instance.com/webhook/t2-triage \
  -H "Content-Type: application/json" \
  -d '{
    "id": "TICKET-2024-001",
    "title": "Critical system outage",
    "description": "Production servers are down, customers cannot access the platform",
    "priority": "P0",
    "reporter": "john.doe@company.com",
    "product": "Core Platform"
  }'
```

## Payload Structure

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique ticket identifier |
| `title` | string | Yes | Ticket title/subject |
| `description` | string | Yes | Detailed description of the issue |
| `priority` | string | Yes | Priority level: P0, P1, P2, or P3 |
| `reporter` | string | Yes | Email or name of the person reporting |
| `product` | string | Yes | Product or service affected |

## Field Mapping

### Slack Notifications

**High Priority (P0/P1):**
- 🔴 Urgent indicator with @here mention
- All ticket details included
- Posted to support channel

**Standard Priority (P2/P3):**
- 🟠 Standard indicator, no @here mention
- All ticket details included
- Posted to support channel

### Airtable Fields

| n8n Field | Airtable Column | Example |
|-----------|-----------------|---------|
| `id` | ID | TICKET-2024-001 |
| `title` | Title | Critical system outage |
| `description` | Description | Production servers are down... |
| `priority` | Priority | P0 |
| `reporter` | Reporter | john.doe@company.com |
| `product` | Product | Core Platform |
| - | Status | Open (auto-set) |
| - | Created | Auto-generated timestamp |

## Success Response

```json
{
  "success": true,
  "ticketId": "TICKET-2024-001",
  "ticketUrl": "https://airtable.com/appXXXXXXX/tblXXXXXXX/TICKET-2024-001",
  "priority": "P0",
  "status": "created",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Failure Modes & Troubleshooting

### Common Issues

1. **Webhook not responding (500 error)**
   - Check n8n instance is running
   - Verify webhook URL is correct
   - Ensure workflow is activated

2. **Slack notification fails**
   - Verify `SLACK_BOT_TOKEN` is valid
   - Check bot has permission to post in channel
   - Confirm `SLACK_CHANNEL_ID_SUPPORT` exists

3. **Airtable creation fails**
   - Validate `AIRTABLE_API_KEY` has write permissions
   - Ensure `AIRTABLE_BASE_ID` and `AIRTABLE_TABLE_TICKETS` are correct
   - Check Airtable table structure matches expected fields

4. **Invalid priority routing**
   - Ensure priority field contains exactly "P0", "P1", "P2", or "P3"
   - Check case sensitivity

### Error Handling

The workflow includes basic error handling:
- Invalid JSON payload returns 400 error
- Missing required fields return validation errors
- Service failures are logged in n8n execution history

### Monitoring

- Check n8n execution history for workflow runs
- Monitor Slack channel for successful notifications
- Verify Airtable records are created correctly
- Set up alerts for workflow failures in n8n

### Testing

Use the provided example payload to test the workflow:
1. Deploy and activate the workflow
2. Send POST request to webhook endpoint
3. Verify Slack notification appears
4. Check Airtable record is created
5. Confirm response includes correct ticket URL