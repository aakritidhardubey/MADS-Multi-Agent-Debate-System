# AI Debate Arena

A multi-agent debate platform where AI agents argue for, against, and judge any topic — with full user authentication, debate history, and customizable debate parameters. Project is live at :-[[link](https://mads-multi-agent-debate-system.onrender.com)]

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-latest-green.svg)](https://fastapi.tiangolo.com/)
[![CrewAI](https://img.shields.io/badge/CrewAI-1.6-purple.svg)](https://www.crewai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

AI Debate Arena spins up three specialized AI agents for every debate:

- **Agent For** — builds a set of evidence-based arguments supporting the topic
- **Agent Against** — constructs counterarguments challenging the topic
- **Judge** — delivers a structured verdict with a named winner and reasoning
- **Follow-up Agent** — answers unlimited questions about the completed debate

Users register, log in, and all debates are saved to their personal history.

---

## Features

- Configurable argument count (2–6 per side), depth (brief / standard / deep), tone (balanced, aggressive, academic, casual, Socratic), and focus area (general, economic, ethical, scientific, social)
- Live Debate Mode streams results in real time via Server-Sent Events
- Follow-up Q&A chat anchored to the full debate context
- Debate history sidebar with per-debate delete
- Export results as PDF, plain text, or clipboard copy
- Voice input on topic field and follow-up form
- JWT-based authentication (72-hour tokens, bcrypt password hashing)
- MongoDB Atlas persistence via Motor (async)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Python 3.12 |
| AI Orchestration | CrewAI 1.6, LiteLLM |
| LLM Provider | Groq (Llama, Kimi K2, Qwen3, GPT-OSS) |
| Database | MongoDB Atlas (Motor async driver) |
| Auth | JWT (python-jose), passlib bcrypt |
| Frontend | Vanilla JS, HTML5, CSS3 |
| Deployment | Render (render.yaml included) |

---

## Project Structure

```
ai-debate-arena/
├── app.py              # FastAPI app — routes, auth, debate, history endpoints
├── agents.py           # CrewAI agent definitions (For, Against, Judge, Follow-up)
├── tasks.py            # Task builders with tone/depth/focus instructions
├── auth.py             # JWT creation, verification, password hashing
├── database.py         # MongoDB connection, user and debate CRUD
├── main.py             # CLI entry point for running debates in the terminal
├── render.yaml         # Render deployment config
├── requirements.txt    # Python dependencies
├── pyproject.toml      # Project metadata
├── .env                # Environment variables (not committed)
└── static/
    ├── index.html      # Main debate UI
    ├── login.html      # Auth page (register / login)
    ├── script.js       # Core frontend logic
    ├── auth.js         # Auth flow
    ├── speech.js/css   # Voice input
    ├── livedebate.js/css   # SSE live mode
    ├── visualization.js/css # Results visualization
    ├── multilang.js/css     # Multilingual support
    └── style.css       # Global styles
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- A [Groq API key](https://console.groq.com/) (free tier available)
- A MongoDB Atlas connection string

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/ai-debate-arena.git
cd ai-debate-arena
```

Install dependencies:

```bash
# Recommended — uses uv lockfile for reproducible installs
uv sync

# Or with pip
pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key
MONGODB_URI=your_mongodb_atlas_connection_string
SECRET_KEY=a_random_secret_for_jwt_signing
```

Start the server:

```bash
python app.py
```

Open `http://127.0.0.1:8000` — you'll land on the login page.

### CLI Mode

Run a debate directly in the terminal without the web interface:

```bash
python main.py
```

---

## How It Works

1. Register or log in — credentials are stored securely in MongoDB
2. Configure your debate — topic, model, depth, tone, focus, and argument count
3. Launch — three agents run sequentially via CrewAI:
   - Agent For produces N supporting arguments
   - Agent Against produces N counterarguments
   - Judge delivers a structured verdict (VERDICT / REASONING / KEY STRENGTHS / WEAKNESSES / FINAL RECOMMENDATION)
4. Ask follow-ups — the Follow-up Agent has full debate context
5. Export or revisit — results are saved to your history and exportable as PDF or text

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a new account |
| POST | `/api/auth/login` | No | Log in, receive JWT |
| POST | `/api/debate` | Yes | Run a full debate |
| POST | `/api/debate/stream` | Yes | Run a debate with SSE streaming |
| POST | `/api/followup` | Yes | Ask a follow-up question |
| GET | `/api/history` | Yes | Fetch user's debate history |
| DELETE | `/api/history/{id}` | Yes | Delete a specific debate |
| GET | `/api/models` | No | List available AI models |
| GET | `/health` | No | Health check |

---

## Available Models

| ID | Model | Notes |
|---|---|---|
| 1 | Llama 3.1 8B Instant | Fast, lightweight |
| 3 | Llama 3.3 70B Versatile | Most capable |
| 4 | Llama 4 Scout 17B | Long context |
| 5 | Kimi K2 | Strong reasoning |
| 6 | Qwen3 32B | Multilingual |
| 7 | GPT-OSS 20B | OpenAI open weight |

All models are served via Groq's inference API.

---

## Deployment

The repo includes a `render.yaml` for one-click deployment to [Render](https://render.com/).

1. Push to GitHub
2. Go to Render Dashboard → New → Blueprint → connect your repo
3. Set environment variables: `GROQ_API_KEY`, `MONGODB_URI`, `SECRET_KEY`
4. Click Apply — live in ~3 minutes

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## Contributing

Bug reports, feature requests, and pull requests are welcome. Open an issue to discuss larger changes before submitting a PR.

---

## License

MIT — free to use and modify.
