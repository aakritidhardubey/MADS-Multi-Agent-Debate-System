from dotenv import load_dotenv
load_dotenv()

from crewai import Crew
from tasks import debate_tasks

if __name__ == "__main__":
    topic = "Should I buy niacinamide serum for my dry skin with pores ?"
    tasks = debate_tasks(topic)

    crew = Crew(
        agents=[t.agent for t in tasks],
        tasks=tasks,
        verbose=True
    )

    result = crew.kickoff()
    print("\nFinal Summary:\n", result)