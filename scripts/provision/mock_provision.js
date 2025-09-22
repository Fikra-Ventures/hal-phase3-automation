#!/usr/bin/env node

/**
 * HAL Phase 3 - Zero-Touch Runner (ZTR) Mock Provision Script
 * 
 * This script provides a mock fallback mode for the ZTR workflow when
 * secrets are missing or when explicitly running in mock mode.
 * 
 * Features:
 * - CommonJS compatible (ES modules ready)
 * - Reads optional env vars MOCK_OWNER and MOCK_RUN_ID
 * - Creates JSON report with status, mode, and timestamp
 * - Prints summary to stdout
 */

const { writeFileSync } = require('fs');
const { join } = require('path');

/**
 * Generates a mock provision report
 */
function generateMockReport() {
  // Read optional environment variables with sensible defaults
  const owner = process.env.MOCK_OWNER || 'hal-automation';
  const runId = process.env.MOCK_RUN_ID || `mock-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  // Create comprehensive mock report
  const report = {
    status: "ok",
    mode: "mock",
    owner,
    runId,
    timestamp,
    notes: [
      "Running in mock mode - no actual provisioning performed",
      "All required secrets were missing or mode was explicitly set to mock",
      "This is a safe, non-destructive dry-run of the ZTR workflow",
      "Check GitHub workflow logs and artifacts for full details",
      "To run with actual provisioning, ensure all secrets are configured and set mode to 'provision'"
    ],
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch
    },
    workflow: {
      runId: process.env.GITHUB_RUN_ID || runId,
      runNumber: process.env.GITHUB_RUN_NUMBER || '1',
      repository: process.env.GITHUB_REPOSITORY || 'fikra-hal/hal-phase3-automation',
      ref: process.env.GITHUB_REF || 'refs/heads/main',
      actor: process.env.GITHUB_ACTOR || owner
    },
    mockActions: [
      "✓ Validated workflow configuration",
      "✓ Checked environment variables",
      "✓ Simulated secret detection",
      "✓ Generated mock provision report",
      "✓ Prepared artifact for upload"
    ]
  };

  return report;
}

/**
 * Writes the report to a JSON file
 */
function writeReport(report) {
  const reportPath = './mock-report.json';
  
  try {
    writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`✅ Mock report written to ${reportPath}`);
    return reportPath;
  } catch (error) {
    console.error(`❌ Failed to write mock report: ${error.message}`);
    throw error;
  }
}

/**
 * Prints a summary to stdout
 */
function printSummary(report) {
  console.log('');
  console.log('🤖 HAL Phase 3 - Zero-Touch Runner (Mock Mode)');
  console.log('============================================');
  console.log('');
  console.log(`📊 Status: ${report.status.toUpperCase()}`);
  console.log(`🎭 Mode: ${report.mode.toUpperCase()}`);
  console.log(`👤 Owner: ${report.owner}`);
  console.log(`🆔 Run ID: ${report.runId}`);
  console.log(`⏰ Timestamp: ${report.timestamp}`);
  console.log('');
  console.log('📝 Actions Performed:');
  report.mockActions.forEach(action => {
    console.log(`   ${action}`);
  });
  console.log('');
  console.log('💡 Notes:');
  report.notes.forEach((note, index) => {
    console.log(`   ${index + 1}. ${note}`);
  });
  console.log('');
  console.log('🎉 Mock provision completed successfully!');
  console.log('');
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting HAL Phase 3 ZTR Mock Provision...');
    
    // Generate the mock report
    const report = generateMockReport();
    
    // Write report to file
    const reportPath = writeReport(report);
    
    // Print summary
    printSummary(report);
    
    // Exit successfully
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Mock provision failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute if this script is run directly
if (require.main === module) {
  main();
}

module.exports = { generateMockReport, writeReport, printSummary };