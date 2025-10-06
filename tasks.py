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
                "Provide 3–5 well-structured, evidence-based arguments supporting it. "
                "Include examples, statistics, or research where possible. "
                "Ensure your tone is persuasive, logical, and confident."
            ),
            agent=agent_for,
            expected_output="3–5 clear points supporting the statement, each with a justification or example."
        ),
        Task(
            description=(
                f"Argue AGAINST the statement: '{topic}'. "
                "Provide 3–5 analytical counterarguments highlighting flaws, risks, or opposing evidence. "
                "Include real-world reasoning, ethical, or practical challenges. "
                "Ensure your tone is skeptical, logical, and objective."
            ),
            agent=agent_against,
            expected_output="3–5 counterpoints challenging the statement with reasoning or data."
        ),
        Task(
            description=(
                "Summarize the debate between the FOR and AGAINST agents. "
                "Compare their strongest arguments, identify common ground or contradictions, "
                "and produce a balanced conclusion that aids user decision-making. "
                "Your summary should include a brief recommendation or final stance (if possible)."
            ),
            agent=summarizer,
            expected_output="A balanced summary highlighting the main pros and cons, plus a concise conclusion."
        )
    ]