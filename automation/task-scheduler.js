#!/usr/bin/env node

/**
 * HAL Phase 3 - Daily Task Scheduler
 * Determines which tasks should execute based on date and dependencies
 */

const moment = require('moment');
const fs = require('fs');
const path = require('path');

// Phase 3 start date (October 1, 2025)
const PHASE_START = moment('2025-10-01');
const TARGET_COMPLETION = moment('2025-10-01').add(18, 'days');

const TASKS = {
  week1: {
    name: 'Memory Management Foundation',
    days: [1, 2, 3, 4, 5, 6, 7],
    tasks: [
      { id: '1.1', name: 'Schema Design', owner: 'Aria', hours: 4, days: [1, 2], deps: [] },
      { id: '1.2', name: 'Vector Storage Research', owner: 'Mira', hours: 4, days: [1, 2], deps: ['1.1'] },
      { id: '1.3', name: 'Memory Scoping Framework', owner: 'Lex', hours: 6, days: [1, 2], deps: ['1.1'] },
      { id: '2.1', name: 'Embeddings Service Setup', owner: 'Mira', hours: 6, days: [3, 4], deps: ['1.2'] },
      { id: '2.2', name: 'Semantic Search Engine', owner: 'Mira', hours: 8, days: [3, 4], deps: ['2.1'] },
      { id: '2.3', name: 'Memory Indexing System', owner: 'Aria', hours: 4, days: [3, 4], deps: ['2.1'] },
      { id: '3.1', name: 'Airtable Memory Integration', owner: 'Aria', hours: 6, days: [5, 6], deps: ['1.1', '1.3'] },
      { id: '3.2', name: 'Memory Access Controls', owner: 'Lex', hours: 4, days: [5, 6], deps: ['3.1'] },
      { id: '3.3', name: 'Memory Retrieval Optimization', owner: 'Mira', hours: 6, days: [5, 6], deps: ['2.2', '3.1'] },
      { id: '4.1', name: 'Memory Service Integration Testing', owner: 'Zane', hours: 8, days: [7], deps: ['3.1', '3.2', '3.3'] }
    ]
  },
  week2: {
    name: 'Guardrails and Safety Systems',
    days: [8, 9, 10, 11, 12],
    tasks: [
      { id: '5.1', name: 'Policy Framework Design', owner: 'Lex', hours: 6, days: [8, 9], deps: [] },
      { id: '5.2', name: 'LLM Judge Configuration', owner: 'Lex', hours: 4, days: [8, 9], deps: ['5.1'] },
      { id: '5.3', name: 'Escalation Workflow Design', owner: 'Lex', hours: 4, days: [8, 9], deps: ['5.1'] },
      { id: '6.1', name: 'Input Sanitization Pipeline', owner: 'Lex', hours: 6, days: [10, 11], deps: ['5.2'] },
      { id: '6.2', name: 'Output Filtering System', owner: 'Lex', hours: 6, days: [10, 11], deps: ['5.2'] },
      { id: '6.3', name: 'Real-time Safety Validation', owner: 'Lex', hours: 8, days: [10, 11], deps: ['6.1', '6.2'] },
      { id: '7.1', name: 'CI Integration Enhancement', owner: 'Kai', hours: 4, days: [12], deps: ['6.3'] },
      { id: '7.2', name: 'Safety Metrics Dashboard', owner: 'Kai', hours: 4, days: [12], deps: ['6.3'] }
    ]
  },
  week3: {
    name: 'Performance Tracking and Integration',
    days: [13, 14, 15, 16, 17, 18],
    tasks: [
      { id: '8.1', name: 'Performance Metrics Schema', owner: 'Aria', hours: 4, days: [13, 14], deps: [] },
      { id: '8.2', name: 'Task Outcome Tracking', owner: 'Zane', hours: 6, days: [13, 14], deps: ['8.1'] },
      { id: '8.3', name: 'Quality Assessment Framework', owner: 'Zane', hours: 6, days: [13, 14], deps: ['8.1'] },
      { id: '9.1', name: 'Real-time Performance Dashboard', owner: 'Kai', hours: 8, days: [15, 16], deps: ['8.2'] },
      { id: '9.2', name: 'Drift Detection System', owner: 'Mira', hours: 6, days: [15, 16], deps: ['8.2', '8.3'] },
      { id: '9.3', name: 'Automated Alerting System', owner: 'Kai', hours: 4, days: [15, 16], deps: ['9.2'] },
      { id: '10.1', name: 'End-to-End Integration Testing', owner: 'Zane', hours: 12, days: [17, 18], deps: ['9.1', '9.2', '9.3'] },
      { id: '10.2', name: 'Performance Validation', owner: 'Zane', hours: 4, days: [17, 18], deps: ['10.1'] },
      { id: '10.3', name: 'Security and Safety Testing', owner: 'Lex', hours: 4, days: [17, 18], deps: ['10.1'] },
      { id: '10.4', name: 'User Acceptance Testing', owner: 'Lena', hours: 4, days: [17, 18], deps: ['10.2'] }
    ]
  }
};

function getCurrentPhaseDay() {
  const now = moment();
  const daysSinceStart = now.diff(PHASE_START, 'days') + 1;
  return Math.min(Math.max(daysSinceStart, 1), 18);
}

function getCurrentWeek(day) {
  if (day <= 7) return 1;
  if (day <= 12) return 2;
  return 3;
}

function getTasksForDay(day) {
  const week = getCurrentWeek(day);
  const weekKey = `week${week}`;
  
  if (!TASKS[weekKey]) return [];
  
  return TASKS[weekKey].tasks.filter(task => 
    task.days.includes(day)
  ).map(task => ({
    ...task,
    week,
    day,
    taskId: `${task.id}-${task.name.toLowerCase().replace(/\s+/g, '-')}`
  }));
}

function main() {
  const currentDay = getCurrentPhaseDay();
  const currentWeek = getCurrentWeek(currentDay);
  const tasksForToday = getTasksForDay(currentDay);
  
  const output = {
    currentDay,
    currentWeek,
    totalTasks: tasksForToday.length,
    tasks: tasksForToday.map(t => t.taskId),
    taskDetails: tasksForToday
  };
  
  console.log(`Current Phase Day: ${currentDay}/18`);
  console.log(`Current Week: ${currentWeek}`);
  console.log(`Tasks for today: ${tasksForToday.length}`);
  
  // Output for GitHub Actions
  console.log(`::set-output name=tasks::${output.tasks.join(',')}`);
  console.log(`::set-output name=week::${currentWeek}`);
  console.log(`::set-output name=day::${currentDay}`);
  
  return output;
}

if (require.main === module) {
  main();
}

module.exports = { getCurrentPhaseDay, getCurrentWeek, getTasksForDay, TASKS };
