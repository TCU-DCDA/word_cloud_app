/**
 * Google Apps Script for Word Cloud App
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create a new project
 * 3. Replace the default code with this code
 * 4. Set up a Google Sheet:
 *    - Create a new Google Sheet
 *    - Note the Sheet ID from the URL
 *    - Replace SHEET_ID below with your sheet's ID
 * 5. Deploy as web app:
 *    - Click Deploy > New Deployment
 *    - Choose "Web app" as type
 *    - Set execute as "Me"
 *    - Set access to "Anyone"
 *    - Deploy and copy the web app URL
 * 6. Update the CONFIG.GOOGLE_SCRIPT_URL in script.js with your web app URL
 */

// CONFIGURATION - UPDATE THESE VALUES
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your Google Sheet ID
const SHEET_NAME = 'Responses'; // Name of the sheet tab

/**
 * Handle HTTP requests (both GET and POST)
 */
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

/**
 * Main request handler
 */
function handleRequest(e) {
  try {
    // Set up CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Handle GET request (fetch data)
    if (e.parameter.action === 'fetch') {
      const responses = getAllResponses();
      const result = {
        success: true,
        responses: responses,
        count: responses.length
      };
      output.setContent(JSON.stringify(result));
      return output;
    }
    
    // Handle POST request (submit data)
    if (e.postData) {
      const data = JSON.parse(e.postData.contents);
      
      if (data.action === 'submit') {
        const result = submitResponse(data.feelings, data.timestamp);
        output.setContent(JSON.stringify(result));
        return output;
      }
    }
    
    // Default response
    output.setContent(JSON.stringify({
      success: false,
      error: 'Invalid request'
    }));
    return output;
    
  } catch (error) {
    console.error('Error in handleRequest:', error);
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
    return output;
  }
}

/**
 * Submit a new response to the Google Sheet
 */
function submitResponse(feelings, timestamp) {
  try {
    const sheet = getOrCreateSheet();
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 3).setValues([['Timestamp', 'Feelings', 'Word Count']]);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    }
    
    // Count words for analytics
    const wordCount = feelings.trim().split(/\s+/).length;
    
    // Add the new response
    sheet.appendRow([
      new Date(timestamp),
      feelings,
      wordCount
    ]);
    
    console.log('Response submitted successfully');
    return {
      success: true,
      message: 'Response submitted successfully'
    };
    
  } catch (error) {
    console.error('Error submitting response:', error);
    return {
      success: false,
      error: 'Failed to submit response: ' + error.toString()
    };
  }
}

/**
 * Get all responses from the Google Sheet
 */
function getAllResponses() {
  try {
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return []; // No data or only headers
    }
    
    // Get all data (skip header row)
    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    
    // Convert to array of objects
    const responses = data.map(row => ({
      timestamp: row[0],
      feelings: row[1],
      wordCount: row[2]
    }));
    
    console.log(`Retrieved ${responses.length} responses`);
    return responses;
    
  } catch (error) {
    console.error('Error getting responses:', error);
    return [];
  }
}

/**
 * Get or create the Google Sheet
 */
function getOrCreateSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet;
    
    try {
      sheet = spreadsheet.getSheetByName(SHEET_NAME);
    } catch (e) {
      // Sheet doesn't exist, create it
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }
    
    return sheet;
    
  } catch (error) {
    console.error('Error accessing sheet:', error);
    throw new Error('Could not access Google Sheet. Please check the SHEET_ID.');
  }
}

/**
 * Test function to verify setup
 */
function testSetup() {
  try {
    const sheet = getOrCreateSheet();
    console.log('Sheet access successful');
    console.log('Sheet name:', sheet.getName());
    console.log('Last row:', sheet.getLastRow());
    
    // Test submission
    const testResult = submitResponse('Test response from Apps Script', new Date().toISOString());
    console.log('Test submission result:', testResult);
    
    // Test retrieval
    const responses = getAllResponses();
    console.log('Retrieved responses:', responses.length);
    
    return {
      success: true,
      message: 'Setup test completed successfully',
      sheetName: sheet.getName(),
      responseCount: responses.length
    };
    
  } catch (error) {
    console.error('Setup test failed:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Clean up test data (run this if needed)
 */
function cleanupTestData() {
  try {
    const sheet = getOrCreateSheet();
    
    // Clear all data except headers
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 3).clear();
    }
    
    console.log('Test data cleaned up');
    return { success: true, message: 'Test data cleaned up' };
    
  } catch (error) {
    console.error('Error cleaning up:', error);
    return { success: false, error: error.toString() };
  }
}
