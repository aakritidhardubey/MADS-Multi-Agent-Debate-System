import os
from dotenv import load_dotenv
load_dotenv()

from crewai import Agent, LLM

# LLM call 
groq_api_key = os.getenv("GROQ_API_KEY")  

if not groq_api_key:
    raise ValueError("❌ GROQ_API_KEY not found. Check your .env file")

llm = LLM(
    model="groq/llama-3.1-8b-instant",
    api_key=groq_api_key
)

# Agent For
agent1 = Agent(
    role="Debate For",
    goal="Defend the topic with strong arguments",
    backstory="An expert debater skilled at finding supporting evidence.",
    verbose=True,  
    llm=llm
)

# Agent Against
agent2 = Agent(
    role="Debater Against",
    goal="Counter the topic with logical reasoning",
    backstory="A critical thinker who always questions assumptions.",
    verbose=True,
    llm=llm
)

# Mediator / Summarizer
summarizer = Agent(
    role="Summarizer",
    goal="Summarize debates into balanced insights",
    backstory="A neutral judge who condenses debates into clear recommendations.",
    verbose=True,
    llm=llm
)
