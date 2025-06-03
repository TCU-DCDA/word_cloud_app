# Coding Journey Word Cloud

A real-time word cloud application for collecting and visualizing student feelings about starting their coding journey. Perfect for first-day introductions in coding classes.

## Features

- **Real-time Updates**: Word cloud updates automatically as new responses come in
- **Google Sheets Integration**: Uses Google Sheets as a database via Google Apps Script
- **Responsive Design**: Works great for classroom projection and individual devices
- **Anonymous Collection**: No personal information required from students
- **Live Statistics**: Shows response count and last update time
- **Word Filtering**: Removes common stop words to highlight meaningful content

## Quick Start

### Option 1: Demo Mode (Immediate Use)
1. Open `index.html` in your browser
2. The app will run in demo mode with simulated data
3. Perfect for testing the interface before setting up Google Sheets

### Option 2: Full Setup with Google Sheets

#### Step 1: Set up Google Sheets
1. Create a new Google Sheet
2. Note the Sheet ID from the URL (the long string between `/d/` and `/edit`)

#### Step 2: Deploy Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Create a new project
3. Replace the default code with the contents of `google-apps-script.js`
4. Update the `SHEET_ID` variable with your Google Sheet ID
5. Deploy as web app:
   - Click **Deploy** > **New Deployment**
   - Choose **Web app** as type
   - Set execute as **Me**
   - Set access to **Anyone**
   - Click **Deploy**
   - Copy the web app URL

#### Step 3: Configure the Frontend
1. Open `script.js`
2. Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with your web app URL
3. Save the file

#### Step 4: Test the Setup
1. Open `index.html` in your browser
2. Submit a test response
3. Check your Google Sheet to see if the data appears

## Deployment Options

### GitHub Pages (Recommended)
1. Create a new GitHub repository
2. Upload all files to the repository
3. Enable GitHub Pages in repository settings
4. Your app will be available at `https://username.github.io/repository-name`

### Local Development
1. Open `index.html` directly in your browser
2. Or use a local server: `python -m http.server 8000`

## Usage in Class

1. **Before Class**: Set up the app and test it with a few sample responses
2. **Project the App**: Display the word cloud on a screen visible to all students
3. **Share the Link**: Give students the URL to submit their responses
4. **Watch Together**: As responses come in, the word cloud will update in real-time
5. **Discuss**: Use the emerging words as conversation starters about coding fears, excitement, and expectations

## Customization

### Word Cloud Appearance
Edit the `WORDCLOUD_OPTIONS` in `script.js`:
- `color`: Change color scheme
- `fontFamily`: Change font
- `rotateRatio`: Adjust word rotation
- `weightFactor`: Adjust size scaling

### Update Frequency
Change `UPDATE_INTERVAL` in `script.js` (default: 10 seconds)

### Form Behavior
- Character limit: Currently set to 500 characters
- Validation: Requires non-empty text
- Feedback: Shows success/error messages

## Technical Details

### Architecture
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Word Cloud**: WordCloud2.js library
- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Updates**: Polling every 10 seconds

### Data Flow
1. Student submits feelings via form
2. JavaScript sends data to Google Apps Script
3. Apps Script saves to Google Sheets
4. Frontend polls for updates every 10 seconds
5. Word frequencies are calculated and displayed

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design
- No special plugins required

## Troubleshooting

### "Demo mode" message appears
- The Google Apps Script URL is not configured
- Check that you've updated `CONFIG.GOOGLE_SCRIPT_URL` in `script.js`

### Responses not appearing in Google Sheets
- Verify the Google Apps Script is deployed correctly
- Check that the SHEET_ID is correct
- Ensure the web app has "Anyone" access permissions

### Word cloud not updating
- Check browser console for errors
- Verify network connectivity
- Confirm Google Apps Script is responding (check Network tab in dev tools)

### CORS errors
- Ensure Google Apps Script is deployed as a web app
- Verify access permissions are set to "Anyone"

## Privacy & Data

- No personal information is collected
- Responses are stored anonymously in Google Sheets
- Timestamps are recorded for analytics only
- Data is not shared with third parties

## License

This project is open source and available under the MIT License.

## Support

For technical issues or questions:
1. Check the browser console for errors
2. Verify Google Apps Script deployment
3. Test with demo mode first
4. Review the troubleshooting section above

Perfect for educators who want to create an engaging, interactive first day experience while introducing students to real-time web applications!
