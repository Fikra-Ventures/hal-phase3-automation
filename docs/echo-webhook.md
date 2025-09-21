# Echo Webhook n8n Flow

A minimal n8n workflow that provides an HTTP webhook endpoint for smoke testing. This workflow receives JSON payloads and returns them with additional metadata.

## Overview

The Echo Webhook flow consists of two nodes:
1. **Webhook Trigger**: Receives HTTP POST requests
2. **Response Node**: Returns the payload with metadata

## Setup

### Prerequisites
- n8n instance running
- Environment variable `N8N_WEBHOOK_SECRET` configured

### Environment Variables
- `N8N_WEBHOOK_SECRET`: Secret token for webhook authentication (required)

### Installation
1. Import the workflow from `templates/echo-webhook.json`
2. Set the `N8N_WEBHOOK_SECRET` environment variable
3. Activate the workflow

## Usage

### Sending Requests

Send a POST request to the webhook endpoint with JSON payload:

```bash
curl -X POST \
  https://your-n8n-instance.com/webhook/echo \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET_VALUE" \
  -d '{
    "message": "Hello, World!",
    "timestamp": "2024-09-21T18:33:00Z",
    "data": {
      "key": "value",
      "number": 42
    }
  }'
```

### Expected Response

The webhook returns the original payload wrapped with metadata:

```json
{
  "ok": true,
  "receivedAt": "2024-09-21T18:33:15.123Z",
  "payload": {
    "message": "Hello, World!",
    "timestamp": "2024-09-21T18:33:00Z",
    "data": {
      "key": "value",
      "number": 42
    }
  }
}
```

### Response Fields

- `ok`: Always `true` for successful requests
- `receivedAt`: ISO timestamp when the request was processed
- `payload`: The original JSON payload sent in the request

## Troubleshooting

### Common Issues

#### 401 Unauthorized
**Problem**: Request returns 401 status code
**Solution**: 
- Verify the `x-webhook-secret` header is included
- Check that the secret value matches the `N8N_WEBHOOK_SECRET` environment variable
- Ensure the environment variable is properly set in your n8n instance

#### 404 Not Found
**Problem**: Webhook endpoint not found
**Solution**:
- Verify the workflow is active
- Check the webhook path is correctly set to `/echo`
- Ensure the n8n instance is running and accessible

#### 500 Internal Server Error
**Problem**: Server error when processing request
**Solution**:
- Check n8n logs for detailed error messages
- Verify the `N8N_WEBHOOK_SECRET` environment variable is set
- Ensure the JSON payload is valid

#### No Response Received
**Problem**: Request hangs or times out
**Solution**:
- Check network connectivity to the n8n instance
- Verify the webhook URL is correct
- Ensure the workflow is properly connected (Webhook → Response)

### Testing the Webhook

#### Minimal Test
```bash
curl -X POST \
  https://your-n8n-instance.com/webhook/echo \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET_VALUE" \
  -d '{"test": true}'
```

#### Test with curl verbose output
```bash
curl -v -X POST \
  https://your-n8n-instance.com/webhook/echo \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: YOUR_SECRET_VALUE" \
  -d '{"debug": "verbose test"}'
```

### Validation

To verify the webhook is working correctly:

1. **Check Status Code**: Should return `200 OK`
2. **Verify Response Structure**: Must include `ok`, `receivedAt`, and `payload` fields
3. **Validate Timestamp**: `receivedAt` should be a valid ISO timestamp
4. **Confirm Payload Echo**: `payload` should match your input exactly

### Security Notes

- Always use HTTPS in production
- Keep the `N8N_WEBHOOK_SECRET` secure and rotate regularly
- Consider implementing rate limiting for production use
- Monitor webhook access logs for suspicious activity

## Examples

See `templates/examples/echo-webhook.sample.json` for complete request/response examples.