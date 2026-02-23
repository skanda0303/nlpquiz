const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/dist')));

// Data persistence (Simple JSON file for demonstration)
const RESULTS_FILE = path.join(__dirname, 'results.json');

const getResults = () => {
    if (!fs.existsSync(RESULTS_FILE)) return [];
    try {
        const data = fs.readFileSync(RESULTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
};

const saveResult = (result) => {
    const results = getResults();
    results.push({
        ...result,
        timestamp: new Date().toISOString()
    });
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
};

// API Endpoints
app.get('/api/questions', (req, res) => {
    const questionsPath = path.join(__dirname, 'questions.json');
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
    res.json(questions);
});

app.post('/api/submit', async (req, res) => {
    const { name, email, answers, score, tabSwitches, timeTaken } = req.body;

    if (!name || !answers) {
        return res.status(400).json({ error: 'Name and answers are required' });
    }

    const result = { name, email, answers, score, tabSwitches, timeTaken };
    saveResult(result);

    // Optional Discord Webhook Notification
    if (process.env.DISCORD_WEBHOOK_URL) {
        try {
            await axios.post(process.env.DISCORD_WEBHOOK_URL, {
                embeds: [{
                    title: "New Quiz Submission! 🚀",
                    color: score > 30 ? 0x10b981 : 0x6366f1,
                    fields: [
                        { name: "Name", value: name, inline: true },
                        { name: "Score", value: `${score}/40`, inline: true },
                        { name: "Tab Switches", value: tabSwitches.toString(), inline: true },
                        { name: "Time Taken", value: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`, inline: true }
                    ],
                    footer: { text: "NLP Master Quiz System" }
                }]
            });
        } catch (e) {
            console.error("Webhook failed:", e.message);
        }
    }

    res.json({ message: 'Result saved successfully', id: Date.now() });
});

// Admin endpoint to get all results
app.get('/api/results', (req, res) => {
    // Simple protection: Check for a secret header or just allow for now
    // For a real app, you'd add auth
    res.json(getResults());
});

// Fallback to React index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
