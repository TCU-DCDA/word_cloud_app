/**
 * Google Apps Script for Word Cloud App - IMPROVED VERSION
 * Sheet ID: 1J7S7gsCAmAhqKIG-U-jSJ63SErG8UZQNiFDa11ncnfE
 */

// CONFIGURATION
const SHEET_ID = '1J7S7gsCAmAhqKIG-U-jSJ63SErG8UZQNiFDa11ncnfE';
const SHEET_NAME = 'Responses';

/**
 * Handle HTTP GET requests
 */
function doGet(e) {
  console.log('doGet called with parameters:', e.parameter);
  return handleRequest(e, 'GET');
}

/**
 * Handle HTTP POST requests
 */
function doPost(e) {
  console.log('doPost called');
  console.log('postData:', e.postData);
  return handleRequest(e, 'POST');
}

/**
 * Main request handler with improved error handling
 */
function handleRequest(e, method) {
  try {
    // Set up CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    console.log(`Handling ${method} request`);
    
    // Handle GET request (fetch data)
    if (method === 'GET' && e.parameter && e.parameter.action === 'fetch') {
      console.log('Processing fetch request');
      const responses = getAllResponses();
      const result = {
        success: true,
        responses: responses,
        count: responses.length,
        timestamp: new Date().toISOString(),
        method: 'GET'
      };
      output.setContent(JSON.stringify(result));
      return output;
    }
    
    // Handle POST request (submit data)
    if (method === 'POST' && e.postData) {
      console.log('Processing POST request');
      console.log('POST data contents:', e.postData.contents);
      
      let data;
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        const errorResult = {
          success: false,
          error: 'Invalid JSON in request body',
          parseError: parseError.toString(),
          receivedData: e.postData.contents
        };
        output.setContent(JSON.stringify(errorResult));
        return output;
      }
      
      console.log('Parsed POST data:', data);
      
      if (data.action === 'submit') {
        const result = submitResponse(data.feelings, data.timestamp);
        output.setContent(JSON.stringify(result));
        return output;
      }
    }
    
    // Default response for unhandled requests
    const defaultResult = {
      success: false,
      error: 'Invalid request',
      method: method,
      received: {
        parameter: e.parameter || {},
        hasPostData: !!e.postData,
        postDataType: e.postData ? e.postData.type : null
      }
    };
    
    output.setContent(JSON.stringify(defaultResult));
    return output;
    
  } catch (error) {
    console.error('Error in handleRequest:', error);
    
    const errorOutput = ContentService.createTextOutput();
    errorOutput.setMimeType(ContentService.MimeType.JSON);
    
    const errorResult = {
      success: false,
      error: 'Server error',
      details: error.toString(),
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    errorOutput.setContent(JSON.stringify(errorResult));
    return errorOutput;
  }
}

/**
 * Submit a response to the Google Sheet
 */
function submitResponse(feelings, timestamp) {
  try {
    console.log('submitResponse called with:', { feelings, timestamp });
    
    if (!feelings || feelings.trim() === '') {
      return {
        success: false,
        error: 'Feelings text is required'
      };
    }
    
    const sheet = getSheet();
    if (!sheet) {
      return {
        success: false,
        error: 'Could not access the spreadsheet'
      };
    }
    
    // Create timestamp if not provided
    const submissionTime = timestamp || new Date().toISOString();
    
    // Count words in the response
    const wordCount = feelings.trim().split(/\s+/).length;
    
    // Add row to sheet
    const newRow = [submissionTime, feelings.trim(), wordCount];
    console.log('Adding row to sheet:', newRow);
    
    sheet.appendRow(newRow);
    
    console.log('Row added successfully');
    
    return {
      success: true,
      message: 'Response submitted successfully',
      data: {
        timestamp: submissionTime,
        feelings: feelings.trim(),
        wordCount: wordCount
      }
    };
    
  } catch (error) {
    console.error('Error in submitResponse:', error);
    return {
      success: false,
      error: 'Failed to submit response',
      details: error.toString()
    };
  }
}

/**
 * Get all responses from the Google Sheet
 */
function getAllResponses() {
  try {
    console.log('getAllResponses called');
    
    const sheet = getSheet();
    if (!sheet) {
      console.error('Could not access sheet');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    console.log('Retrieved data rows:', data.length);
    
    if (data.length <= 1) {
      console.log('No data rows (only headers or empty sheet)');
      return [];
    }
    
    // Skip header row and convert to objects
    const responses = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1] && row[1].toString().trim() !== '') { // Check if feelings column has data
        responses.push({
          timestamp: row[0],
          feelings: row[1].toString(),
          wordCount: row[2] || 0
        });
      }
    }
    
    console.log('Processed responses:', responses.length);
    return responses;
    
  } catch (error) {
    console.error('Error in getAllResponses:', error);
    return [];
  }
}

/**
 * Get the Google Sheet
 */
function getSheet() {
  try {
    console.log('Getting sheet with ID:', SHEET_ID);
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log('Spreadsheet opened successfully');
    
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.log('Sheet not found, creating new sheet:', SHEET_NAME);
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      
      // Add headers
      const headers = ['Timestamp', 'Feelings', 'Word Count'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#f0f0f0');
      
      console.log('New sheet created with headers');
    }
    
    return sheet;
    
  } catch (error) {
    console.error('Error in getSheet:', error);
    return null;
  }
}

/**
 * Test functions for debugging
 */
function testGetAllResponses() {
  const responses = getAllResponses();
  console.log('Test getAllResponses result:', responses);
  return responses;
}

function testSubmitResponse() {
  const result = submitResponse('Test response from Google Apps Script', new Date().toISOString());
  console.log('Test submitResponse result:', result);
  return result;
}
