import os
from dotenv import load_dotenv
load_dotenv()

from crewai import Agent, LLM

# LLM call 
groq_api_key = os.getenv("GROQ_API_KEY")  

if not groq_api_key:
    raise ValueError("❌ GROQ_API_KEY not found. Check your .env file")

# Set GROQ_API_KEY for litellm
os.environ["GROQ_API_KEY"] = groq_api_key

# Model Selection function
def select_model(choice):
    model_map = {
        "Llama 3.1 8B Instant": "groq/llama-3.1-8b-instant",
        "Llama 3.3 70B Versatile": "groq/llama-3.3-70b-versatile"
    }

    selected = model_map.get(choice, "groq/llama-3.1-8b-instant") 
    print(f"✅ Using model: {selected}")
    
    return LLM(model=selected, api_key=groq_api_key)

# Create default LLM for agent initialization
default_llm = LLM(model="groq/llama-3.1-8b-instant", api_key=groq_api_key)

# Agent For
agent_for = Agent(
    role="Debate For",
    goal="Defend the topic with exactly 4 well-researched, evidence-based arguments.",
    backstory=(
        "You are a persuasive debater and researcher who uses data, logic, and real-world examples "
        "to strongly support the given statement. You always provide exactly 4 numbered points, "
        "each with clear justification. You are confident and present structured, factual arguments."
    ),
    llm=default_llm,
    verbose=True  
)

# Agent Against
agent_against = Agent(
    role="Debate Against",
    goal="Challenge the topic with exactly 4 analytical counterpoints and limitations.",
    backstory=(
        "You are a skeptic and logical thinker who spots weaknesses, exceptions, and overlooked issues. "
        "You always provide exactly 4 numbered counterarguments, each with solid reasoning. "
        "You question assumptions, highlight risks, and counter with alternative perspectives or evidence."
    ),
    llm=default_llm,
    verbose=True
)

# Mediator / Summarizer
summarizer = Agent(
     role="Final Judge",
    goal="Provide only a final conclusion and recommendation without repeating arguments.",
    backstory=(
        "You are a neutral judge who evaluates the overall strength of both sides in a debate. "
        "You do NOT repeat or summarize individual arguments. Instead, you provide only a final "
        "balanced judgment and clear recommendation based on which side presented stronger evidence overall."
    ),
    llm=default_llm,
    verbose=True
)

# Follow-up Agent
followup_agent = Agent(
    role="Debate Expert & Advisor",
    goal="Answer follow-up questions about the debate with clarity and depth.",
    backstory=(
        "You are an expert analyst who has deep knowledge of the debate that just occurred. "
        "You can answer specific questions, clarify points, provide additional context, "
        "compare arguments, or explore specific aspects in more detail. "
        "You provide concise, informative answers based on the debate context."
    ),
    llm=default_llm,
    verbose=True
)
