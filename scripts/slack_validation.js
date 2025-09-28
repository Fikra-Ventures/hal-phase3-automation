/**
 * HAL Phase 3 Automation with Slack Channel Validation
 * This script demonstrates how to integrate the Slack validation rules
 * into HAL's automation workflows.
 */

const SLACK_VALIDATION = {
  FORBIDDEN_PREFIXES: ['_'],
  FALLBACK_CHANNEL: '#hal-alerts',
  ALLOWED_CHANNELS: [
    '#hal-orchestration',
    '#hal-alerts',
    '#hal-engineering',
    '#general',
    '#random'
  ]
};

class SlackValidator {
  static validateChannel(channel) {
    const normalizedChannel = channel.startsWith('#') ? channel : `#${channel}`;
    const channelName = normalizedChannel.slice(1);
    
    // Check forbidden prefixes
    for (const prefix of SLACK_VALIDATION.FORBIDDEN_PREFIXES) {
      if (channelName.startsWith(prefix)) {
        return {
          valid: false,
          error: `Channel cannot start with '${prefix}'`,
          fallback: SLACK_VALIDATION.FALLBACK_CHANNEL
        };
      }
    }
    
    // Check format
    if (!/^#[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(normalizedChannel)) {
      return {
        valid: false,
        error: 'Invalid channel format',
        fallback: SLACK_VALIDATION.FALLBACK_CHANNEL
      };
    }
    
    // Check if channel exists (basic check against known channels)
    if (!SLACK_VALIDATION.ALLOWED_CHANNELS.includes(normalizedChannel)) {
      return {
        valid: false,
        error: 'Channel not in allowed list',
        fallback: SLACK_VALIDATION.FALLBACK_CHANNEL
      };
    }
    
    return { valid: true, channel: normalizedChannel };
  }

  static async postToSlack(webhookUrl, channel, message, context = '') {
    const validation = this.validateChannel(channel);
    
    let targetChannel = channel;
    let messagePrefix = '';
    
    if (!validation.valid) {
      console.warn(`Slack validation failed for ${channel}: ${validation.error}`);
      
      // Post validation failure to alerts channel
      await this.notifyValidationFailure(webhookUrl, channel, validation.error, context);
      
      // Use fallback channel
      targetChannel = validation.fallback;
      messagePrefix = `⚠️ *[Redirected from ${channel}]* `;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: messagePrefix + message
        })
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      return {
        success: true,
        channel: targetChannel,
        redirected: !validation.valid
      };
    } catch (error) {
      console.error('Failed to post to Slack:', error);
      return {
        success: false,
        error: error.message,
        channel: targetChannel,
        redirected: !validation.valid
      };
    }
  }

  static async notifyValidationFailure(webhookUrl, originalChannel, error, context) {
    const alertMessage = `🚨 *HAL Slack Validation Failure*\n\n` +
      `**Channel:** ${originalChannel}\n` +
      `**Error:** ${error}\n` +
      `${context ? `**Context:** ${context}\n` : ''}` +
      `**Time:** ${new Date().toISOString()}\n` +
      `**Action:** Message redirected to ${SLACK_VALIDATION.FALLBACK_CHANNEL}`;

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: alertMessage })
      });
    } catch (error) {
      console.error('Failed to send validation failure notification:', error);
    }
  }
}

class HalPhase3Automation {
  constructor() {
    this.airtableApiKey = process.env.AIRTABLE_API_KEY;
    this.airtableBaseId = process.env.AIRTABLE_BASE_ID;
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.validationEnabled = process.env.HAL_SLACK_VALIDATION === 'enabled';
  }

  async run() {
    console.log('🚀 Starting HAL Phase 3 Automation...');
    console.log(`Slack validation: ${this.validationEnabled ? 'ENABLED' : 'DISABLED'}`);

    try {
      // Phase 3 tasks
      await this.processMemoryManagement();
      await this.processGuardrails();
      await this.processPerformanceMetrics();
      
      await this.sendCompletionNotification();
    } catch (error) {
      console.error('❌ Automation failed:', error);
      await this.sendErrorNotification(error);
      process.exit(1);
    }
  }

  async processMemoryManagement() {
    console.log('📊 Processing memory management tasks...');
    
    // Simulate memory management work
    const tasks = await this.fetchTasksFromAirtable('Memory Management');
    
    for (const task of tasks) {
      console.log(`Processing task: ${task.name}`);
      // Process task...
    }

    // Notify progress
    await this.notifyProgress(
      '#hal-orchestration',
      '📊 Memory management tasks processed',
      'Memory Management Phase'
    );
  }

  async processGuardrails() {
    console.log('🛡️ Processing guardrails tasks...');
    
    const tasks = await this.fetchTasksFromAirtable('Guardrails');
    
    for (const task of tasks) {
      console.log(`Processing task: ${task.name}`);
      // Process task...
    }

    await this.notifyProgress(
      '#hal-engineering',
      '🛡️ Guardrails implementation completed',
      'Security & Safety Phase'
    );
  }

  async processPerformanceMetrics() {
    console.log('⚡ Processing performance monitoring...');
    
    const tasks = await this.fetchTasksFromAirtable('Performance');
    
    for (const task of tasks) {
      console.log(`Processing task: ${task.name}`);
      // Process task...
    }

    await this.notifyProgress(
      '#hal-orchestration',
      '⚡ Performance monitoring systems active',
      'Performance & Integration Phase'
    );
  }

  async fetchTasksFromAirtable(phase) {
    // Mock implementation - replace with actual Airtable API calls
    console.log(`Fetching ${phase} tasks from Airtable...`);
    return [
      { name: `${phase} Task 1`, status: 'pending' },
      { name: `${phase} Task 2`, status: 'pending' }
    ];
  }

  async notifyProgress(channel, message, context) {
    if (!this.slackWebhookUrl) {
      console.log(`Would notify ${channel}: ${message}`);
      return;
    }

    if (this.validationEnabled) {
      return await SlackValidator.postToSlack(
        this.slackWebhookUrl,
        channel,
        message,
        context
      );
    } else {
      // Legacy notification without validation
      console.warn('⚠️ Slack validation disabled - posting without validation');
      try {
        const response = await fetch(this.slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message })
        });
        return { success: response.ok };
      } catch (error) {
        console.error('Legacy Slack notification failed:', error);
        return { success: false };
      }
    }
  }

  async sendCompletionNotification() {
    const message = `✅ *HAL Phase 3 Automation Complete*\n\n` +
      `**Time:** ${new Date().toISOString()}\n` +
      `**Status:** All phases completed successfully\n` +
      `**Next:** Review gate metrics and prepare for deployment\n\n` +
      `_Automated by HAL with Slack validation enabled_`;

    await this.notifyProgress('#hal-orchestration', message, 'Completion Notification');
  }

  async sendErrorNotification(error) {
    const message = `❌ *HAL Phase 3 Automation Failed*\n\n` +
      `**Error:** ${error.message}\n` +
      `**Time:** ${new Date().toISOString()}\n` +
      `**Action Required:** Manual intervention needed\n\n` +
      `_Check logs for detailed error information_`;

    // Always send error notifications to alerts channel
    await this.notifyProgress('#hal-alerts', message, 'Error Notification');
  }
}

// Example of Zapier integration with validation
class ZapierIntegration {
  static validatePayload(payload) {
    const channelRefs = [];
    
    // Extract channel references from payload
    const payloadStr = JSON.stringify(payload);
    const channelPattern = /#[a-zA-Z0-9][a-zA-Z0-9_-]*/g;
    const matches = payloadStr.match(channelPattern);
    
    if (matches) {
      channelRefs.push(...matches);
    }

    // Check explicit channel fields
    if (payload.channel) channelRefs.push(payload.channel);
    if (payload.slack_channel) channelRefs.push(payload.slack_channel);

    const uniqueChannels = [...new Set(channelRefs)];
    const results = uniqueChannels.map(ch => SlackValidator.validateChannel(ch));
    
    return {
      valid: results.every(r => r.valid),
      channels: results,
      errors: results.filter(r => !r.valid)
    };
  }

  static async triggerWithValidation(webhookUrl, payload) {
    const validation = this.validatePayload(payload);
    
    if (!validation.valid) {
      console.error('Zapier payload validation failed:', validation.errors);
      
      // Modify payload to use fallback channels
      const sanitizedPayload = { ...payload };
      validation.errors.forEach(error => {
        console.warn(`Replacing invalid channel: ${error.channel || 'unknown'}`);
      });
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      return {
        success: response.ok,
        status: response.status,
        validation: validation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        validation: validation
      };
    }
  }
}

// Run automation if this file is executed directly
if (require.main === module) {
  const automation = new HalPhase3Automation();
  automation.run().catch(console.error);
}

module.exports = {
  HalPhase3Automation,
  SlackValidator,
  ZapierIntegration,
  SLACK_VALIDATION
};
