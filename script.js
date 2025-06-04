// Configuration - UPDATE THESE VALUES
const CONFIG = {
    // Replace with your Google Apps Script Web App URL (after deployment)
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbznDcgZ6Sd2Bco84Q3L6xqZ8D92TxD1JnpjiSbHB0JusulIrfgNWSdybWJ_WC0ZMveT-Q/exec',
    
    // Update interval in milliseconds (10 seconds)
    UPDATE_INTERVAL: 10000,
    
    // Word chart settings
    CHART_OPTIONS: {
        maxWords: 20,
        sentimentColors: {
            positive: '#22c55e', // Green
            negative: '#ef4444', // Red
            neutral: '#eab308'   // Yellow
        }
    },
    
    // Sentiment word lists
    SENTIMENT_WORDS: {
        positive: [
            'excited', 'amazing', 'awesome', 'great', 'good', 'excellent', 'fantastic', 'wonderful',
            'love', 'enjoy', 'happy', 'thrilled', 'enthusiastic', 'passionate', 'motivated',
            'confident', 'optimistic', 'hopeful', 'eager', 'ready', 'capable', 'strong',
            'creative', 'innovative', 'brilliant', 'smart', 'clever', 'talented', 'skilled',
            'successful', 'achievement', 'progress', 'growth', 'learning', 'opportunity',
            'potential', 'possibilities', 'future', 'career', 'dreams', 'goals', 'aspirations',
            'fun', 'interesting', 'fascinating', 'engaging', 'inspiring', 'empowering',
            'breakthrough', 'solution', 'success', 'accomplishment', 'victory', 'triumph'
        ],
        negative: [
            'scared', 'afraid', 'anxious', 'worried', 'nervous', 'stressed', 'overwhelmed',
            'difficult', 'hard', 'challenging', 'struggle', 'struggling', 'confused', 'lost',
            'frustrated', 'annoying', 'boring', 'tedious', 'exhausting', 'tiring',
            'impossible', 'hopeless', 'discouraged', 'defeated', 'failure', 'failed',
            'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'dislike',
            'complicated', 'complex', 'overwhelming', 'intimidating', 'scary', 'frightening',
            'doubt', 'uncertain', 'unsure', 'worried', 'concern', 'concerned', 'problem',
            'issues', 'obstacles', 'barriers', 'limitations', 'weakness', 'inadequate',
            'insufficient', 'lacking', 'missing', 'wrong', 'error', 'mistake', 'broken'
        ]
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
const wordChartContainer = document.getElementById('wordChart');
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
        fetchAndUpdateWordChart();
        startAutoUpdate();
    }
    
    // Initial word chart render
    renderWordChart();
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
        showMessage('Thank you for sharing! Your response has been added to our word chart.', 'success');
        
        // Update word chart immediately
        setTimeout(() => {
            fetchAndUpdateWordChart();
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

async function fetchAndUpdateWordChart() {
    try {
        console.log('Fetching word chart data...');
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
        renderWordChart();
        updateStats();
        
    } catch (error) {
        console.error('Error fetching data:', error);
        showMessage('Error loading word chart data: ' + error.message, 'error');
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

function analyzeSentiment(word) {
    const lowerWord = word.toLowerCase();
    
    if (CONFIG.SENTIMENT_WORDS.positive.includes(lowerWord)) {
        return 'positive';
    } else if (CONFIG.SENTIMENT_WORDS.negative.includes(lowerWord)) {
        return 'negative';
    } else {
        return 'neutral';
    }
}

function renderWordChart() {
    const wordList = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, CONFIG.CHART_OPTIONS.maxWords);
    
    if (wordList.length === 0) {
        wordChartContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #718096; font-size: 16px;">
                Waiting for responses...
            </div>
        `;
        return;
    }
    
    const maxCount = wordList[0][1];
    
    const chartHTML = `
        <div class="chart-header">
            <div class="chart-title">Most Common Words</div>
            <div class="chart-subtitle">Top ${wordList.length} words from ${totalResponses} responses</div>
            <div class="sentiment-legend">
                <span class="legend-item"><span class="legend-color positive"></span>Positive</span>
                <span class="legend-item"><span class="legend-color negative"></span>Negative</span>
                <span class="legend-item"><span class="legend-color neutral"></span>Neutral</span>
            </div>
        </div>
        ${wordList.map(([word, count], index) => {
            const percentage = (count / maxCount) * 100;
            const sentiment = analyzeSentiment(word);
            const color = CONFIG.CHART_OPTIONS.sentimentColors[sentiment];
            return `
                <div class="word-bar">
                    <div class="word-label">${word}</div>
                    <div class="word-bar-fill ${sentiment}" style="width: ${Math.max(percentage, 5)}%; background: ${color};" title="Sentiment: ${sentiment}">
                        ${count}
                    </div>
                </div>
            `;
        }).join('')}
    `;
    
    wordChartContainer.innerHTML = chartHTML;
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
    updateTimer = setInterval(fetchAndUpdateWordChart, CONFIG.UPDATE_INTERVAL);
}

function handleResize() {
    // Re-render the chart on resize
    renderWordChart();
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
        fetchAndUpdateWordChart();
    }, 2000);
    
    setTimeout(() => {
        addDemoResponse('challenging overwhelming potential');
        fetchAndUpdateWordChart();
    }, 5000);
    
    setTimeout(() => {
        addDemoResponse('creative problem-solving innovative');
        fetchAndUpdateWordChart();
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
