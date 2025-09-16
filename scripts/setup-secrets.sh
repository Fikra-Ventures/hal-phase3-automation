#!/bin/bash

# HAL Phase 3 - GitHub Secrets Setup Script
# This script guides setup of required GitHub secrets

echo "🔐 HAL Phase 3 GitHub Secrets Setup"
echo "===================================="

# Required secrets for HAL Phase 3 automation
REQUIRED_SECRETS=(
  "SLACK_WEBHOOK_URL"
  "OPENAI_API_KEY" 
  "AIRTABLE_API_KEY"
  "AIRTABLE_BASE_ID"
  "NOTION_API_KEY"
  "ZAPIER_WEBHOOK_URL"
)

echo "📋 Required GitHub Secrets:"
for secret in "${REQUIRED_SECRETS[@]}"; do
  echo "  - $secret"
done

echo ""
echo "🔧 To set these secrets:"
echo "1. Go to: https://github.com/fikra-hal/hal-phase3-automation/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Add each secret with their respective values:"
echo ""

echo "SLACK_WEBHOOK_URL:"
echo "  Purpose: Automated progress notifications to #hal-phase3-automation"
echo "  Format: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
echo ""

echo "OPENAI_API_KEY:"
echo "  Purpose: LLM-based guardrails and embeddings generation"
echo "  Format: sk-proj-..."
echo ""

echo "AIRTABLE_API_KEY:"
echo "  Purpose: Project tracking integration and task management"
echo "  Format: pat..."
echo ""

echo "AIRTABLE_BASE_ID:"
echo "  Purpose: HAL Phase 3 task tracking base"
echo "  Format: app..."
echo ""

echo "NOTION_API_KEY:"
echo "  Purpose: Documentation and knowledge base integration"
echo "  Format: secret_..."
echo ""

echo "ZAPIER_WEBHOOK_URL:"
echo "  Purpose: Workflow automation triggers"
echo "  Format: https://hooks.zapier.com/hooks/catch/..."

echo ""
echo "✅ Once secrets are configured, the automation will:"
echo "  - Send daily progress reports to Slack"
echo "  - Update Airtable with task completions"
echo "  - Generate embeddings for memory management"
echo "  - Trigger downstream workflows via Zapier"
echo ""
echo "🚨 CRITICAL: All secrets must be set before automation starts"
