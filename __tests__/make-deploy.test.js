/**
 * Tests for Make.com Blueprint Auto-Import Script
 */

const fs = require('fs');
const path = require('path');

// Mock the environment and script functions for testing
describe('Make.com Blueprint Auto-Import', () => {
  const testScript = path.join(__dirname, '..', 'scripts', 'make-deploy.js');
  const testBlueprintDir = path.join(__dirname, '..', 'make', 'blueprints');
  
  beforeAll(() => {
    // Ensure test directory exists
    if (!fs.existsSync(testBlueprintDir)) {
      fs.mkdirSync(testBlueprintDir, { recursive: true });
    }
  });

  test('script file should exist and be executable', () => {
    expect(fs.existsSync(testScript)).toBe(true);
    
    const stats = fs.statSync(testScript);
    expect(stats.mode & parseInt('111', 8)).toBeGreaterThan(0); // Check if executable
  });

  test('should contain required environment variable checks', () => {
    const scriptContent = fs.readFileSync(testScript, 'utf8');
    
    expect(scriptContent).toContain('MAKE_API_TOKEN');
    expect(scriptContent).toContain('MAKE_TEAM_ID');
    expect(scriptContent).toContain('MAKE_API_TOKEN environment variable is required');
    expect(scriptContent).toContain('MAKE_TEAM_ID environment variable is required');
  });

  test('should contain Make.com API endpoint and headers', () => {
    const scriptContent = fs.readFileSync(testScript, 'utf8');
    
    expect(scriptContent).toContain('api.make.com');
    expect(scriptContent).toContain('/v2/blueprints/import');
    expect(scriptContent).toContain('Authorization');
    expect(scriptContent).toContain('\'Content-Type\': \'application/json\'');
    expect(scriptContent).toContain('X-Team-Id');
  });

  test('should contain file filtering for make/blueprints/*.json', () => {
    const scriptContent = fs.readFileSync(testScript, 'utf8');
    
    expect(scriptContent).toContain('make/blueprints/');
    expect(scriptContent).toContain('.json');
    expect(scriptContent).toContain('filter');
  });

  test('should handle JSON parsing and error cases', () => {
    const scriptContent = fs.readFileSync(testScript, 'utf8');
    
    expect(scriptContent).toContain('JSON.parse');
    expect(scriptContent).toContain('parseError');
    expect(scriptContent).toContain('process.exitCode = 1');
    expect(scriptContent).toContain('200');
    expect(scriptContent).toContain('300');
  });
});

describe('Workflow Configuration', () => {
  const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'deploy-make.yml');
  
  test('should have valid workflow file', () => {
    expect(fs.existsSync(workflowPath)).toBe(true);
    
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');
    
    // Check for required elements
    expect(workflowContent).toContain('name: Deploy Make.com Blueprints');
    expect(workflowContent).toContain('on:');
    expect(workflowContent).toContain('push:');
    expect(workflowContent).toContain('branches:');
    expect(workflowContent).toContain('- main');
    expect(workflowContent).toContain('paths:');
    expect(workflowContent).toContain("'make/blueprints/**/*.json'");
    expect(workflowContent).toContain('workflow_dispatch:');
    expect(workflowContent).toContain('permissions:');
    expect(workflowContent).toContain('contents: read');
    expect(workflowContent).toContain('node-version: \'20\'');
    expect(workflowContent).toContain('MAKE_API_TOKEN: ${{ secrets.MAKE_API_TOKEN }}');
    expect(workflowContent).toContain('MAKE_TEAM_ID: ${{ secrets.MAKE_TEAM_ID }}');
    expect(workflowContent).toContain('node scripts/make-deploy.js');
  });
});

describe('Blueprint Structure', () => {
  const blueprintPath = path.join(__dirname, '..', 'make', 'blueprints', 'hal-task-automation.json');
  
  test('should have valid sample blueprint', () => {
    expect(fs.existsSync(blueprintPath)).toBe(true);
    
    const blueprintContent = fs.readFileSync(blueprintPath, 'utf8');
    const blueprint = JSON.parse(blueprintContent);
    
    expect(blueprint).toHaveProperty('version');
    expect(blueprint).toHaveProperty('scenario');
    expect(blueprint.scenario).toHaveProperty('name');
    expect(blueprint.scenario).toHaveProperty('description');
    expect(blueprint.scenario).toHaveProperty('modules');
    expect(Array.isArray(blueprint.scenario.modules)).toBe(true);
  });
});