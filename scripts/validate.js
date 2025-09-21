#!/usr/bin/env node

const fs = require('fs');

function validateSchema() {
  try {
    const schema = JSON.parse(fs.readFileSync('templates/schema.json', 'utf8'));
    console.log('✅ Schema is valid JSON');
    
    if (!schema.$schema || !schema.title || !schema.type) {
      console.log('❌ Schema missing required meta-fields');
      process.exit(1);
    }
    
    console.log('✅ Schema structure is valid');
    return true;
  } catch (error) {
    console.log('❌ Schema validation failed:', error.message);
    process.exit(1);
  }
}

function validateTemplate(templatePath) {
  try {
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    // Check for webhook nodes
    const webhookNodes = template.nodes.filter(node => node.type.includes('webhook'));
    if (webhookNodes.length === 0) {
      console.log('⚠️ No webhook nodes found');
      return true;
    }
    
    // Validate webhook nodes
    for (const node of webhookNodes) {
      if (!node.parameters) {
        console.log('❌ Webhook node missing parameters');
        process.exit(1);
      }
      
      // Check for environment variable usage (no inline secrets)
      const paramsStr = JSON.stringify(node.parameters);
      if (paramsStr.includes('secret') && !paramsStr.includes('{{ $env') && !paramsStr.includes('ENV')) {
        console.log('❌ Webhook node contains inline secrets');
        process.exit(1);
      }
      
      // Check for concise notes
      if (node.notes && node.notes.length > 200) {
        console.log('❌ Node notes too long (max 200 characters)');
        process.exit(1);
      }
    }
    
    console.log('✅ Webhook validation passed');
    return true;
  } catch (error) {
    console.log('❌ Template validation failed:', error.message);
    process.exit(1);
  }
}

// Main execution
if (process.argv[2] === 'schema') {
  validateSchema();
} else if (process.argv[2] === 'template' && process.argv[3]) {
  validateTemplate(process.argv[3]);
} else {
  console.log('Usage: validate.js [schema|template <path>]');
  process.exit(1);
}