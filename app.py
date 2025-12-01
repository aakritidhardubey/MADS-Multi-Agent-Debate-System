from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import asyncio
import json
from typing import AsyncGenerator

load_dotenv()

from crewai import Crew
from tasks import debate_tasks, create_followup_task
from agents import select_model, followup_agent

app = FastAPI(title="Debate System API", version="1.0.0")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

class DebateRequest(BaseModel):
    topic: str
    model_choice: str

class DebateResponse(BaseModel):
    status: str
    message: str
    data: dict = None

class FollowUpRequest(BaseModel):
    question: str
    debate_context: str
    model_choice: str

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/health")
async def health_check():
    """Health check endpoint for Render"""
    return {"status": "healthy", "service": "AI Debate Arena"}

@app.get("/api/models")
async def get_models():
    """Get available models"""
    return {
        "models": [
            {"id": "1", "name": "Llama 3.1 8B Instant", "description": "Fast & Balanced"},
            {"id": "3", "name": "Llama 3.3 70B Versatile", "description": "Most Capable & Best Reasoning"}
        ]
    }

async def run_debate_stream(topic: str, model_choice: str) -> AsyncGenerator[str, None]:
    """Run debate and stream results"""
    try:
        yield f"data: {json.dumps({'type': 'status', 'message': f'Selected Model: {model_choice}'})}\n\n"
        
        # Select model
        llm = select_model(model_choice)
        yield f"data: {json.dumps({'type': 'status', 'message': 'Initializing agents...'})}\n\n"
        
        # Create tasks
        tasks = debate_tasks(topic, llm)
        yield f"data: {json.dumps({'type': 'status', 'message': 'Starting debate...'})}\n\n"
        
        # Create crew
        crew = Crew(
            agents=[t.agent for t in tasks],
            tasks=tasks,
            verbose=False
        )
        
        # Run debate
        yield f"data: {json.dumps({'type': 'debate_start', 'topic': topic})}\n\n"
        
        result = crew.kickoff()
        
        # Parse and send results
        yield f"data: {json.dumps({'type': 'debate_complete', 'result': str(result)})}\n\n"
        
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

@app.post("/api/debate/stream")
async def start_debate_stream(request: DebateRequest):
    """Start a streaming debate"""
    return StreamingResponse(
        run_debate_stream(request.topic, request.model_choice),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@app.post("/api/debate")
async def start_debate(request: DebateRequest):
    """Start a debate (non-streaming)"""
    try:
        print(f"Starting debate with topic: {request.topic}")
        print(f"Model choice: {request.model_choice}")
        
        # Model choice mapping
        model_choice_map = {
            "1": "Llama 3.1 8B Instant",
            "3": "Llama 3.3 70B Versatile"
        }
        
        model_name = model_choice_map.get(request.model_choice, "Llama 3.1 8B Instant")
        print(f"Selected model: {model_name}")
        
        # Select model
        print("Selecting model...")
        llm = select_model(model_name)
        print("Model selected successfully")
        
        # Create tasks
        print("Creating tasks...")
        tasks = debate_tasks(request.topic, llm)
        print(f"Created {len(tasks)} tasks")
        
        # Create and run crew
        print("Creating crew...")
        crew = Crew(
            agents=[t.agent for t in tasks],
            tasks=tasks,
            verbose=False
        )
        print("Crew created, starting debate...")
        
        result = crew.kickoff()
        print("Debate completed successfully")
        
        # Parse the results to separate FOR, AGAINST, and SUMMARY
        task_outputs = result.tasks_output if hasattr(result, 'tasks_output') else []
        
        parsed_results = {
            "for_arguments": "",
            "against_arguments": "", 
            "summary": ""
        }
        
        if len(task_outputs) >= 3:
            parsed_results["for_arguments"] = str(task_outputs[0].raw)
            parsed_results["against_arguments"] = str(task_outputs[1].raw)
            parsed_results["summary"] = str(task_outputs[2].raw)
        else:
            # Fallback: try to parse from the full result string
            result_str = str(result)
            parsed_results["for_arguments"] = result_str
            parsed_results["against_arguments"] = "Unable to parse arguments"
            parsed_results["summary"] = "Unable to parse summary"
        
        return DebateResponse(
            status="success",
            message="Debate completed successfully",
            data={
                "topic": request.topic,
                "model": model_name,
                "results": parsed_results
            }
        )
        
    except Exception as e:
        print(f"Error in debate: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/followup")
async def ask_followup(request: FollowUpRequest):
    """Handle follow-up questions about the debate"""
    try:
        print(f"Follow-up question: {request.question}")
        
        # Model choice mapping
        model_choice_map = {
            "1": "Llama 3.1 8B Instant",
            "3": "Llama 3.3 70B Versatile"
        }
        
        model_name = model_choice_map.get(request.model_choice, "Llama 3.1 8B Instant")
        
        # Select model
        llm = select_model(model_name)
        
        # Create follow-up task
        followup_task = create_followup_task(request.question, request.debate_context, llm)
        
        # Create crew with just the follow-up agent
        crew = Crew(
            agents=[followup_agent],
            tasks=[followup_task],
            verbose=False
        )
        
        # Execute the follow-up task
        result = crew.kickoff()
        
        return DebateResponse(
            status="success",
            message="Follow-up answer generated",
            data={
                "question": request.question,
                "answer": str(result)
            }
        )
        
    except Exception as e:
        print(f"Error in follow-up: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    # Use 0.0.0.0 for production (Render), 127.0.0.1 for local
    host = "0.0.0.0" if os.environ.get("RENDER") else "127.0.0.1"
    uvicorn.run(app, host=host, port=port)