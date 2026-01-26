# Judo Flashcards Study App

A modern, interactive flashcard application designed for studying judo techniques and terminology across different belt ranks (kyu and dan levels).

## Features

- 🥋 **Multi-Belt Support**: Study materials organized by belt rank (Gokyu through Shodan)
- 📚 **Categorized Learning**: Separate categories for techniques to recite vs. perform
- 📊 **Progress Tracking**: Track correct/wrong answers with persistent statistics
- 🎴 **Interactive Flashcards**: Flip cards to reveal answers, mark as correct or wrong
- 🔀 **Shuffle Mode**: Randomize card order for effective learning
- ⌨️ **Keyboard Shortcuts**: Navigate efficiently with keyboard controls
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 💾 **Local Storage**: All progress saved locally in your browser

## Live Demo

[View Live Demo](https://your-netlify-url.netlify.app) _(Update with your actual deployment URL)_

## Getting Started

### Option 1: Use Online

Simply visit the deployed application and start studying immediately.

### Option 2: Run Locally

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/judo-flashcards.git
   cd judo-flashcards
   ```

2. Open [`index.html`](index.html:1) in your web browser:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js
   npx serve
   ```

3. Navigate to `http://localhost:8000` in your browser

## Usage

### Basic Navigation

1. **Select Category**: Choose "All", "Recite", or "Perform" from the dropdown
2. **Start Practice**: Click "Start Practice" to begin studying
3. **Flip Cards**: Click the card or press Space/Enter to reveal the answer
4. **Mark Answers**: Click "Correct" or "Wrong" buttons (or use keyboard shortcuts)
5. **Navigate**: Use Prev/Next buttons or arrow keys to move between cards

### Keyboard Shortcuts

When viewing flashcards:
- `Space` or `Enter` - Flip card
- `←` (Left Arrow) - Previous card
- `→` (Right Arrow) - Next card
- `1` or `C` - Mark correct
- `2` or `W` - Mark wrong

### Progress Tracking

- Your progress is automatically saved to browser local storage
- View overall statistics on the landing page
- Individual card statistics displayed on each flashcard
- Clear all progress using the "Clear Stats" button

## File Structure

```
judo-flashcards/
├── index.html           # Main application file
├── favicon.svg          # Application icon
├── README.md           # This file
├── LICENSE             # License information
├── .gitignore          # Git ignore rules
├── netlify.toml        # Netlify deployment config
└── study/              # Study materials directory
    ├── gokyu/          # Yellow belt (5th kyu)
    ├── yonkyu/         # Orange belt (4th kyu)
    ├── sankyu/         # Green belt (3rd kyu)
    ├── nikyu/          # Blue belt (2nd kyu)
    ├── ikkyu/          # Brown belt (1st kyu)
    └── shodan/         # Black belt (1st dan)
```

## Adding Study Materials

Study materials are stored as CSV files in the `study/` directory. Each belt rank has its own folder with two CSV files:

- `recite.csv` - Terms and definitions to memorize
- `perform.csv` - Techniques to practice/perform

### CSV Format

```csv
Question,Answer
"What is Uchi Mata?","Inner thigh throw"
"Describe Osoto Gari","Major outer reap"
```

**Important**: Use quotes around values containing commas.

## Configuration

To enable additional belt ranks, edit the belt configuration in [`index.html`](index.html:507):

```javascript
const belts = {
    gokyu: {
        // ... configuration
        enabled: true  // Set to true to enable
    },
    // ... other belts
};
```

Set the current belt being studied:

```javascript
const currentBelt = 'gokyu';  // Change to desired belt
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Designed for judo students and practitioners
- Inspired by traditional flashcard study methods
- Built with vanilla HTML, CSS, and JavaScript for simplicity and performance

## Support

If you encounter any issues or have suggestions:
1. Check existing [Issues](https://github.com/yourusername/judo-flashcards/issues)
2. Create a new issue with detailed information
3. Contribute a fix via Pull Request

## Roadmap

- [ ] Add belt progression system
- [ ] Implement spaced repetition algorithm
- [ ] Add audio pronunciation guides
- [ ] Create mobile app versions
- [ ] Add multiplayer study mode
- [ ] Export/import progress data

---

**Note**: Update repository URLs and deployment links before publishing.