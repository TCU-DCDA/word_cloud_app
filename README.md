# Real-Time Word Cloud for Student Feelings

A web application designed to collect and visualize student feelings about starting their coding journey on the first day of an intro coding class. Students submit short paragraphs about their feelings, and the app generates a beautiful, real-time word cloud that updates as responses come in.

## 🚀 Live Demo

**Visit the live application:** [https://tcu-dcda.github.io/word_cloud_app/](https://tcu-dcda.github.io/word_cloud_app/)

The app is currently running in **demo mode** with sample student responses to showcase the word cloud functionality. Students can submit new responses and see the word cloud update in real-time.

## 📚 Classroom Usage

### For Students
1. Visit [https://tcu-dcda.github.io/word_cloud_app/](https://tcu-dcda.github.io/word_cloud_app/)
2. Write a short paragraph (up to 500 characters) about how you feel starting your coding journey
3. Click "Share My Feelings" to submit
4. Watch the word cloud update with everyone's responses!

### For Instructors
- Share the URL with your class: `https://tcu-dcda.github.io/word_cloud_app/`
- Project the word cloud on a screen for the whole class to see
- The word cloud updates automatically every 10 seconds
- Common words (like "the", "and", "I") are filtered out to focus on meaningful content
- Perfect for ice-breaker activities and gauging student sentiment

## ✨ Features

- **Real-time updates**: Word cloud refreshes every 10 seconds with new submissions
- **Responsive design**: Works on desktop, tablet, and mobile devices
- **Beautiful visualization**: Colorful word cloud with varying sizes based on frequency
- **Smart filtering**: Removes common stop words to highlight meaningful content
- **Character limit**: 500-character limit encourages concise, thoughtful responses
- **Live statistics**: Shows total number of responses and last update time

## 🔧 Technical Setup (Optional)

The app currently runs in demo mode. To connect it to Google Sheets for persistent data storage:

### Google Sheets Integration

1. **Create a Google Sheet**
   - Create a new Google Sheet
   - Rename the first tab to "Responses"
   - Add headers: `Timestamp | Feelings | Word Count`

2. **Deploy Google Apps Script**
   - Copy the code from `google-apps-script-formdata.js`
   - Create a new Google Apps Script project
   - Replace the default code with the copied code
   - Update the `SHEET_ID` with your Google Sheet ID
   - Deploy as a web app with "Anyone" access

3. **Update the Application**
   - Edit `script.js` 
   - Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with your deployed Google Apps Script URL
   - The app will automatically switch from demo mode to live mode

### Local Development

```bash
# Clone the repository
git clone https://github.com/TCU-DCDA/word_cloud_app.git
cd word_cloud_app

# Start local server (to avoid CORS issues)
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

## 📁 Project Structure

```
word_cloud_app/
├── index.html              # Main application interface
├── style.css              # Responsive styling
├── script.js              # Frontend logic and word cloud generation
├── README.md              # This documentation
├── add-test-data.html     # Testing tool for submissions
├── debug-test.html        # Debugging interface
└── google-apps-script-*.js # Backend code for Google Sheets integration
```

## 🎨 Customization

### Word Cloud Appearance
Edit the `WORDCLOUD_OPTIONS` in `script.js`:
- Colors: Modify the `color` function
- Font: Change `fontFamily`
- Size scaling: Adjust `weightFactor`
- Rotation: Modify `rotateRatio` and `rotationSteps`

### Content Filtering
Update the `stopWords` set in `updateWordFrequency()` to add/remove filtered words.

### Update Frequency
Change `UPDATE_INTERVAL` in the config (default: 10 seconds).

## 🏫 Classroom Tips

1. **Pre-class Setup**: Test the URL and ensure it works on your classroom computer
2. **Clear Instructions**: Show students the character limit and encourage honest, thoughtful responses
3. **Privacy**: Remind students that responses are anonymous but visible to the class
4. **Discussion Starter**: Use the final word cloud as a springboard for discussion about coding expectations and feelings
5. **Screenshots**: Capture the final word cloud for future reference or class materials

## 🛠️ Troubleshooting

### App shows "Demo mode" message
- This is normal! The app is configured to run with sample data
- Students can still submit responses and see them added to the word cloud
- To connect to Google Sheets, follow the "Google Sheets Integration" steps above

### Word cloud not updating
- Check your internet connection
- Refresh the page
- Verify the browser supports modern JavaScript (Chrome, Firefox, Safari, Edge)

### Form submissions not working
- Ensure JavaScript is enabled in the browser
- Try refreshing the page
- Check browser console for error messages (F12 → Console tab)

## 📊 Demo Data

The app includes 8 realistic sample responses about starting a coding journey:
- Responses range from excited to nervous to overwhelmed
- Demonstrates various emotions and attitudes toward learning to code
- Shows how the word cloud emphasizes key themes like "excited", "learning", "challenging", and "creative"

## 🤝 Contributing

This project is designed for educational use. Feel free to:
- Fork the repository for your own classroom
- Customize the styling and functionality
- Add new features like sentiment analysis or response categories
- Share improvements back to the community

## 📄 License

Open source project designed for educational use in coding classrooms.

---

**Ready to use!** Share [https://tcu-dcda.github.io/word_cloud_app/](https://tcu-dcda.github.io/word_cloud_app/) with your students and watch their feelings come to life in the word cloud! 🎓✨
