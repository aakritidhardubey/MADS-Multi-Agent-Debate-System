# 🎭 AI Debate Arena

**Multi-Agent Debate System** - An intelligent platform where AI agents debate any topic from multiple perspectives, providing comprehensive analysis with interactive follow-up capabilities.

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.122-green.svg)](https://fastapi.tiangolo.com/)
[![CrewAI](https://img.shields.io/badge/CrewAI-1.6-purple.svg)](https://www.crewai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ Features

### 🤖 **Multi-Agent System**
- **Agent For:** Presents exactly 4 well-researched arguments supporting your topic
- **Agent Against:** Provides exactly 4 analytical counterarguments with evidence
- **Final Judge:** Delivers a balanced conclusion without repeating arguments
- **Follow-up Agent:** Answers unlimited questions about the debate with full context

### 💬 **Interactive Experience**
- Beautiful, responsive web interface with smooth animations
- Real-time debate generation with progress tracking
- Side-by-side argument comparison
- Chat-like follow-up Q&A system
- Export results as PDF or text files

### ⚡ **Powered by Advanced AI**
- **Llama 3.1 8B Instant** - Fast & balanced responses
- **Llama 3.3 70B Versatile** - Most capable, best reasoning
- Lightning-fast inference via Groq

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Groq API Key ([Get one free](https://console.groq.com/))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/ai-debate-arena.git
cd ai-debate-arena
```

2. **Install dependencies**
```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install -r requirements.txt
```

3. **Set up environment variables**

Create a `.env` file:
```env
GROQ_API_KEY=your_groq_api_key_here
```

4. **Run the application**
```bash
# Web interface (recommended)
python app.py

# Or use the quick start script
python start.py

# CLI version (optional)
python main.py
```

5. **Open your browser**
```
http://127.0.0.1:8000
```

---

## 🎯 How It Works

1. **Enter Your Topic** - Any question or statement you want analyzed
2. **Choose AI Model** - Select based on speed vs. depth needs
3. **Watch the Debate** - Three agents collaborate in real-time:
   - 🟢 **For:** 4 supporting arguments
   - 🔴 **Against:** 4 opposing arguments
   - 🔵 **Judge:** Balanced conclusion
4. **Ask Follow-ups** - Dive deeper with unlimited questions
5. **Export Results** - Save as PDF, text, or copy to clipboard

---

## 📖 Usage Examples

### Good Debate Topics:
- "Should artificial intelligence be regulated by governments?"
- "Is remote work more productive than office work?"
- "Should social media platforms be held liable for user content?"
- "Is nuclear energy the solution to climate change?"

### Follow-up Questions:
- "Which side had stronger evidence?"
- "Can you explain point 3 from the arguments against?"
- "What are the real-world implications?"
- "Are there any compromises between both positions?"

---

## 🌐 Deployment

### Deploy to Render (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push
```

2. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Add environment variable: `GROQ_API_KEY`
   - Click "Apply"

3. **Done!** Your app will be live in 3-5 minutes

📚 **Detailed Instructions:** See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🗂️ Project Structure

```
ai-debate-arena/
├── app.py                 # FastAPI web server
├── agents.py              # AI agent definitions (For, Against, Judge, Follow-up)
├── tasks.py               # Debate task configurations
├── main.py                # CLI version (optional)
├── start.py               # Quick start script
├── requirements.txt       # Python dependencies
├── pyproject.toml         # Project configuration
├── render.yaml            # Render deployment config
├── .env                   # Environment variables (not in git!)
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── DEPLOYMENT.md          # Deployment guide
└── static/
    ├── index.html         # Web interface
    ├── style.css          # Styling
    └── script.js          # Frontend logic
```

---

## 🎨 Screenshots

### Welcome Screen
Beautiful landing page with feature highlights and smooth animations.

### Debate Configuration
Choose your topic and AI model with an intuitive interface.

### Side-by-Side Results
Compare arguments for and against in a clean, organized layout.

### Interactive Follow-ups
Chat-like interface for asking follow-up questions.

### Export Options
Download professional PDF reports or copy to clipboard.

---

## 🛠️ Tech Stack

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [CrewAI](https://www.crewai.com/) - Multi-agent orchestration
- [Groq](https://groq.com/) - Lightning-fast LLM inference
- Python 3.12

**Frontend:**
- Vanilla JavaScript (no frameworks!)
- HTML5 & CSS3
- [Font Awesome](https://fontawesome.com/) - Icons
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation

**Deployment:**
- [Render](https://render.com/) - Cloud hosting
- Docker-ready
- Environment-based configuration

---

## 📊 API Endpoints

- `GET /` - Web interface
- `GET /health` - Health check
- `GET /api/models` - Available AI models
- `POST /api/debate` - Start a debate
- `POST /api/followup` - Ask follow-up questions

---

## 🎓 Use Cases

- **Academic Research** - Explore multiple perspectives on complex topics
- **Decision Making** - Get balanced analysis before important choices
- **Critical Thinking** - Practice evaluating arguments
- **Debate Preparation** - Research both sides of an argument
- **Education** - Teaching tool for logic and reasoning
- **Policy Analysis** - Understand implications of proposals

---

## 💡 Tips for Best Results

- **Be Specific:** "Should AI replace customer service?" vs. "Technology"
- **Frame as Questions:** "Should X?" or "Is Y better than Z?"
- **Use Follow-ups:** Ask clarifying questions for deeper insights
- **Choose Right Model:** 
  - Llama 3.1 8B for quick, general topics
  - Llama 3.3 70B for complex, nuanced debates

---

## 🐛 Troubleshooting

**Issue:** Debate not starting
- **Solution:** Refresh page, check API key is set

**Issue:** Slow responses
- **Solution:** Try Llama 3.1 8B (faster model)

**Issue:** Export not working
- **Solution:** Check browser download settings

**Issue:** Follow-up not responding
- **Solution:** Ensure debate completed successfully first

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📄 License

MIT License - Free to use and modify!

---

## 🙏 Acknowledgments

- **[CrewAI](https://www.crewai.com/)** - Multi-agent framework
- **[Groq](https://groq.com/)** - Lightning-fast LLM inference
- **[Render](https://render.com/)** - Easy deployment platform
- **[Font Awesome](https://fontawesome.com/)** - Beautiful icons

---

## 📧 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/ai-debate-arena/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/ai-debate-arena/discussions)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Built with ❤️ using AI and modern web technologies**

*Ready to deploy? Check out [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions!*
