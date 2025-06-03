/**
 * SIMPLIFIED Google Apps Script for Testing
 * Use this version first to test the connection
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Handle GET request (fetch data)
    if (e.parameter.action === 'fetch') {
      const result = {
        success: true,
        responses: [
          { feelings: "excited nervous", timestamp: new Date().toISOString() },
          { feelings: "curious hopeful", timestamp: new Date().toISOString() }
        ],
        count: 2,
        message: "Test connection successful!"
      };
      output.setContent(JSON.stringify(result));
      return output;
    }
    
    // Handle POST request (submit data)
    if (e.postData) {
      const data = JSON.parse(e.postData.contents);
      
      if (data.action === 'submit') {
        // For now, just return success without saving to sheets
        const result = {
          success: true,
          message: 'Test submission successful! (Not saved to sheets yet)',
          receivedData: {
            feelings: data.feelings,
            timestamp: data.timestamp
          }
        };
        output.setContent(JSON.stringify(result));
        return output;
      }
    }
    
    // Default response
    output.setContent(JSON.stringify({
      success: false,
      error: 'Invalid request',
      received: e
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
