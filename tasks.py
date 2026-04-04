from dotenv import load_dotenv
load_dotenv()

from crewai import Task
from agents import agent_for, agent_against, summarizer

TONE_INSTRUCTIONS = {
    "balanced":   "Use a measured, fair, and objective tone.",
    "aggressive": "Use a forceful, assertive, and passionate tone. Argue with strong conviction.",
    "academic":   "Use a scholarly, formal tone. Cite research-like reasoning and precise terminology.",
    "casual":     "Use a conversational, accessible tone. Avoid jargon; explain ideas simply.",
    "socratic":   "Use a questioning tone. Frame each argument as reasoning that leads the reader to a conclusion.",
}

FOCUS_INSTRUCTIONS = {
    "general":    "Cover all relevant dimensions — social, economic, ethical, and practical.",
    "economic":   "Focus on economic impacts: costs, markets, employment, financial trade-offs.",
    "ethical":    "Focus on moral and ethical dimensions: rights, fairness, values, justice, harm.",
    "scientific": "Focus on scientific evidence: data, research studies, empirical findings, technical feasibility.",
    "social":     "Focus on social impacts: communities, culture, inequality, human behaviour, public wellbeing.",
}

DEPTH_INSTRUCTIONS = {
    "brief":    "Each argument must be 2-3 sentences maximum. Be concise and direct.",
    "standard": "Each argument should have a clear claim plus 2-3 sentences of supporting evidence.",
    "deep":     "Each argument should have a detailed claim, supporting evidence with examples or data, and a conclusion sentence.",
}

def debate_tasks(topic, llm, depth="standard", args_per_side=4, tone="balanced", focus="general"):
    agent_for.llm = llm
    agent_against.llm = llm
    summarizer.llm = llm

    tone_instr  = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["balanced"])
    focus_instr = FOCUS_INSTRUCTIONS.get(focus, FOCUS_INSTRUCTIONS["general"])
    depth_instr = DEPTH_INSTRUCTIONS.get(depth, DEPTH_INSTRUCTIONS["standard"])
    n = int(args_per_side)

    # Build a numbered template so the LLM knows exactly what structure is required
    for_template = "\n".join([f"{i}. [Argument {i} supporting the statement]" for i in range(1, n+1)])
    against_template = "\n".join([f"{i}. [Counterargument {i} against the statement]" for i in range(1, n+1)])

    for_task = Task(
        description=(
            f"You are arguing FOR the statement: '{topic}'\n\n"
            f"STRICT RULES — YOU MUST FOLLOW THESE EXACTLY:\n"
            f"- Write EXACTLY {n} numbered argument{'s' if n != 1 else ''}. No more, no less.\n"
            f"- Number them 1 through {n}.\n"
            f"- DO NOT write argument number {n+1} or beyond.\n"
            f"- Stop after argument {n}.\n\n"
            f"TONE: {tone_instr}\n"
            f"FOCUS: {focus_instr}\n"
            f"DEPTH: {depth_instr}\n\n"
            f"Your response must follow this exact structure:\n"
            f"{for_template}"
        ),
        agent=agent_for,
        expected_output=(
            f"Exactly {n} numbered arguments (1 through {n}) FOR the statement '{topic}'. "
            f"No argument numbered {n+1} or higher must appear."
        )
    )

    against_task = Task(
        description=(
            f"You are arguing AGAINST the statement: '{topic}'\n\n"
            f"STRICT RULES — YOU MUST FOLLOW THESE EXACTLY:\n"
            f"- Write EXACTLY {n} numbered counterargument{'s' if n != 1 else ''}. No more, no less.\n"
            f"- Number them 1 through {n}.\n"
            f"- DO NOT write argument number {n+1} or beyond.\n"
            f"- Stop after argument {n}.\n\n"
            f"TONE: {tone_instr}\n"
            f"FOCUS: {focus_instr}\n"
            f"DEPTH: {depth_instr}\n\n"
            f"Your response must follow this exact structure:\n"
            f"{against_template}"
        ),
        agent=agent_against,
        expected_output=(
            f"Exactly {n} numbered counterarguments (1 through {n}) AGAINST the statement '{topic}'. "
            f"No argument numbered {n+1} or higher must appear."
        )
    )

    judge_task = Task(
        description=(
            f"Based on the debate about: '{topic}', deliver a final verdict.\n\n"
            f"TONE: {tone_instr}\n\n"
            f"Structure your verdict with these exact labeled sections:\n"
            f"VERDICT: State which side won (FOR or AGAINST) and by what margin.\n"
            f"REASONING: Why that side's arguments were stronger (2-3 sentences).\n"
            f"KEY STRENGTHS: What made the winning side's arguments effective.\n"
            f"WEAKNESSES: What the losing side failed to address.\n"
            f"FINAL RECOMMENDATION: A clear, actionable conclusion.\n\n"
            f"Be decisive. Always name a winner. Do not be neutral."
        ),
        agent=summarizer,
        expected_output=(
            "A structured verdict with 5 labeled sections: VERDICT, REASONING, KEY STRENGTHS, WEAKNESSES, FINAL RECOMMENDATION."
        )
    )

    return [for_task, against_task, judge_task]


def create_followup_task(question, debate_context, llm):
    from agents import followup_agent
    followup_agent.llm = llm

    return Task(
        description=(
            f"Based on this debate context, answer the following question:\n"
            f"QUESTION: {question}\n\n"
            f"DEBATE CONTEXT:\n{debate_context}\n\n"
            f"Give a clear, concise answer referencing specific arguments from the debate."
        ),
        agent=followup_agent,
        expected_output="A clear, direct answer to the question based on the debate context."
    )
