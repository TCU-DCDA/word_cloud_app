# Google Apps Script Deployment Guide

## Step 1: Deploy the Google Apps Script

1. **Open Google Apps Script**
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"

2. **Set up the Script**
   - Replace the default `Code.gs` content with the code from `google-apps-script-production.js`
   - Save the project (Ctrl+S or Cmd+S)
   - Give it a meaningful name like "Word Cloud App Backend"

3. **Deploy as Web App**
   - Click the "Deploy" button (top right)
   - Choose "New deployment"
   - Click the gear icon next to "Type" and select "Web app"
   - Fill in the deployment settings:
     - **Description**: "Word Cloud App API"
     - **Execute as**: "Me"
     - **Who has access**: "Anyone" (for public classroom use)
   - Click "Deploy"
   - **Copy the Web App URL** - you'll need this!

4. **Authorize the Script**
   - When prompted, click "Authorize access"
   - Choose your Google account
   - Click "Advanced" → "Go to [Project Name] (unsafe)" if warned
   - Click "Allow"

## Step 2: Update the Frontend Configuration

Once you have the Web App URL from step 1, update the frontend:

1. **Edit script.js**
   - Find line with `GOOGLE_SCRIPT_URL: 'YOUR_GOOGLE_SCRIPT_URL_HERE'`
   - Replace `'YOUR_GOOGLE_SCRIPT_URL_HERE'` with your actual Web App URL
   - Example: `GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycby.../exec'`

2. **Switch to Live Mode**
   - Find line with `USE_DEMO_MODE: true`
   - Change to `USE_DEMO_MODE: false`

## Step 3: Test the Integration

1. **Use the Integration Test Page**
   - Open `integration-test.html` in your browser
   - Click "Test Google Sheets Connection"
   - Submit a test response
   - Check your Google Sheet to verify data is being saved

2. **Test the Main App**
   - Open `index.html`
   - Submit a response
   - Verify it appears in the word cloud and saves to Google Sheets

## Step 4: Deploy to GitHub Pages

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Configure Google Apps Script URL for production"
   git push origin main
   ```

2. **Your app will be live at**: https://tcu-dcda.github.io/word_cloud_app/

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Make sure the Google Apps Script is deployed as a web app with "Anyone" access
   - The URL should end with `/exec`, not `/dev`

2. **Authorization Issues**
   - Re-run the authorization process in Google Apps Script
   - Make sure the script has permission to access Google Sheets

3. **Data Not Saving**
   - Check the Google Apps Script execution log for errors
   - Verify the Sheet ID is correct in the script
   - Make sure the sheet has a tab named "Responses"

4. **Integration Test Failing**
   - Check browser console for error messages
   - Verify the Google Apps Script URL is correct
   - Test the Google Apps Script directly in the Apps Script editor

## Your Configuration:
- **Sheet ID**: `1J7S7gsCAmAhqKIG-U-jSJ63SErG8UZQNiFDa11ncnfE`
- **Sheet Name**: `Responses` (this tab should exist in your sheet)
- **Web App URL**: [TO BE FILLED IN AFTER DEPLOYMENT]

## Next Steps After Deployment:
1. Test with a few students before the actual class
2. Consider creating a backup/export mechanism for responses
3. Monitor the Google Apps Script execution quota (100 executions per day for free accounts)
