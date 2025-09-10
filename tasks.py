from dotenv import load_dotenv
load_dotenv()

from crewai import Task
from agents import agent1,agent2,summarizer

def debate_tasks(topic):
    return [
    Task(
        description=f"Argue FOR the statement: {topic}",
        agent=agent1,
        expected_output="A structured argument supporting the statement, including at least 3 points with evidence."
    ),
    Task(
        description=f"Argue AGAINST the statement: {topic}",
        agent=agent2,
        expected_output="A structured counterargument against the statement, including at least 3 points with reasoning."
    ),
    Task(
        description="Summarize both FOR and AGAINST arguments into neutral decision-support insights.",
        agent=summarizer,
        expected_output="A balanced summary highlighting key supporting and opposing arguments, presented in a neutral tone."
    )
]