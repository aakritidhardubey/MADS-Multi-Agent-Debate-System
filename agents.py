import os
from dotenv import load_dotenv
load_dotenv()

from crewai import Agent, LLM

groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("❌ GROQ_API_KEY not found. Check your .env file")

os.environ["GROQ_API_KEY"] = groq_api_key

# All model IDs must have the groq/ prefix so CrewAI/LiteLLM routes them correctly
MODEL_MAP = {
    "Llama 3.1 8B Instant":  "groq/llama-3.1-8b-instant",
    "Llama 3.3 70B Versatile": "groq/llama-3.3-70b-versatile",
    "Llama 4 Scout 17B":     "groq/meta-llama/llama-4-scout-17b-16e-instruct",
    "Kimi K2":               "groq/moonshotai/kimi-k2-instruct-0905",
    "Qwen3 32B":             "groq/qwen/qwen3-32b",
    "GPT-OSS 20B":           "groq/openai/gpt-oss-20b",
}

def select_model(choice):
    selected = MODEL_MAP.get(choice, "groq/llama-3.1-8b-instant")
    print(f"✅ Using model: {selected}")
    return LLM(model=selected, api_key=groq_api_key)

default_llm = LLM(model="groq/llama-3.1-8b-instant", api_key=groq_api_key)

# ── Agents ────────────────────────────────────────────────────────────────────

agent_for = Agent(
    role="Debate Advocate — Supporting Side",
    goal=(
        "Present the exact number of well-structured, evidence-based arguments "
        "that support the debate topic, following the tone and focus specified in the task."
    ),
    backstory=(
        "You are an expert advocate and researcher skilled at building compelling arguments. "
        "You follow instructions precisely: if told to give 2 arguments, you give exactly 2. "
        "If told to give 6, you give exactly 6. You never add or remove points. "
        "You use evidence, examples, and logical reasoning appropriate to the requested tone and focus area."
    ),
    llm=default_llm,
    verbose=False
)

agent_against = Agent(
    role="Debate Analyst — Opposing Side",
    goal=(
        "Present the exact number of well-structured counterarguments "
        "that challenge the debate topic, following the tone and focus specified in the task."
    ),
    backstory=(
        "You are a critical analyst skilled at identifying weaknesses, risks, and opposing evidence. "
        "You follow instructions precisely: if told to give 3 arguments, you give exactly 3. "
        "You never deviate from the requested count. "
        "You use logical reasoning, data, and real-world examples appropriate to the requested tone and focus area."
    ),
    llm=default_llm,
    verbose=False
)

summarizer = Agent(
    role="Debate Judge & Verdict Deliverer",
    goal="Deliver a clear, decisive verdict identifying which side won and why.",
    backstory=(
        "You are an impartial judge who evaluates debate quality and picks a winner. "
        "You are decisive — you always name a winning side and justify it clearly. "
        "You structure your verdict with labeled sections as instructed in the task."
    ),
    llm=default_llm,
    verbose=False
)

followup_agent = Agent(
    role="Debate Expert & Advisor",
    goal="Answer follow-up questions about the debate with clarity and depth.",
    backstory=(
        "You are an expert analyst with deep knowledge of the debate that just occurred. "
        "You answer specific questions concisely and reference the debate context directly."
    ),
    llm=default_llm,
    verbose=False
)
