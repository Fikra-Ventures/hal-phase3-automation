#!/usr/bin/env node

/**
 * Make.com Blueprint Deployment Script
 * 
 * Reads newline-delimited file paths from STDIN and deploys each blueprint
 * to Make.com via their API. Requires MAKE_API_TOKEN and MAKE_TEAM_ID
 * environment variables.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const MAKE_API_BASE = 'https://api.make.com/v2';
const IMPORT_ENDPOINT = '/blueprints/import';

// Environment variables validation
const requiredEnvVars = ['MAKE_API_TOKEN', 'MAKE_TEAM_ID'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Error: Required environment variable ${envVar} is not set`);
    process.exit(1);
  }
}

/**
 * Makes an HTTPS POST request to Make.com API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - JSON data to send
 * @returns {Promise<Object>} Response data
 */
function makeApiRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const url = new URL(MAKE_API_BASE + endpoint);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.MAKE_API_TOKEN}`,
        'X-Team-Id': process.env.MAKE_TEAM_ID,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          } else {
            resolve({
              statusCode: res.statusCode,
              data: parsedData
            });
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse response: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Deploys a single blueprint file to Make.com
 * @param {string} filePath - Path to the blueprint JSON file
 * @returns {Promise<Object>} Deployment result
 */
async function deployBlueprint(filePath) {
  console.log(`📋 Processing blueprint: ${filePath}`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read and parse the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let blueprintData;
    
    try {
      blueprintData = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error(`Invalid JSON in ${filePath}: ${parseError.message}`);
    }

    // Make API request to import blueprint
    const response = await makeApiRequest(IMPORT_ENDPOINT, blueprintData);
    
    // Extract scenario ID from response
    const scenarioId = response.data?.scenarioId || response.data?.id || 'unknown';
    
    console.log(`✅ Imported: ${path.basename(filePath)} -> Scenario ID: ${scenarioId}`);
    
    return {
      success: true,
      filePath,
      scenarioId,
      statusCode: response.statusCode
    };
    
  } catch (error) {
    console.error(`❌ Failed to deploy ${filePath}: ${error.message}`);
    
    return {
      success: false,
      filePath,
      error: error.message
    };
  }
}

/**
 * Main function - reads file paths from STDIN and processes each one
 */
async function main() {
  console.log('🚀 Make.com Blueprint Deployment Starting...');
  console.log(`📡 API Endpoint: ${MAKE_API_BASE}${IMPORT_ENDPOINT}`);
  console.log(`👥 Team ID: ${process.env.MAKE_TEAM_ID}`);
  console.log('');

  // Read from STDIN
  let stdinData = '';
  
  return new Promise((resolve) => {
    // Check if STDIN has data
    if (process.stdin.isTTY) {
      console.log('❌ Error: No input provided. Please pipe file paths to this script.');
      console.log('Usage: echo "path/to/blueprint.json" | node scripts/make-deploy.js');
      process.exit(1);
    }

    process.stdin.on('readable', () => {
      let chunk;
      while (null !== (chunk = process.stdin.read())) {
        stdinData += chunk;
      }
    });

    process.stdin.on('end', async () => {
      const filePaths = stdinData
        .trim()
        .split('\n')
        .filter(path => path.trim().length > 0);

      if (filePaths.length === 0) {
        console.log('ℹ️  No file paths provided');
        resolve();
        return;
      }

      console.log(`📁 Processing ${filePaths.length} blueprint file(s):`);
      filePaths.forEach(path => console.log(`   • ${path}`));
      console.log('');

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      // Process each file
      for (const filePath of filePaths) {
        const result = await deployBlueprint(filePath.trim());
        results.push(result);
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      }

      // Summary
      console.log('');
      console.log('📊 Deployment Summary:');
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Failed: ${failureCount}`);
      console.log(`   📋 Total: ${results.length}`);

      if (successCount > 0) {
        console.log('');
        console.log('🎯 Successfully Imported Scenarios:');
        results
          .filter(r => r.success)
          .forEach(r => {
            console.log(`   • ${path.basename(r.filePath)} -> ${r.scenarioId}`);
          });
      }

      if (failureCount > 0) {
        console.log('');
        console.log('⚠️  Failed Deployments:');
        results
          .filter(r => !r.success)
          .forEach(r => {
            console.log(`   • ${path.basename(r.filePath)}: ${r.error}`);
          });
        
        // Exit with error code if there were failures
        process.exit(1);
      }

      console.log('');
      console.log('✅ Make.com Blueprint Deployment Complete!');
      resolve();
    });
  });
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { deployBlueprint, makeApiRequest };