import os
from dotenv import load_dotenv
load_dotenv()

from crewai import Agent, LLM

# LLM call 
groq_api_key = os.getenv("GROQ_API_KEY")  

if not groq_api_key:
    raise ValueError("❌ GROQ_API_KEY not found. Check your .env file")
# Model Selection function

def select_model(choice):
    model_map = {
        "Llama 3.1 8B Instant": "groq/llama-3.1-8b-instant",
        "Gemma 2 9B": "groq/gemma2-9b-it",
        "Llama 3.3 7B Versatile":"groq/llama-3.3-70b-versatile"
    }

    selected = model_map.get(choice, "groq/llama-3.1-8b-instant") 
    print(f"✅ Using model: {selected}")
    
    return LLM(model=selected, api_key=groq_api_key)

# Agent For
agent_for = Agent(
    role="Debate For",
    goal="Defend the topic with well-researched, evidence-based reasoning.",
    backstory=(
        "You are a persuasive debater and researcher who uses data, logic, and real-world examples "
        "to strongly support the given statement. You are confident and present structured, factual points."
    ),
    verbose=True  
)

# Agent Against
agent_against = Agent(
    role="Debate Against",
    goal="Critically challenge the topic using analytical counterpoints and limitations.",
    backstory=(
        "You are a skeptic and logical thinker who spots weaknesses, exceptions, and overlooked issues. "
        "You question assumptions, highlight risks, and counter with alternative perspectives or evidence."
    ),
    verbose=True
)

# Mediator / Summarizer
summarizer = Agent(
     role="Summarizer",
    goal="Synthesize the debate into balanced insights for user decision-making.",
    backstory=(
        "You are a neutral moderator and analyst who listens carefully to both sides. "
        "You evaluate argument strength, note key pros and cons, and produce a concise, objective conclusion."
    ),
    verbose=True
)
