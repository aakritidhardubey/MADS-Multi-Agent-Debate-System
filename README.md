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
