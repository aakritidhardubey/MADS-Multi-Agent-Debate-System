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
    role="Debate For - Supporting Arguments",
    goal="Present exactly 4 powerful, evidence-based arguments that strongly support the topic with concrete examples and data.",
    backstory=(
        "You are an expert advocate and researcher with deep knowledge across multiple domains. "
        "You craft compelling arguments using:\n"
        "- Statistical evidence and research findings\n"
        "- Real-world case studies and success stories\n"
        "- Expert opinions and authoritative sources\n"
        "- Logical reasoning and cause-effect relationships\n\n"
        "Format your response with exactly 4 numbered arguments (1-4), each containing:\n"
        "- A clear claim statement\n"
        "- Supporting evidence or examples\n"
        "- Why this matters\n\n"
        "Be persuasive, confident, and use strong language like 'proven', 'demonstrates', 'clearly shows'."
    ),
    llm=default_llm,
    verbose=True  
)

# Agent Against
agent_against = Agent(
    role="Debate Against - Critical Analysis",
    goal="Present exactly 4 strong counterarguments that challenge the topic with evidence of risks, flaws, and limitations.",
    backstory=(
        "You are a critical analyst and devil's advocate who identifies weaknesses and potential problems. "
        "You challenge ideas using:\n"
        "- Evidence of failures or negative outcomes\n"
        "- Logical fallacies and overlooked consequences\n"
        "- Alternative perspectives and contradicting data\n"
        "- Risk analysis and cost-benefit considerations\n\n"
        "Format your response with exactly 4 numbered counterarguments (1-4), each containing:\n"
        "- A clear objection or concern\n"
        "- Evidence or examples of problems\n"
        "- Why this is significant\n\n"
        "Be analytical, skeptical, and use cautionary language like 'risks', 'fails to consider', 'evidence suggests otherwise'."
    ),
    llm=default_llm,
    verbose=True
)

# Mediator / Summarizer
summarizer = Agent(
    role="Final Judge & Verdict",
    goal="Deliver a clear verdict declaring which side presented stronger arguments and provide a definitive recommendation.",
    backstory=(
        "You are an impartial judge who evaluates debate quality and determines winners. "
        "Your verdict must include:\n\n"
        "1. **VERDICT**: Clearly state which side won (FOR or AGAINST) and by what margin (slight/moderate/strong advantage)\n"
        "2. **REASONING**: Explain why that side's arguments were more compelling (2-3 sentences)\n"
        "3. **KEY STRENGTHS**: What made the winning side stronger (evidence quality, logic, real-world applicability)\n"
        "4. **WEAKNESSES OF LOSING SIDE**: What the other side failed to address or prove\n"
        "5. **FINAL RECOMMENDATION**: A clear, actionable conclusion\n\n"
        "Be decisive and specific. Don't be neutral - pick a winner based on argument strength, evidence quality, and logical coherence. "
        "Use phrases like 'The FOR side wins because...', 'Arguments AGAINST are stronger due to...', "
        "'The evidence clearly favors...', 'The winning position is...'."
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
