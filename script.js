// Configuration - UPDATE THESE VALUES
const CONFIG = {
    // Replace with your Google Apps Script Web App URL (after deployment)
    GOOGLE_SCRIPT_URL: 'YOUR_GOOGLE_SCRIPT_URL_HERE',
    
    // Update interval in milliseconds (10 seconds)
    UPDATE_INTERVAL: 10000,
    
    // Word cloud settings
    WORDCLOUD_OPTIONS: {
        list: [],
        gridSize: Math.round(16 * 800 / 1024),
        weightFactor: function(size) {
            return Math.pow(size, 2.3) * 800 / 1024;
        },
        fontFamily: 'Times, serif',
        color: function() {
            const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
            return colors[Math.floor(Math.random() * colors.length)];
        },
        rotateRatio: 0.5,
        rotationSteps: 2,
        backgroundColor: '#fafafa',
        click: function(item) {
            console.log(item[0] + ': ' + item[1]);
        }
    }
};

// Global variables
let updateTimer;
let wordFrequency = {};
let totalResponses = 0;

// DOM elements
const form = document.getElementById('feelingsForm');
const textarea = document.getElementById('feelingsText');
const submitBtn = document.getElementById('submitBtn');
const submitMessage = document.getElementById('submitMessage');
const charCounter = document.querySelector('.char-counter');
const responseCount = document.getElementById('responseCount');
const lastUpdate = document.getElementById('lastUpdate');
const wordcloudCanvas = document.getElementById('wordcloud');
const loadingMessage = document.getElementById('loadingMessage');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    
    // Check if Google Script URL is configured
    if (CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
        showMessage('Demo mode: Google Sheets integration not configured yet.', 'error');
        startDemoMode();
    } else {
        fetchAndUpdateWordCloud();
        startAutoUpdate();
    }
    
    // Initial word cloud render
    renderWordCloud();
}

function setupEventListeners() {
    // Character counter
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        charCounter.textContent = `${length}/500`;
        
        if (length > 450) {
            charCounter.style.color = '#e53e3e';
        } else {
            charCounter.style.color = '#718096';
        }
    });

    // Form submission
    form.addEventListener('submit', handleSubmit);
    
    // Auto-resize canvas on window resize
    window.addEventListener('resize', debounce(handleResize, 300));
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const feelings = textarea.value.trim();
    if (!feelings) {
        showMessage('Please share your feelings before submitting.', 'error');
        return;
    }

    // Disable form and show loading state
    setSubmitState(true);
    
    try {
        if (CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
            // Demo mode - simulate submission
            await simulateSubmission(feelings);
        } else {
            // Real submission to Google Sheets
            await submitToGoogleSheets(feelings);
        }
        
        // Clear form and show success
        textarea.value = '';
        charCounter.textContent = '0/500';
        showMessage('Thank you for sharing! Your response has been added to our word cloud.', 'success');
        
        // Update word cloud immediately
        setTimeout(() => {
            fetchAndUpdateWordCloud();
        }, 1000);
        
    } catch (error) {
        console.error('Submission error:', error);
        showMessage('Sorry, there was an error submitting your response. Please try again.', 'error');
    } finally {
        setSubmitState(false);
    }
}

async function submitToGoogleSheets(feelings) {
    console.log('Submitting to Google Sheets:', feelings);
    console.log('Using URL:', CONFIG.GOOGLE_SCRIPT_URL);
    
    // Try form data approach for better Google Apps Script compatibility
    const formData = new FormData();
    formData.append('action', 'submit');
    formData.append('feelings', feelings);
    formData.append('timestamp', new Date().toISOString());
    
    console.log('Form data created');
    
    const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        redirect: 'follow',
        body: formData
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`Network response was not ok: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Response result:', result);
    return result;
}

async function fetchAndUpdateWordCloud() {
    try {
        console.log('Fetching word cloud data...');
        loadingMessage.style.display = 'block';
        
        let data;
        if (CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
            // Demo mode
            data = getDemoData();
        } else {
            // Fetch from Google Sheets
            const fetchUrl = `${CONFIG.GOOGLE_SCRIPT_URL}?action=fetch`;
            console.log('Fetching from:', fetchUrl);
            
            const response = await fetch(fetchUrl, {
                redirect: 'follow'
            });
            console.log('Fetch response status:', response.status);
            console.log('Fetch response ok:', response.ok);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Fetch error text:', errorText);
                throw new Error(`Fetch failed: ${response.status} - ${errorText}`);
            }
            
            data = await response.json();
            console.log('Fetched data:', data);
        }
        
        updateWordFrequency(data.responses || []);
        renderWordCloud();
        updateStats();
        
    } catch (error) {
        console.error('Error fetching data:', error);
        showMessage('Error loading word cloud data: ' + error.message, 'error');
    } finally {
        loadingMessage.style.display = 'none';
    }
}

function updateWordFrequency(responses) {
    wordFrequency = {};
    totalResponses = responses.length;
    
    // Common words to filter out
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
        'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
        'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
        'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
        'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
        'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'will',
        'would', 'should', 'could', 'can', 'may', 'might', 'must', 'shall'
    ]);
    
    responses.forEach(response => {
        const words = response.feelings
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
        
        words.forEach(word => {
            wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });
    });
}

function renderWordCloud() {
    const wordList = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100); // Limit to top 100 words
    
    if (wordList.length === 0) {
        const ctx = wordcloudCanvas.getContext('2d');
        ctx.clearRect(0, 0, wordcloudCanvas.width, wordcloudCanvas.height);
        ctx.fillStyle = '#718096';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Waiting for responses...', wordcloudCanvas.width / 2, wordcloudCanvas.height / 2);
        return;
    }
    
    CONFIG.WORDCLOUD_OPTIONS.list = wordList;
    WordCloud(wordcloudCanvas, CONFIG.WORDCLOUD_OPTIONS);
}

function updateStats() {
    responseCount.textContent = `${totalResponses} response${totalResponses !== 1 ? 's' : ''}`;
    lastUpdate.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
}

function setSubmitState(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    if (isSubmitting) {
        submitBtn.innerHTML = '<div class="spinner"></div>Submitting...';
    } else {
        submitBtn.innerHTML = 'Share My Feelings';
    }
}

function showMessage(text, type) {
    submitMessage.textContent = text;
    submitMessage.className = `message ${type}`;
    submitMessage.classList.remove('hidden');
    
    setTimeout(() => {
        submitMessage.classList.add('hidden');
    }, 5000);
}

function startAutoUpdate() {
    updateTimer = setInterval(fetchAndUpdateWordCloud, CONFIG.UPDATE_INTERVAL);
}

function handleResize() {
    const container = wordcloudCanvas.parentElement;
    const rect = container.getBoundingClientRect();
    wordcloudCanvas.width = rect.width - 2; // Account for border
    renderWordCloud();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Demo mode functions (for testing without Google Sheets)
function startDemoMode() {
    console.log('Running in demo mode');
    // Add some demo data every few seconds
    setTimeout(() => {
        addDemoResponse('excited nervous curious');
        fetchAndUpdateWordCloud();
    }, 2000);
    
    setTimeout(() => {
        addDemoResponse('challenging overwhelming potential');
        fetchAndUpdateWordCloud();
    }, 5000);
    
    setTimeout(() => {
        addDemoResponse('creative problem-solving innovative');
        fetchAndUpdateWordCloud();
    }, 8000);
}

let demoResponses = [
    {
        timestamp: '2025-06-03T16:00:00.000Z',
        feelings: 'I am excited about learning to code and creating amazing projects! This feels challenging but rewarding.',
        wordCount: 16
    },
    {
        timestamp: '2025-06-03T16:05:00.000Z',
        feelings: 'Nervous but excited to start my coding journey. Looking forward to building websites and apps.',
        wordCount: 15
    },
    {
        timestamp: '2025-06-03T16:10:00.000Z',
        feelings: 'I feel motivated and ready to learn. Coding seems like a superpower that can solve real problems.',
        wordCount: 17
    },
    {
        timestamp: '2025-06-03T16:15:00.000Z',
        feelings: 'Curious about how websites work behind the scenes. Ready to dive into HTML, CSS, and JavaScript.',
        wordCount: 16
    },
    {
        timestamp: '2025-06-03T16:20:00.000Z',
        feelings: 'I feel empowered knowing I can learn to create technology instead of just consuming it.',
        wordCount: 16
    },
    {
        timestamp: '2025-06-03T16:25:00.000Z',
        feelings: 'Excited but overwhelmed. There seems to be so much to learn, but I am ready for the challenge.',
        wordCount: 18
    },
    {
        timestamp: '2025-06-03T16:30:00.000Z',
        feelings: 'I feel like I am about to unlock a new world of possibilities and creativity through programming.',
        wordCount: 17
    },
    {
        timestamp: '2025-06-03T16:35:00.000Z',
        feelings: 'Ready to problem-solve and think logically. Coding feels like learning a new language of innovation.',
        wordCount: 16
    }
];

function addDemoResponse(feelings) {
    demoResponses.push({
        feelings: feelings,
        timestamp: new Date().toISOString()
    });
}

function getDemoData() {
    return { responses: demoResponses };
}

async function simulateSubmission(feelings) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    addDemoResponse(feelings);
    return { success: true };
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (updateTimer) {
        clearInterval(updateTimer);
    }
});
