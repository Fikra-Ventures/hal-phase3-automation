#!/usr/bin/env node

/**
 * Make.com Blueprint Auto-Import Script
 * 
 * This script reads newline-delimited file paths from STDIN,
 * filters for make/blueprints/*.json files, and uploads them
 * to Make.com via their API.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Validate required environment variables
const MAKE_API_TOKEN = process.env.MAKE_API_TOKEN;
const MAKE_TEAM_ID = process.env.MAKE_TEAM_ID;

if (!MAKE_API_TOKEN) {
  console.error('❌ Error: MAKE_API_TOKEN environment variable is required');
  process.exit(1);
}

if (!MAKE_TEAM_ID) {
  console.error('❌ Error: MAKE_TEAM_ID environment variable is required');
  process.exit(1);
}

/**
 * Makes a POST request to the Make.com API
 * @param {string} blueprintData - JSON string of the blueprint data
 * @param {string} filename - Name of the blueprint file for logging
 * @returns {Promise<Object>} - API response
 */
function uploadBlueprint(blueprintData, filename) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(blueprintData);
    
    const options = {
      hostname: 'api.make.com',
      port: 443,
      path: '/v2/blueprints/import',
      method: 'POST',
      headers: {
        'Authorization': `Token ${MAKE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Team-Id': MAKE_TEAM_ID,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(responseData);
            resolve({
              success: true,
              statusCode: res.statusCode,
              data: parsed,
              filename: filename
            });
          } catch (e) {
            resolve({
              success: true,
              statusCode: res.statusCode,
              data: responseData,
              filename: filename
            });
          }
        } else {
          reject({
            success: false,
            statusCode: res.statusCode,
            error: responseData,
            filename: filename
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        success: false,
        error: error.message,
        filename: filename
      });
    });

    req.write(data);
    req.end();
  });
}

/**
 * Processes a single blueprint file
 * @param {string} filePath - Path to the blueprint file
 */
async function processBlueprint(filePath) {
  try {
    console.log(`📄 Processing blueprint: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filePath} - file not found`);
      return;
    }

    // Read and parse blueprint file
    const blueprintContent = fs.readFileSync(filePath, 'utf8');
    let blueprintData;
    
    try {
      blueprintData = JSON.parse(blueprintContent);
    } catch (parseError) {
      console.error(`❌ Error parsing JSON in ${filePath}: ${parseError.message}`);
      return;
    }

    // Upload to Make.com
    const result = await uploadBlueprint(blueprintData, path.basename(filePath));
    
    if (result.success) {
      console.log(`✅ Successfully uploaded ${result.filename}`);
      
      // Log scenario ID if available
      if (result.data && result.data.scenario && result.data.scenario.id) {
        console.log(`🆔 Created scenario ID: ${result.data.scenario.id}`);
      } else if (result.data && result.data.id) {
        console.log(`🆔 Created scenario ID: ${result.data.id}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Failed to upload ${path.basename(filePath)}: ${error.error || error.message}`);
    console.error(`   Status Code: ${error.statusCode || 'N/A'}`);
    process.exitCode = 1;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Make.com Blueprint Auto-Import Starting...');
  console.log(`🔑 Using Team ID: ${MAKE_TEAM_ID}`);
  
  // Read file paths from STDIN
  let input = '';
  
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      console.log('ℹ️  No input detected from STDIN');
      resolve();
      return;
    }

    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (chunk) => {
      input += chunk;
    });
    
    process.stdin.on('end', async () => {
      const filePaths = input.trim().split('\n').filter(line => line.trim());
      
      if (filePaths.length === 0) {
        console.log('ℹ️  No file paths provided');
        resolve();
        return;
      }
      
      // Filter for make/blueprints/*.json files only
      const blueprintFiles = filePaths.filter(filePath => {
        const normalizedPath = filePath.trim();
        return normalizedPath.startsWith('make/blueprints/') && normalizedPath.endsWith('.json');
      });
      
      console.log(`📂 Found ${blueprintFiles.length} blueprint files to process`);
      
      if (blueprintFiles.length === 0) {
        console.log('ℹ️  No make/blueprints/*.json files found in input');
        resolve();
        return;
      }
      
      // Process each blueprint file
      for (const filePath of blueprintFiles) {
        await processBlueprint(filePath.trim());
      }
      
      console.log('🎉 Make.com Blueprint Auto-Import Complete!');
      resolve();
    });
  });
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}

module.exports = { uploadBlueprint, processBlueprint };