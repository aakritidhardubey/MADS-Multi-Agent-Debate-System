# Multi-Agent Debate System

A collaborative AI system where multiple agents debate a user-provided topic, and a summarizer generates balanced decision-support insights. Built using **CrewAI** and **Groq LLMs**, run via **UV**.

## 🧩 Features

- **Debate For Agent:** Presents structured, evidence-based arguments supporting the topic
- **Debate Against Agent:** Offers analytical counterarguments highlighting flaws, risks, or opposing evidence
- **Summarizer Agent:** Condenses the debate into neutral, actionable insights
- **Model Selection:** Choose from multiple LLMs for different reasoning styles

## ⚡ Requirements

- Python 3.10+
- `crewai` package
- `python-dotenv` package
- **UV package manager** installed

**Optional:** Use a virtual environment for package isolation.

## 📦 Setup

### 1. Clone the repository

```bash
git clone <repo_url>
cd <repo_folder>
```

### 2. Install dependencies

```bash
uv install
```

### 3. Add your Groq API Key

Create a `.env` file in the root folder:

```env
GROQ_API_KEY=<your_groq_api_key_here>
```

## 🚀 Running the Debate System

### 1. Run the main script with UV:

```bash
uv run main.py
```

### 2. Follow the prompts:

- Enter a topic or question
- Choose a model (1–3) based on your preference:

| Option | Model | Notes |
|--------|-------|-------|
| 1 | Llama 3.1 8B Instant | Fast & Balanced |
| 2 | Gemma 7B | Concise & Lightweight |
| 3 | Llama 3.2 3B | Light & Efficient |

### 3. View Results

The agents will debate and the summarizer will provide a **final summary**.

## 🗂 File Structure

```
├── main.py            # Entry point to run the debate system
├── agents.py          # Defines For, Against, and Summarizer agents + model selection
├── tasks.py           # Defines the debate tasks assigned to agents
├── .env               # Environment variables (Groq API key)
└── README.md          # Project documentation
```

## 🔧 How It Works

1. **Select a topic** – User provides a statement or question
2. **Model selection** – The system allows choosing an LLM for reasoning
3. **Debate agents** – "For" and "Against" agents generate structured arguments
4. **Summarizer agent** – Produces a neutral, concise summary highlighting key points
5. **Output** – Displayed on the console

## ⚙️ Customization

- Modify **agents.py** to tweak agent goals, backstories, or reasoning styles
- Adjust **tasks.py** to change argument requirements or expected outputs
- Add more LLMs in **agents.py > select_model()** if you want additional options

## 💡 Notes

- Ensure `.env` contains a valid Groq API key
- Agents use the selected LLM to generate responses, so runtime depends on model size
- For best results, provide clear and concise topics



## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## 🌐 Web Interface & Deployment

This project now includes a **beautiful web interface** with advanced features!

### ✨ New Web Features

- **🎨 Modern UI**: Beautiful, responsive design with animations
- **⚖️ Side-by-Side Display**: Compare For/Against arguments easily
- **💬 Interactive Follow-ups**: Ask unlimited questions about the debate
- **📄 PDF Export**: Download professional debate reports
- **📊 Progress Tracking**: Real-time debate generation status
- **🎯 Structured Output**: Exactly 4 numbered points from each side

### 🚀 Running the Web App Locally

```bash
# Start the web server
python app.py

# Or use the quick start script
python start.py
```

Then visit: `http://127.0.0.1:8000`

### 🌍 Deploy to Render

**Quick Deploy Steps:**

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Add environment variable: `GROQ_API_KEY`
6. Deploy!

**Detailed Instructions**: See [DEPLOYMENT.md](DEPLOYMENT.md)

### 📁 Updated File Structure

```
├── app.py                 # FastAPI web server
├── main.py                # CLI version (original)
├── start.py               # Quick start script
├── agents.py              # AI agents (For, Against, Judge, Follow-up)
├── tasks.py               # Debate tasks
├── static/
│   ├── index.html         # Web interface
│   ├── style.css          # Styling
│   └── script.js          # Frontend logic
├── requirements.txt       # Python dependencies
├── render.yaml            # Render deployment config
├── DEPLOYMENT.md          # Deployment guide
├── .env                   # Environment variables
└── README.md              # This file
```

## 🎯 API Endpoints

- `GET /` - Web interface
- `GET /health` - Health check
- `GET /api/models` - Available AI models
- `POST /api/debate` - Start a debate
- `POST /api/followup` - Ask follow-up questions

## 🔐 Environment Variables

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=8000  # Optional, defaults to 8000
```

## 📱 Screenshots

The web interface features:
- Welcome screen with feature highlights
- Debate configuration with model selection
- Real-time progress indicators
- Side-by-side argument comparison
- Interactive follow-up chat
- Export options (PDF, TXT, Clipboard)

## 🎓 Educational Use

Perfect for:
- Critical thinking exercises
- Debate preparation
- Research analysis
- Decision-making support
- Exploring complex topics

## 📊 Tech Stack

**Backend:**
- FastAPI
- CrewAI
- Python 3.12
- Groq LLMs

**Frontend:**
- Vanilla JavaScript
- HTML5/CSS3
- jsPDF for exports

**Deployment:**
- Render (recommended)
- Docker-ready
- Cloud-native

## 🆘 Troubleshooting

**Issue: API key not found**
- Ensure `.env` file exists with `GROQ_API_KEY`

**Issue: Port already in use**
- Change port: `PORT=8001 python app.py`

**Issue: Static files not loading**
- Ensure `static/` folder exists with all files

**Issue: Slow responses**
- Try Llama 3.1 8B (faster model)
- Check your internet connection

## 📄 License

MIT License - Free to use and modify!

## 🙏 Credits

- **CrewAI** - Multi-agent framework
- **Groq** - Lightning-fast LLM inference
- **Render** - Easy deployment platform

---

**Ready to deploy?** Check out [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions! 🚀
