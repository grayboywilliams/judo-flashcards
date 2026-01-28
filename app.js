/**
 * Judo Flashcards - Main Application Script
 * Interactive flashcard study system for judo techniques and terminology
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/** @type {Array<{front: string, back: string, correct: number, wrong: number}>} */
let flashcards = [];

/** @type {number} Current card index in the deck */
let currentIndex = 0;

/** @type {boolean} Whether the current card is showing the back */
let isFlipped = false;

/** @type {string} Current study category: 'all', 'recite', or 'perform' */
let currentCategory = 'all';

/** @type {boolean} Whether the current card has been answered */
let hasAnsweredCurrent = false;

/** @constant {string} localStorage key for storing statistics */
const STORAGE_KEY = 'judo_flashcard_stats';

/** @constant {string} localStorage key for storing session state */
const SESSION_KEY = 'judo_flashcard_session';

// ============================================================================
// BELT CONFIGURATION
// ============================================================================

/**
 * Belt configuration for all ranks
 * Each belt contains display information, file paths, and theme colors
 */
const belts = {
    gokyu: {
        name: 'Gokyu',
        color: 'Yellow',
        path: 'study/gokyu',
        cssClass: 'belt-gokyu',
        theme: { primary: '#ffd700', dark: '#ccac00' },
        files: { recite: 'recite.csv', perform: 'perform.csv' },
        enabled: true
    },
    yonkyu: {
        name: 'Yonkyu',
        color: 'Orange',
        path: 'study/yonkyu',
        cssClass: 'belt-yonkyu',
        theme: { primary: '#ff8c00', dark: '#cc6600' },
        files: { recite: 'recite.csv', perform: 'perform.csv' },
        enabled: false
    },
    sankyu: {
        name: 'Sankyu',
        color: 'Green',
        path: 'study/sankyu',
        cssClass: 'belt-sankyu',
        theme: { primary: '#228b22', dark: '#196619' },
        files: { recite: 'recite.csv', perform: 'perform.csv' },
        enabled: false
    },
    nikyu: {
        name: 'Nikyu',
        color: 'Blue',
        path: 'study/nikyu',
        cssClass: 'belt-nikyu',
        theme: { primary: '#4169e1', dark: '#3253b3' },
        files: { recite: 'recite.csv', perform: 'perform.csv' },
        enabled: false
    },
    ikkyu: {
        name: 'Ikkyu',
        color: 'Brown',
        path: 'study/ikkyu',
        cssClass: 'belt-ikkyu',
        theme: { primary: '#8b4513', dark: '#69340e' },
        files: { recite: 'recite.csv', perform: 'perform.csv' },
        enabled: false
    },
    shodan: {
        name: 'Shodan',
        color: 'Black',
        path: 'study/shodan',
        cssClass: 'belt-shodan',
        theme: { primary: '#2a2a2a', dark: '#0a0a0a' },
        files: { recite: 'recite.csv', perform: 'perform.csv' },
        enabled: false
    }
};

/** @constant {string} Currently active belt rank */
const currentBelt = 'gokyu';

/**
 * Display names for each category type
 * @constant {Object<string, string>}
 */
const categoryNames = {
    'all': 'All',
    'recite': 'Recite',
    'perform': 'Perform'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get CSV file paths for a given category
 * @param {string} category - Category type: 'all', 'recite', or 'perform'
 * @returns {string[]} Array of file paths
 */
function getCategoryFiles(category) {
    const belt = belts[currentBelt];
    if (category === 'all') {
        return Object.values(belt.files).map(f => `${belt.path}/${f}`);
    }
    return [`${belt.path}/${belt.files[category]}`];
}


// ============================================================================
// STATISTICS MANAGEMENT
// ============================================================================

/** @constant {number} Maximum number of answers to track per card */
const MAX_HISTORY = 5;

// ============================================================================
// SESSION PERSISTENCE
// ============================================================================

/**
 * Get the session key for a specific belt and category
 * @param {string} belt - Belt rank
 * @param {string} category - Study category
 * @returns {string} Session storage key
 */
function getSessionKey(belt, category) {
    return `${SESSION_KEY}_${belt}_${category}`;
}

/**
 * Save current session state to localStorage
 */
function saveSession() {
    const session = {
        currentIndex: currentIndex,
        cardOrder: flashcards.map(c => c.front)
    };
    try {
        const key = getSessionKey(currentBelt, currentCategory);
        localStorage.setItem(key, JSON.stringify(session));
    } catch (e) {
        console.error('Failed to save session:', e);
    }
}

/**
 * Load session state from localStorage for current belt and category
 * @returns {Object|null} Session object or null if none exists
 */
function loadSession() {
    try {
        const key = getSessionKey(currentBelt, currentCategory);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

/**
 * Clear saved session for current belt and category
 */
function clearSession() {
    try {
        const key = getSessionKey(currentBelt, currentCategory);
        localStorage.removeItem(key);
    } catch (e) {
        console.error('Failed to clear session:', e);
    }
}

/**
 * Load statistics from localStorage
 * @returns {Object<string, {history: boolean[]}>} Statistics object
 */
function loadStats() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

/**
 * Save statistics to localStorage
 * @param {Object<string, {history: boolean[]}>} stats - Statistics to save
 */
function saveStats(stats) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
        console.error('Failed to save stats:', e);
    }
}

/**
 * Get statistics for a specific flashcard
 * @param {string} front - The question text
 * @returns {{correct: number, wrong: number}} Card statistics
 */
function getCardStats(front) {
    const stats = loadStats();
    const cardStats = stats[front];

    // Handle new history format
    if (cardStats && cardStats.history) {
        const correct = cardStats.history.filter(x => x).length;
        const wrong = cardStats.history.filter(x => !x).length;
        return { correct, wrong };
    }

    // Handle old format (migration) or missing stats
    if (cardStats && (cardStats.correct !== undefined || cardStats.wrong !== undefined)) {
        return { correct: cardStats.correct || 0, wrong: cardStats.wrong || 0 };
    }

    return { correct: 0, wrong: 0 };
}

/**
 * Record a user's answer and update statistics
 * @param {string} front - The question text
 * @param {boolean} isCorrect - Whether the answer was correct
 */
function recordAnswer(front, isCorrect) {
    const stats = loadStats();

    // Initialize or migrate to history format
    if (!stats[front] || !stats[front].history) {
        stats[front] = { history: [] };
    }

    // Add new answer and keep only last MAX_HISTORY
    stats[front].history.push(isCorrect);
    if (stats[front].history.length > MAX_HISTORY) {
        stats[front].history.shift();
    }

    saveStats(stats);
}


// ============================================================================
// NAVIGATION & UI CONTROL
// ============================================================================

/**
 * Apply the current belt's theme colors to UI elements
 */
function applyBeltTheme() {
    const belt = belts[currentBelt];
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.background = `linear-gradient(90deg, ${belt.theme.primary} 0%, ${belt.theme.dark} 100%)`;
}

/**
 * Update the belt display when category is selected
 * Shows progress for the selected category
 */
function updateBeltDisplay() {
    const category = document.getElementById('category').value;
    const beltDisplay = document.getElementById('belt-display');
    const beltProgress = document.getElementById('belt-progress');

    if (category) {
        beltDisplay.style.display = 'block';

        // Load session for this category to get progress
        const sessionKey = getSessionKey(currentBelt, category);
        let progress = 0;

        try {
            const data = localStorage.getItem(sessionKey);
            if (data) {
                const session = JSON.parse(data);
                if (session.cardOrder && session.cardOrder.length > 0) {
                    // Add 1 because we show the card after the last answered
                    progress = ((session.currentIndex + 1) / session.cardOrder.length) * 100;
                }
            }
        } catch (e) {
            progress = 0;
        }

        // Apply belt color and progress width
        const belt = belts[currentBelt];
        beltProgress.style.background = `linear-gradient(90deg, ${belt.theme.primary} 0%, ${belt.theme.dark} 100%)`;
        beltProgress.style.width = `${progress}%`;
    } else {
        beltDisplay.style.display = 'none';
    }
}

/**
 * Start practice session with selected category
 * Switches from landing page to flashcard view
 */
function startPractice() {
    currentCategory = document.getElementById('category').value;
    if (!currentCategory) return;
    document.getElementById('landing').style.display = 'none';
    document.getElementById('flashcards').style.display = 'block';
    applyBeltTheme();
    loadCards();
}

/**
 * Return to landing page from flashcard view
 */
function goBack() {
    document.getElementById('flashcards').style.display = 'none';
    document.getElementById('landing').style.display = 'block';
    updateBeltDisplay();
}

// ============================================================================
// FLASHCARD DATA LOADING
// ============================================================================

/**
 * Load flashcards from CSV files
 * Parses CSV, merges with statistics, shuffles, and displays cards
 * @param {boolean} forceNew - If true, ignores saved session and starts fresh
 */
async function loadCards(forceNew = false) {
    try {
        const files = getCategoryFiles(currentCategory);
        flashcards = [];

        for (const file of files) {
            const response = await fetch(file);
            const csvText = await response.text();
            const lines = csvText.split('\n');

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line) {
                    const values = parseCSVLine(line);
                    if (values.length >= 2) {
                        const cardStats = getCardStats(values[0]);
                        flashcards.push({
                            front: values[0],
                            back: values[1],
                            correct: cardStats.correct,
                            wrong: cardStats.wrong
                        });
                    }
                }
            }
        }

        // Check for saved session for this category
        const session = loadSession();
        if (!forceNew && session && session.cardOrder) {
            // Restore card order from session
            const orderMap = new Map(session.cardOrder.map((front, idx) => [front, idx]));
            flashcards.sort((a, b) => {
                const idxA = orderMap.has(a.front) ? orderMap.get(a.front) : Infinity;
                const idxB = orderMap.has(b.front) ? orderMap.get(b.front) : Infinity;
                return idxA - idxB;
            });
            currentIndex = Math.min(session.currentIndex + 1, flashcards.length - 1);
        } else {
            prioritizeWeakCards(flashcards);
            currentIndex = 0;
            saveSession();
        }

        hasAnsweredCurrent = false;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        updateCard();
        updateProgress();
        updateNavigation();
    } catch (error) {
        console.error('Error loading flashcards:', error);
        document.getElementById('loading').innerHTML = 'Error loading flashcards.';
    }
}

/**
 * Parse a CSV line handling quoted values and commas
 * @param {string} line - CSV line to parse
 * @returns {string[]} Array of parsed values
 */
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    return values;
}

/**
 * Shuffle array in place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Sort flashcards to prioritize cards with more wrong answers
 * Cards are shuffled first, then sorted by wrongness score
 * @param {Array} cards - Array of flashcard objects
 */
function prioritizeWeakCards(cards) {
    // First shuffle to ensure randomness within priority groups
    shuffleArray(cards);

    // Sort by wrongness score (wrong - correct), higher scores first
    cards.sort((a, b) => {
        const scoreA = a.wrong - a.correct;
        const scoreB = b.wrong - b.correct;
        return scoreB - scoreA;
    });
}

// ============================================================================
// CARD INTERACTION
// ============================================================================

/**
 * Flip card to show the back (answer side)
 * Only flips if not already flipped
 */
function flipToBack() {
    if (!isFlipped) {
        // Disable button interactions during flip to prevent accidental taps on mobile
        const markButtons = document.getElementById('mark-buttons');
        markButtons.style.pointerEvents = 'none';

        document.getElementById('flashcard').classList.add('flipped');
        isFlipped = true;

        // Re-enable buttons after flip animation completes
        setTimeout(() => {
            markButtons.style.pointerEvents = '';
            // Blur any focused element
            if (document.activeElement) {
                document.activeElement.blur();
            }
        }, 400);
    }
}

/**
 * Mark the current card as correct or wrong
 * Records answer, updates display, and auto-advances to next card
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {Event} event - Click event (optional, for stopPropagation)
 */
function markAnswer(isCorrect, event) {
    if (event) event.stopPropagation();
    if (hasAnsweredCurrent) {
        nextCard();
        return;
    }

    const card = flashcards[currentIndex];
    recordAnswer(card.front, isCorrect);
    hasAnsweredCurrent = true;

    // Update local card stats
    if (isCorrect) {
        card.correct++;
    } else {
        card.wrong++;
    }
    updateCardStatsDisplay();

    // Save session progress
    saveSession();

    // Auto-advance to next card
    setTimeout(() => nextCard(), 150);
}

/**
 * Update the displayed flashcard
 * Handles card flip animation when changing cards
 */
function updateCard() {
    if (flashcards.length === 0) return;

    const flashcard = document.getElementById('flashcard');
    hasAnsweredCurrent = false;

    if (isFlipped) {
        flashcard.classList.remove('flipped');
        isFlipped = false;
        setTimeout(() => {
            updateCardContent();
        }, 300);
    } else {
        updateCardContent();
    }
}

/**
 * Update the statistics display on the current card
 * Shows correct/wrong count in format "X/Y"
 */
function updateCardStatsDisplay() {
    const card = flashcards[currentIndex];
    const statsText = `${card.correct}/${card.wrong}`;
    document.getElementById('card-stats-front').textContent = statsText;
    document.getElementById('card-stats-back').textContent = statsText;
}

/**
 * Update the text content of the current card
 * Sets question, answer, and statistics
 */
function updateCardContent() {
    const card = flashcards[currentIndex];
    document.getElementById('front-text').textContent = card.front;
    document.getElementById('back-text').textContent = card.back;
    updateCardStatsDisplay();
}

/**
 * Toggle card flip state (front ↔ back)
 * Called by flip button or keyboard shortcut
 */
function flipCard() {
    const flashcard = document.getElementById('flashcard');

    if (!isFlipped) {
        flipToBack();
    } else {
        flashcard.classList.remove('flipped');
        isFlipped = false;
    }
}

/**
 * Update the progress bar and card counter
 * Shows current position and percentage complete
 */
function updateProgress() {
    if (flashcards.length === 0) return;
    document.getElementById('current').textContent = currentIndex + 1;
    document.getElementById('total').textContent = flashcards.length;
    const progress = ((currentIndex + 1) / flashcards.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
}

/**
 * Update navigation button states
 * Disables prev/next buttons at deck boundaries
 */
function updateNavigation() {
    document.getElementById('prev-btn').disabled = currentIndex === 0;
    document.getElementById('next-btn').disabled = currentIndex === flashcards.length - 1 || flashcards.length === 0;
}

/**
 * Navigate to the previous card in the deck
 * Updates card, progress, and navigation state
 */
function previousCard() {
    if (currentIndex > 0) {
        currentIndex--;
        updateCard();
        updateProgress();
        updateNavigation();
    }
}

/**
 * Navigate to the next card in the deck
 * Updates card, progress, and navigation state
 */
function nextCard() {
    if (currentIndex < flashcards.length - 1) {
        currentIndex++;
        updateCard();
        updateProgress();
        updateNavigation();
    }
}

/**
 * Reset to the first card in the deck
 * Useful for starting over without reshuffling
 */
function resetProgress() {
    currentIndex = 0;
    updateCard();
    updateProgress();
    updateNavigation();
}

/**
 * Handle clicks on the flashcard
 * Flips to back unless clicking on mark buttons
 * @param {Event} event - Click event
 */
function handleCardClick(event) {
    // Don't flip if clicking on mark buttons
    if (event.target.classList.contains('mark-btn')) return;
    flipCard();
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Global keyboard shortcut handler
 * Active only when flashcard view is displayed
 */
document.addEventListener('keydown', function(event) {
    if (document.getElementById('flashcards').style.display === 'block') {
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            if (!isFlipped) {
                flipToBack();
            }
        } else if (event.key === 'ArrowLeft') {
            previousCard();
        } else if (event.key === 'ArrowRight') {
            if (isFlipped && !hasAnsweredCurrent) {
                // Skip without marking (treat as wrong for weak mode purposes)
                markAnswer(false);
            } else {
                nextCard();
            }
        } else if (event.key === '1' || event.key === 'c') {
            if (isFlipped && !hasAnsweredCurrent) {
                markAnswer(true);
            }
        } else if (event.key === '2' || event.key === 'w') {
            if (isFlipped && !hasAnsweredCurrent) {
                markAnswer(false);
            }
        }
    } else if (event.key === 'Enter') {
        startPractice();
    }
});

