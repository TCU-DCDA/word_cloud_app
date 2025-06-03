/**
 * Google Apps Script for Word Cloud App - PRODUCTION VERSION
 * Sheet ID: 1J7S7gsCAmAhqKIG-U-jSJ63SErG8UZQNiFDa11ncnfE
 */

// CONFIGURATION
const SHEET_ID = '1J7S7gsCAmAhqKIG-U-jSJ63SErG8UZQNiFDa11ncnfE';
const SHEET_NAME = 'Responses';

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
    if (e.parameter && e.parameter.action === 'fetch') {
      console.log('Handling fetch request');
      const responses = getAllResponses();
      const result = {
        success: true,
        responses: responses,
        count: responses.length,
        timestamp: new Date().toISOString()
      };
      output.setContent(JSON.stringify(result));
      return output;
    }
    
    // Handle POST request (submit data)
    if (e.postData) {
      console.log('Handling POST request');
      const data = JSON.parse(e.postData.contents);
      console.log('Received data:', data);
      
      if (data.action === 'submit') {
        const result = submitResponse(data.feelings, data.timestamp);
        output.setContent(JSON.stringify(result));
        return output;
      }
    }
    
    // Test endpoint
    if (e.parameter && e.parameter.action === 'test') {
      const result = testSetup();
      output.setContent(JSON.stringify(result));
      return output;
    }
    
    // Default response
    console.log('Invalid request', e);
    output.setContent(JSON.stringify({
      success: false,
      error: 'Invalid request',
      received: {
        parameter: e.parameter,
        hasPostData: !!e.postData
      }
    }));
    return output;
    
  } catch (error) {
    console.error('Error in handleRequest:', error);
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    output.setContent(JSON.stringify({
      success: false,
      error: error.toString(),
      stack: error.stack
    }));
    return output;
  }
}

/**
 * Submit a new response to the Google Sheet
 */
function submitResponse(feelings, timestamp) {
  try {
    console.log('Submitting response:', feelings);
    const sheet = getOrCreateSheet();
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      console.log('Adding headers to empty sheet');
      sheet.getRange(1, 1, 1, 3).setValues([['Timestamp', 'Feelings', 'Word Count']]);
      sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
    }
    
    // Count words for analytics
    const wordCount = feelings.trim().split(/\s+/).length;
    
    // Add the new response
    const row = [
      new Date(timestamp),
      feelings,
      wordCount
    ];
    
    console.log('Adding row:', row);
    sheet.appendRow(row);
    
    console.log('Response submitted successfully');
    return {
      success: true,
      message: 'Response submitted successfully',
      data: {
        feelings: feelings,
        wordCount: wordCount,
        timestamp: timestamp
      }
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
    console.log('Getting all responses');
    const sheet = getOrCreateSheet();
    const lastRow = sheet.getLastRow();
    
    console.log('Sheet last row:', lastRow);
    
    if (lastRow <= 1) {
      console.log('No data or only headers');
      return []; // No data or only headers
    }
    
    // Get all data (skip header row)
    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    console.log('Raw data from sheet:', data);
    
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
    console.log('Accessing sheet with ID:', SHEET_ID);
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('Spreadsheet accessed:', spreadsheet.getName());
    
    let sheet;
    
    try {
      sheet = spreadsheet.getSheetByName(SHEET_NAME);
      console.log('Found existing sheet:', SHEET_NAME);
    } catch (e) {
      // Sheet doesn't exist, create it
      console.log('Creating new sheet:', SHEET_NAME);
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }
    
    return sheet;
    
  } catch (error) {
    console.error('Error accessing sheet:', error);
    throw new Error('Could not access Google Sheet. Please check the SHEET_ID and permissions.');
  }
}

/**
 * Test function to verify setup
 */
function testSetup() {
  try {
    console.log('Running setup test');
    const sheet = getOrCreateSheet();
    console.log('Sheet access successful');
    console.log('Sheet name:', sheet.getName());
    console.log('Last row:', sheet.getLastRow());
    
    // Test submission
    const testResult = submitResponse('Test response from Apps Script setup', new Date().toISOString());
    console.log('Test submission result:', testResult);
    
    // Test retrieval
    const responses = getAllResponses();
    console.log('Retrieved responses:', responses.length);
    
    return {
      success: true,
      message: 'Setup test completed successfully',
      sheetName: sheet.getName(),
      responseCount: responses.length,
      testSubmission: testResult
    };
    
  } catch (error) {
    console.error('Setup test failed:', error);
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
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
