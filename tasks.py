from dotenv import load_dotenv
load_dotenv()

from crewai import Task
from agents import agent_for,agent_against,summarizer

def debate_tasks(topic,llm):
    agent_for.llm = llm
    agent_against.llm = llm
    summarizer.llm = llm

    return [
        Task(
            description=(
                f"Argue FOR the statement: '{topic}'. "
                "Provide exactly 4 well-structured, evidence-based arguments supporting it. "
                "Number each point clearly (1, 2, 3, 4). "
                "Include examples, statistics, or research where possible. "
                "Ensure your tone is persuasive, logical, and confident. "
                "Do not provide more or fewer than 4 points."
            ),
            agent=agent_for,
            expected_output="Exactly 4 numbered points supporting the statement, each with clear justification and examples."
        ),
        Task(
            description=(
                f"Argue AGAINST the statement: '{topic}'. "
                "Provide exactly 4 analytical counterarguments highlighting flaws, risks, or opposing evidence. "
                "Number each point clearly (1, 2, 3, 4). "
                "Include real-world reasoning, ethical, or practical challenges. "
                "Ensure your tone is skeptical, logical, and objective. "
                "Do not provide more or fewer than 4 points."
            ),
            agent=agent_against,
            expected_output="Exactly 4 numbered counterpoints challenging the statement with reasoning and data."
        ),
        Task(
            description=(
                "Based on the debate between the FOR and AGAINST agents, provide only a final conclusion. "
                "DO NOT summarize or repeat the individual arguments from either side. "
                "Instead, provide a balanced final judgment that weighs the overall strength of both positions. "
                "Give a clear recommendation or stance based on the evidence presented. "
                "Keep it concise and focused on the conclusion only."
            ),
            agent=summarizer,
            expected_output="A concise final conclusion and recommendation without repeating the individual arguments."
        )
    ]

def create_followup_task(question, debate_context, llm):
    """Create a follow-up task to answer questions about the debate"""
    from agents import followup_agent
    
    followup_agent.llm = llm
    
    return Task(
        description=(
            f"Based on the following debate context, answer this question: '{question}'\n\n"
            f"DEBATE CONTEXT:\n{debate_context}\n\n"
            "Provide a clear, concise answer that directly addresses the question. "
            "Reference specific arguments from the debate when relevant. "
            "Keep your response focused and informative."
        ),
        agent=followup_agent,
        expected_output="A clear, concise answer to the user's question based on the debate context."
    )
