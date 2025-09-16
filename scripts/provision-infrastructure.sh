#!/bin/bash

# HAL Phase 3 - Infrastructure Provisioning Script
# Sets up all required services and dependencies

set -e

echo "🏗️  HAL Phase 3 Infrastructure Provisioning"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running in CI/CD environment
if [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "Running in GitHub Actions environment"
    CI_MODE=true
else
    echo "Running in local environment"
    CI_MODE=false
fi

echo ""
echo "📋 Infrastructure Components to Provision:"
echo "  1. OpenAI API Setup & Testing"
echo "  2. Vector Storage Configuration (Pinecone/OpenAI)"
echo "  3. Airtable Integration Setup"
echo "  4. Slack Webhook Configuration"
echo "  5. Performance Monitoring Tools"
echo "  6. Memory Management Services"
echo "  7. Guardrails & Safety Systems"
echo ""

# 1. OpenAI API Setup
echo "🔧 1. Setting up OpenAI API..."
if [ -n "$OPENAI_API_KEY" ]; then
    # Test OpenAI API connection
    curl -s -H "Authorization: Bearer $OPENAI_API_KEY" \
         -H "Content-Type: application/json" \
         -d '{
           "model": "gpt-4",
           "messages": [{"role": "user", "content": "Test"}],
           "max_tokens": 5
         }' \
         https://api.openai.com/v1/chat/completions > /tmp/openai_test.json
    
    if [ $? -eq 0 ]; then
        print_status "OpenAI API connection successful"
    else
        print_error "OpenAI API connection failed"
        exit 1
    fi
else
    print_warning "OPENAI_API_KEY not set - skipping API test"
fi

# 2. Vector Storage Setup
echo ""
echo "🗃️  2. Configuring Vector Storage..."
cat > config/vector-storage.json << EOF
{
  "embeddings": {
    "model": "text-embedding-3-large",
    "dimensions": 3072,
    "batchSize": 100,
    "maxTokens": 8191
  },
  "storage": {
    "type": "openai-vector-store",
    "indexName": "hal-phase3-memory",
    "namespace": "hal-memory-v1",
    "metadataConfig": {
      "indexed": ["task_id", "week", "priority", "owner", "timestamp"],
      "maxMetadataSize": 40960
    }
  },
  "search": {
    "topK": 10,
    "includeMetadata": true,
    "includeValues": false,
    "similarityThreshold": 0.8
  },
  "performance": {
    "timeout": 5000,
    "retries": 3,
    "backoffMultiplier": 2
  }
}
EOF
print_status "Vector storage configuration created"

# 3. Airtable Integration
echo ""
echo "📊 3. Setting up Airtable Integration..."
if [ -n "$AIRTABLE_API_KEY" ] && [ -n "$AIRTABLE_BASE_ID" ]; then
    # Test Airtable connection
    curl -s -H "Authorization: Bearer $AIRTABLE_API_KEY" \
         "https://api.airtable.com/v0/$AIRTABLE_BASE_ID/Tasks?maxRecords=1" > /tmp/airtable_test.json
    
    if [ $? -eq 0 ]; then
        print_status "Airtable API connection successful"
    else
        print_error "Airtable API connection failed"
    fi
else
    print_warning "Airtable credentials not set - skipping connection test"
fi

# 4. Slack Webhook Setup
echo ""
echo "💬 4. Configuring Slack Integration..."
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    # Test Slack webhook
    curl -s -X POST -H 'Content-type: application/json' \
         --data '{"text":"🧪 HAL Phase 3 infrastructure test - automation system online"}' \
         "$SLACK_WEBHOOK_URL" > /tmp/slack_test.json
    
    if [ $? -eq 0 ]; then
        print_status "Slack webhook test successful"
    else
        print_error "Slack webhook test failed"
    fi
else
    print_warning "SLACK_WEBHOOK_URL not set - skipping webhook test"
fi

# 5. Performance Monitoring Setup
echo ""
echo "📈 5. Setting up Performance Monitoring..."
mkdir -p monitoring/dashboards
mkdir -p monitoring/alerts
mkdir -p monitoring/metrics

# Create performance monitoring configuration
cat > monitoring/config.json << EOF
{
  "metrics": {
    "collection": {
      "interval": 30000,
      "retention": "7d"
    },
    "tracking": [
      "task_completion_time",
      "memory_retrieval_latency", 
      "guardrail_processing_time",
      "api_response_time",
      "error_rate",
      "throughput"
    ]
  },
  "alerts": {
    "channels": ["slack", "email"],
    "thresholds": {
      "memory_retrieval_latency": 500,
      "error_rate": 0.05,
      "task_completion_rate": 0.95
    }
  },
  "dashboards": {
    "realtime": {
      "refreshInterval": 10000,
      "panels": ["metrics", "tasks", "alerts", "team"]
    },
    "daily": {
      "refreshInterval": 3600000,
      "panels": ["progress", "performance", "quality"]
    }
  }
}
EOF
print_status "Performance monitoring configuration created"

# 6. Memory Management Services
echo ""
echo "🧠 6. Configuring Memory Management..."
mkdir -p services/memory

cat > services/memory/config.json << EOF
{
  "memory": {
    "contextWindow": 200000,
    "retentionPolicy": {
      "shortTerm": "24h",
      "mediumTerm": "7d", 
      "longTerm": "30d"
    },
    "compression": {
      "enabled": true,
      "algorithm": "semantic",
      "threshold": 0.85
    },
    "retrieval": {
      "maxResults": 50,
      "timeout": 500,
      "fallbackStrategy": "fuzzy"
    }
  }
}
EOF
print_status "Memory management configuration created"

# 7. Guardrails & Safety Systems
echo ""
echo "🛡️  7. Setting up Safety Systems..."
mkdir -p services/safety

cat > services/safety/policies.json << EOF
{
  "safety": {
    "validation": {
      "input": {
        "maxLength": 100000,
        "sanitization": true,
        "contentFiltering": true
      },
      "output": {
        "toxicityCheck": true,
        "factualityValidation": true,
        "consistencyCheck": true
      }
    },
    "escalation": {
      "levels": ["warning", "block", "escalate"],
      "thresholds": {
        "toxicity": 0.8,
        "factuality": 0.6,
        "consistency": 0.7
      }
    },
    "monitoring": {
      "realtime": true,
      "logging": "detailed",
      "alerting": true
    }
  }
}
EOF
print_status "Safety systems configuration created"

# Create package.json for Node.js dependencies
echo ""
echo "📦 Setting up Node.js dependencies..."
cat > package.json << EOF
{
  "name": "hal-phase3-automation",
  "version": "1.0.0",
  "description": "HAL Phase 3 Automated Execution System",
  "main": "automation/task-scheduler.js",
  "scripts": {
    "start": "node automation/task-scheduler.js",
    "start-automation": "node automation/automation-engine.js",
    "test": "jest",
    "monitor": "node monitoring/dashboard.js",
    "setup": "./scripts/setup.sh"
  },
  "dependencies": {
    "moment": "^2.29.4",
    "axios": "^1.6.0",
    "openai": "^4.20.0",
    "airtable": "^0.12.0",
    "@slack/webhook": "^7.0.0",
    "express": "^4.18.0",
    "ws": "^8.14.0",
    "lodash": "^4.17.21",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.0.0"
  }
}
EOF
print_status "Package.json created"

echo ""
echo "🎉 Infrastructure Provisioning Complete!"
echo "======================================"
print_info "Next steps:"
print_info "1. Set GitHub secrets via: https://github.com/fikra-hal/hal-phase3-automation/settings/secrets/actions"
print_info "2. Run: npm install"
print_info "3. Start automation: npm run start-automation"
print_info "4. Monitor progress at: #hal-phase3-automation Slack channel"
echo ""
print_status "HAL Phase 3 infrastructure is ready for deployment!"
