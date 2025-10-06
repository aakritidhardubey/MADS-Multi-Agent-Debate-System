from dotenv import load_dotenv
load_dotenv()

from crewai import Crew
from tasks import debate_tasks
from agents import select_model

if __name__ == "__main__":
    topic = input("Enter you Topic or Question:- ")
    print("\nSelect a model:")
    print("1️⃣  Llama 3.1 8B Instant (Fast & Balanced)")
    print("2️⃣  Gemma 2 9B (Concise & Lightweight)")
    print("3️⃣  Llama 3.3 7B Versatile(Most Capable & Best Reasoning)")

    choice = input("\nEnter the number of your choice (1-4): ").strip()

    model_choice_map = {
        "1": "Llama 3.1 8B Instant",
        "2": "Gemma 2 9B",
        "3":"Llama 3.3 7B Versatile"
    }

    model_choice = model_choice_map.get(choice, "Llama 3.1 8B Instant")
    print(f"\n✅ Selected Model: {model_choice}")

    llm = select_model(model_choice)

    tasks = debate_tasks(topic,llm)

    crew = Crew(
        agents=[t.agent for t in tasks],
        tasks=tasks,
        verbose=True
    )

    print("\n🚀 Starting debate...\n") 

    result = crew.kickoff()
    print("\nFinal Summary:\n", result)