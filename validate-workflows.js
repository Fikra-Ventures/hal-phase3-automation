#!/usr/bin/env node

/**
 * Validate n8n workflow JSON files against schema
 */

const fs = require('fs');
const path = require('path');

function validateJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    console.log(`✅ ${filePath}: Valid JSON`);
    return true;
  } catch (error) {
    console.error(`❌ ${filePath}: Invalid JSON - ${error.message}`);
    return false;
  }
}

function validateWorkflowStructure(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = JSON.parse(content);
    
    // Check required fields
    const required = ['name', 'nodes', 'connections'];
    const missing = required.filter(field => !Object.prototype.hasOwnProperty.call(workflow, field));
    
    if (missing.length > 0) {
      console.error(`❌ ${filePath}: Missing required fields: ${missing.join(', ')}`);
      return false;
    }
    
    // Check nodes structure
    if (!Array.isArray(workflow.nodes)) {
      console.error(`❌ ${filePath}: 'nodes' must be an array`);
      return false;
    }
    
    for (const node of workflow.nodes) {
      const nodeRequired = ['parameters', 'name', 'type', 'typeVersion', 'position'];
      const nodeMissing = nodeRequired.filter(field => !Object.prototype.hasOwnProperty.call(node, field));
      
      if (nodeMissing.length > 0) {
        console.error(`❌ ${filePath}: Node '${node.name || 'unnamed'}' missing: ${nodeMissing.join(', ')}`);
        return false;
      }
      
      if (!Array.isArray(node.position) || node.position.length !== 2) {
        console.error(`❌ ${filePath}: Node '${node.name}' position must be [x, y] array`);
        return false;
      }
    }
    
    console.log(`✅ ${filePath}: Valid workflow structure`);
    return true;
  } catch (error) {
    console.error(`❌ ${filePath}: Validation error - ${error.message}`);
    return false;
  }
}

// Main validation
console.log('🔍 Validating n8n workflow files...\n');

const files = [
  'templates/t2-triage.json',
  'templates/examples/t2-triage.sample.json',
  'schema.json'
];

let allValid = true;

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ ${file}: File not found`);
    allValid = false;
    continue;
  }
  
  if (!validateJson(fullPath)) {
    allValid = false;
    continue;
  }
  
  // Additional validation for workflow files
  if (file.includes('t2-triage.json')) {
    if (!validateWorkflowStructure(fullPath)) {
      allValid = false;
    }
  }
}

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('✅ All files passed validation!');
  process.exit(0);
} else {
  console.log('❌ Some files failed validation');
  process.exit(1);
}