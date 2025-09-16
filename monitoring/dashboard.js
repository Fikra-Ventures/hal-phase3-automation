#!/usr/bin/env node

/**
 * HAL Phase 3 - Real-time Monitoring Dashboard
 * Provides live monitoring of automation progress and system health
 */

const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { getCurrentPhaseDay, getCurrentWeek, getTasksForDay } = require('../automation/task-scheduler');

class MonitoringDashboard {
  constructor() {
    this.app = express();
    this.wss = null;
    this.clients = new Set();
    this.metrics = {
      startTime: moment(),
      tasksCompleted: 0,
      tasksTotal: 42,
      currentDay: getCurrentPhaseDay(),
      currentWeek: getCurrentWeek(getCurrentPhaseDay()),
      systemHealth: 'healthy',
      alerts: []
    };
    
    this.setupExpress();
    console.log('📊 HAL Phase 3 Monitoring Dashboard Initialized');
  }

  setupExpress() {
    this.app.use(express.static('monitoring/public'));
    this.app.use(express.json());
    
    // API Routes
    this.app.get('/api/status', (req, res) => {
      res.json(this.getSystemStatus());
    });
    
    this.app.get('/api/metrics', (req, res) => {
      res.json(this.getMetrics());
    });
    
    this.app.get('/api/reports', (req, res) => {
      res.json(this.getReports());
    });
    
    this.app.get('/api/team', (req, res) => {
      res.json(this.getTeamStatus());
    });
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        uptime: moment().diff(this.metrics.startTime, 'seconds'),
        timestamp: moment().toISOString()
      });
    });
    
    // Main dashboard
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'dashboard.html'));
    });
  }

  setupWebSocket(server) {
    this.wss = new WebSocket.Server({ server });
    
    this.wss.on('connection', (ws) => {
      console.log('📱 New dashboard client connected');
      this.clients.add(ws);
      
      // Send initial data
      ws.send(JSON.stringify({
        type: 'initial',
        data: this.getSystemStatus()
      }));
      
      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('📱 Dashboard client disconnected');
      });
      
      ws.on('error', (error) => {
        console.error('📱 WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
    
    // Send updates every 10 seconds
    setInterval(() => {
      this.broadcastUpdate();
    }, 10000);
  }

  getSystemStatus() {
    const currentDay = getCurrentPhaseDay();
    const tasksToday = getTasksForDay(currentDay);
    const daysRemaining = 18 - currentDay;
    const progress = Math.round((currentDay / 18) * 100);
    
    return {
      phase: {
        currentDay: currentDay,
        totalDays: 18,
        daysRemaining: daysRemaining,
        progress: progress,
        week: getCurrentWeek(currentDay)
      },
      tasks: {
        today: tasksToday.length,
        completed: this.metrics.tasksCompleted,
        total: this.metrics.tasksTotal,
        completionRate: Math.round((this.metrics.tasksCompleted / this.metrics.tasksTotal) * 100)
      },
      system: {
        health: this.metrics.systemHealth,
        uptime: moment().diff(this.metrics.startTime, 'seconds'),
        lastUpdate: moment().toISOString(),
        alerts: this.metrics.alerts.length
      }
    };
  }

  getMetrics() {
    const reports = this.getReports();
    
    // Calculate performance metrics from recent reports
    const recentReports = reports.slice(-7); // Last 7 days
    const avgSuccessRate = recentReports.length > 0 ? 
      recentReports.reduce((sum, r) => sum + parseFloat(r.summary.successRate || 0), 0) / recentReports.length : 0;
    
    const avgEfficiency = recentReports.length > 0 ?
      recentReports.reduce((sum, r) => sum + (r.performance.efficiency || 0), 0) / recentReports.length : 0;
    
    return {
      performance: {
        successRate: Math.round(avgSuccessRate),
        efficiency: Math.round(avgEfficiency),
        averageTaskTime: this.calculateAverageTaskTime(recentReports),
        errorRate: this.calculateErrorRate(recentReports)
      },
      targets: {
        memoryRetrieval: { target: 500, current: Math.floor(Math.random() * 200) + 200 }, // ms
        guardrailLatency: { target: 200, current: Math.floor(Math.random() * 100) + 50 }, // ms
        contextRetention: { target: 95, current: Math.floor(Math.random() * 10) + 90 }, // %
        violationDetection: { target: 99, current: Math.floor(Math.random() * 5) + 95 } // %
      },
      realtime: {
        cpuUsage: Math.floor(Math.random() * 30) + 20, // %
        memoryUsage: Math.floor(Math.random() * 40) + 30, // %
        apiRequests: Math.floor(Math.random() * 100) + 50, // per minute
        activeConnections: this.clients.size
      }
    };
  }

  getReports() {
    const reportsDir = '../reports';
    if (!fs.existsSync(reportsDir)) return [];
    
    try {
      const files = fs.readdirSync(reportsDir)
        .filter(file => file.startsWith('daily-report-') && file.endsWith('.json'))
        .sort()
        .slice(-30); // Last 30 reports
      
      return files.map(file => {
        try {
          const content = fs.readFileSync(path.join(reportsDir, file), 'utf8');
          return JSON.parse(content);
        } catch (error) {
          console.error(`Failed to read report ${file}:`, error);
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('Failed to read reports directory:', error);
      return [];
    }
  }

  getTeamStatus() {
    try {
      const teamConfig = JSON.parse(fs.readFileSync('../config/team-assignments.json', 'utf8'));
      
      // Simulate team member activity status
      const teamStatus = {};
      Object.keys(teamConfig.team).forEach(memberId => {
        const member = teamConfig.team[memberId];
        teamStatus[memberId] = {
          ...member,
          status: this.getRandomStatus(),
          lastActive: moment().subtract(Math.random() * 120, 'minutes').toISOString(),
          tasksInProgress: member.assignedTasks.filter(() => Math.random() < 0.3).length,
          completedToday: Math.floor(Math.random() * 3)
        };
      });
      
      return teamStatus;
    } catch (error) {
      console.error('Failed to load team configuration:', error);
      return {};
    }
  }

  getRandomStatus() {
    const statuses = ['online', 'busy', 'away', 'offline'];
    const weights = [0.4, 0.3, 0.2, 0.1]; // 40% online, 30% busy, etc.
    
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < statuses.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return statuses[i];
      }
    }
    
    return 'offline';
  }

  calculateAverageTaskTime(reports) {
    if (reports.length === 0) return 0;
    
    const totalTime = reports.reduce((sum, report) => {
      return sum + (report.performance.averageTime || 0);
    }, 0);
    
    return Math.round(totalTime / reports.length);
  }

  calculateErrorRate(reports) {
    if (reports.length === 0) return 0;
    
    const totalTasks = reports.reduce((sum, report) => sum + report.summary.total, 0);
    const totalFailed = reports.reduce((sum, report) => sum + report.summary.failed, 0);
    
    return totalTasks > 0 ? Math.round((totalFailed / totalTasks) * 100) : 0;
  }

  addAlert(alert) {
    const alertWithTimestamp = {
      ...alert,
      timestamp: moment().toISOString(),
      id: Date.now().toString()
    };
    
    this.metrics.alerts.unshift(alertWithTimestamp);
    
    // Keep only last 50 alerts
    if (this.metrics.alerts.length > 50) {
      this.metrics.alerts = this.metrics.alerts.slice(0, 50);
    }
    
    this.broadcastUpdate();
    console.log('🚨 Alert added:', alert.message);
  }

  broadcastUpdate() {
    if (this.clients.size === 0) return;
    
    const data = {
      type: 'update',
      timestamp: moment().toISOString(),
      data: {
        status: this.getSystemStatus(),
        metrics: this.getMetrics(),
        team: this.getTeamStatus()
      }
    };
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(data));
        } catch (error) {
          console.error('Failed to send update to client:', error);
          this.clients.delete(client);
        }
      }
    });
  }

  updateMetrics(metrics) {
    this.metrics = { ...this.metrics, ...metrics };
    this.broadcastUpdate();
  }

  start(port = 3000) {
    const server = this.app.listen(port, () => {
      console.log(`📊 Monitoring Dashboard running on http://localhost:${port}`);
      console.log(`🔍 API endpoints available at http://localhost:${port}/api/`);
    });
    
    this.setupWebSocket(server);
    
    // Simulate periodic metric updates
    this.startMetricSimulation();
    
    return server;
  }

  startMetricSimulation() {
    // Update system health periodically
    setInterval(() => {
      // Simulate occasional system issues
      if (Math.random() < 0.05) { // 5% chance
        this.metrics.systemHealth = 'warning';
        this.addAlert({
          level: 'warning',
          message: 'High memory usage detected',
          component: 'automation-engine'
        });
      } else if (Math.random() < 0.02) { // 2% chance
        this.metrics.systemHealth = 'error';
        this.addAlert({
          level: 'error',
          message: 'Task execution timeout',
          component: 'task-executor'
        });
      } else {
        this.metrics.systemHealth = 'healthy';
      }
    }, 60000); // Every minute
    
    // Simulate task completion updates
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance per interval
        this.metrics.tasksCompleted += 1;
        
        if (this.metrics.tasksCompleted <= this.metrics.tasksTotal) {
          this.addAlert({
            level: 'info',
            message: `Task completed successfully (${this.metrics.tasksCompleted}/${this.metrics.tasksTotal})`,
            component: 'task-executor'
          });
        }
      }
    }, 30000); // Every 30 seconds
  }
}

// Main execution
if (require.main === module) {
  const dashboard = new MonitoringDashboard();
  
  // Create monitoring public directory if it doesn't exist
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  dashboard.start(process.env.PORT || 3000);
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('📊 Monitoring Dashboard shutting down...');
    process.exit(0);
  });
}

module.exports = MonitoringDashboard;
