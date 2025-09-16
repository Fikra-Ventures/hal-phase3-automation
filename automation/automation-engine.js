#!/usr/bin/env node

/**
 * HAL Phase 3 - Main Automation Engine
 * Orchestrates daily task execution, monitoring, and reporting
 */

const moment = require('moment');
const fs = require('fs');
const path = require('path');
const { IncomingWebhook } = require('@slack/webhook');

// Import task scheduler
const { getCurrentPhaseDay, getCurrentWeek, getTasksForDay, TASKS } = require('./task-scheduler');

class HalPhase3AutomationEngine {
  constructor() {
    this.config = this.loadConfiguration();
    this.slackWebhook = process.env.SLACK_WEBHOOK_URL ? new IncomingWebhook(process.env.SLACK_WEBHOOK_URL) : null;
    this.startTime = moment();
    
    console.log('🚀 HAL Phase 3 Automation Engine Initialized');
    console.log(`⏰ Start Time: ${this.startTime.format('YYYY-MM-DD HH:mm:ss')} GST`);
  }

  loadConfiguration() {
    try {
      const teamConfig = JSON.parse(fs.readFileSync('config/team-assignments.json', 'utf8'));
      return teamConfig;
    } catch (error) {
      console.error('❌ Failed to load configuration:', error.message);
      return { team: {}, taskAssignments: {} };
    }
  }

  async executeDaily() {
    console.log('\n🎯 Starting Daily Execution Cycle');
    console.log('=====================================');
    
    const currentDay = getCurrentPhaseDay();
    const currentWeek = getCurrentWeek(currentDay);
    const tasksForToday = getTasksForDay(currentDay);
    
    console.log(`📅 Current Day: ${currentDay}/18`);
    console.log(`📋 Current Week: ${currentWeek}`);
    console.log(`📝 Tasks Scheduled: ${tasksForToday.length}`);
    
    // Send daily startup notification
    await this.sendSlackNotification({
      text: `🌅 HAL Phase 3 Daily Execution Started`,
      attachments: [{
        color: 'good',
        fields: [
          { title: 'Phase Day', value: `${currentDay}/18`, short: true },
          { title: 'Current Week', value: currentWeek.toString(), short: true },
          { title: 'Tasks Today', value: tasksForToday.length.toString(), short: true },
          { title: 'Status', value: '🔄 Starting Execution', short: true }
        ]
      }]
    });
    
    // Execute tasks
    const results = await this.executeTasks(tasksForToday, currentWeek);
    
    // Generate and send daily report
    await this.generateDailyReport(currentDay, currentWeek, results);
    
    console.log('\n✅ Daily Execution Cycle Complete');
  }

  async executeTasks(tasks, week) {
    console.log(`\n⚙️  Executing ${tasks.length} tasks for Week ${week}`);
    
    const results = [];
    
    for (const task of tasks) {
      console.log(`\n🔧 Processing Task ${task.id}: ${task.name}`);
      console.log(`👤 Owner: ${task.owner}`);
      console.log(`⏱️  Estimated: ${task.hours} hours`);
      
      const result = await this.executeTask(task, week);
      results.push(result);
      
      // Send task notification to Slack
      await this.sendTaskNotification(task, result);
      
      // Brief pause between tasks
      await this.sleep(2000);
    }
    
    return results;
  }

  async executeTask(task, week) {
    const startTime = moment();
    
    try {
      // Check dependencies
      const dependenciesReady = await this.checkDependencies(task.deps);
      
      if (!dependenciesReady) {
        return {
          taskId: task.id,
          status: 'blocked',
          message: 'Dependencies not completed',
          startTime,
          endTime: moment(),
          duration: 0
        };
      }
      
      // Simulate task execution based on task type
      await this.simulateTaskExecution(task);
      
      const endTime = moment();
      const duration = endTime.diff(startTime, 'seconds');
      
      console.log(`✅ Task ${task.id} completed successfully in ${duration}s`);
      
      return {
        taskId: task.id,
        status: 'completed',
        message: 'Task completed successfully',
        startTime,
        endTime,
        duration,
        owner: task.owner
      };
      
    } catch (error) {
      const endTime = moment();
      const duration = endTime.diff(startTime, 'seconds');
      
      console.error(`❌ Task ${task.id} failed:`, error.message);
      
      return {
        taskId: task.id,
        status: 'failed',
        message: error.message,
        startTime,
        endTime,
        duration,
        owner: task.owner,
        error: error.stack
      };
    }
  }

  async checkDependencies(deps) {
    if (!deps || deps.length === 0) return true;
    
    // In a real implementation, this would check actual task completion status
    // For simulation, we'll assume 80% of dependencies are ready
    return Math.random() > 0.2;
  }

  async simulateTaskExecution(task) {
    // Simulate different task types with varying execution times
    const taskTypes = {
      'Schema': { baseTime: 3000, variance: 1000 },
      'Vector': { baseTime: 5000, variance: 2000 },
      'Memory': { baseTime: 4000, variance: 1500 },
      'Safety': { baseTime: 6000, variance: 2500 },
      'Testing': { baseTime: 8000, variance: 3000 },
      'Integration': { baseTime: 10000, variance: 4000 },
      'Dashboard': { baseTime: 4000, variance: 1000 }
    };
    
    // Determine task type from name
    let taskType = 'Schema'; // default
    for (const type in taskTypes) {
      if (task.name.includes(type)) {
        taskType = type;
        break;
      }
    }
    
    const config = taskTypes[taskType];
    const executionTime = config.baseTime + Math.random() * config.variance;
    
    console.log(`⏳ Simulating ${taskType} task execution (${Math.round(executionTime/1000)}s)`);
    
    // Simulate 5% chance of task failure
    if (Math.random() < 0.05) {
      throw new Error(`Simulated failure during ${taskType} execution`);
    }
    
    await this.sleep(executionTime);
  }

  async generateDailyReport(day, week, results) {
    console.log('\n📊 Generating Daily Report');
    
    const completed = results.filter(r => r.status === 'completed');
    const failed = results.filter(r => r.status === 'failed');
    const blocked = results.filter(r => r.status === 'blocked');
    
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = results.length > 0 ? totalDuration / results.length : 0;
    
    const report = {
      date: moment().format('YYYY-MM-DD'),
      day: day,
      week: week,
      summary: {
        total: results.length,
        completed: completed.length,
        failed: failed.length,
        blocked: blocked.length,
        successRate: results.length > 0 ? (completed.length / results.length * 100).toFixed(1) : '0'
      },
      performance: {
        totalTime: Math.round(totalDuration / 60), // minutes
        averageTime: Math.round(avgDuration), // seconds
        efficiency: this.calculateEfficiency(results)
      },
      nextDay: {
        day: Math.min(day + 1, 18),
        week: getCurrentWeek(Math.min(day + 1, 18)),
        scheduledTasks: getTasksForDay(Math.min(day + 1, 18)).length
      }
    };
    
    // Save report to file
    fs.writeFileSync(`reports/daily-report-${report.date}.json`, JSON.stringify(report, null, 2));
    
    // Send comprehensive report to Slack
    await this.sendDailyReportToSlack(report, results);
    
    return report;
  }

  calculateEfficiency(results) {
    // Simple efficiency calculation based on completion rate and average time
    const completionRate = results.filter(r => r.status === 'completed').length / results.length;
    const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const expectedTime = 300; // 5 minutes expected average
    
    const timeEfficiency = Math.min(expectedTime / avgTime, 1);
    
    return Math.round((completionRate * 0.7 + timeEfficiency * 0.3) * 100);
  }

  async sendTaskNotification(task, result) {
    if (!this.slackWebhook) return;
    
    const statusEmoji = {
      'completed': '✅',
      'failed': '❌', 
      'blocked': '⏸️'
    };
    
    const statusColor = {
      'completed': 'good',
      'failed': 'danger',
      'blocked': 'warning'
    };
    
    await this.slackWebhook.send({
      text: `${statusEmoji[result.status]} Task Update`,
      attachments: [{
        color: statusColor[result.status],
        fields: [
          { title: 'Task ID', value: task.id, short: true },
          { title: 'Task Name', value: task.name, short: true },
          { title: 'Owner', value: `@${task.owner}`, short: true },
          { title: 'Status', value: result.status, short: true },
          { title: 'Duration', value: `${result.duration}s`, short: true },
          { title: 'Message', value: result.message, short: false }
        ]
      }]
    });
  }

  async sendDailyReportToSlack(report, results) {
    if (!this.slackWebhook) return;
    
    const daysRemaining = 18 - report.day;
    const progressPercent = Math.round((report.day / 18) * 100);
    
    await this.slackWebhook.send({
      text: `📊 HAL Phase 3 Daily Report - Day ${report.day}/18`,
      attachments: [{
        color: report.summary.successRate >= 90 ? 'good' : report.summary.successRate >= 70 ? 'warning' : 'danger',
        fields: [
          { title: 'Progress', value: `${progressPercent}% (${daysRemaining} days remaining)`, short: true },
          { title: 'Tasks Today', value: `${report.summary.completed}/${report.summary.total} completed`, short: true },
          { title: 'Success Rate', value: `${report.summary.successRate}%`, short: true },
          { title: 'Efficiency', value: `${report.performance.efficiency}%`, short: true },
          { title: 'Total Time', value: `${report.performance.totalTime} minutes`, short: true },
          { title: 'Tomorrow', value: `${report.nextDay.scheduledTasks} tasks scheduled`, short: true }
        ]
      }]
    });
    
    // Send alerts for failed or blocked tasks
    if (report.summary.failed > 0 || report.summary.blocked > 0) {
      const alerts = results.filter(r => r.status === 'failed' || r.status === 'blocked');
      
      await this.slackWebhook.send({
        text: `🚨 Alert: ${alerts.length} tasks need attention`,
        attachments: alerts.map(alert => ({
          color: 'danger',
          fields: [
            { title: 'Task', value: alert.taskId, short: true },
            { title: 'Status', value: alert.status, short: true },
            { title: 'Owner', value: `@${alert.owner}`, short: true },
            { title: 'Issue', value: alert.message, short: false }
          ]
        }))
      });
    }
  }

  async sendSlackNotification(message) {
    if (!this.slackWebhook) {
      console.log('📢 Slack notification (webhook not configured):', message.text);
      return;
    }
    
    try {
      await this.slackWebhook.send(message);
      console.log('📢 Slack notification sent:', message.text);
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error.message);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  // Create reports directory if it doesn't exist
  if (!fs.existsSync('reports')) {
    fs.mkdirSync('reports', { recursive: true });
  }
  
  const engine = new HalPhase3AutomationEngine();
  
  try {
    await engine.executeDaily();
    console.log('\n🎉 Automation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Automation failed:', error);
    
    // Send error notification to Slack
    if (engine.slackWebhook) {
      await engine.sendSlackNotification({
        text: '💥 HAL Phase 3 Automation Error',
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Error', value: error.message, short: false },
            { title: 'Time', value: moment().format('YYYY-MM-DD HH:mm:ss'), short: true }
          ]
        }]
      });
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = HalPhase3AutomationEngine;
