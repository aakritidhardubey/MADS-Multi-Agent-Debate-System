from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import json
import os
from typing import AsyncGenerator

load_dotenv()

if not os.getenv("GROQ_API_KEY"):
    raise ValueError("❌ GROQ_API_KEY environment variable is required")

from crewai import Crew
from tasks import debate_tasks, create_followup_task
from agents import select_model, followup_agent
from database import connect_db, close_db, create_user, get_user_by_email, get_user_by_username, save_debate, get_user_debates, delete_debate
from auth import hash_password, verify_password, create_access_token, get_current_user

app = FastAPI(title="Debate System API", version="2.0.0")

# ─── Startup / Shutdown ───────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

# ─── Static Files ─────────────────────────────────────────────────────────────

app.mount("/static", StaticFiles(directory="static"), name="static")

# ─── Pydantic Models ──────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class DebateRequest(BaseModel):
    topic: str
    model_choice: str
    depth: str = "standard"
    args_per_side: int = 4
    tone: str = "balanced"
    focus: str = "general"

class DebateResponse(BaseModel):
    status: str
    message: str
    data: dict = None

class FollowUpRequest(BaseModel):
    question: str
    debate_context: str
    model_choice: str

# ─── Single source of truth for all models ───────────────────────────────────
# Add new models here ONLY — everything else reads from this list automatically.

MODELS = [
    {"id": "1", "name": "Llama 3.1 8B Instant",   "description": "Fast & Lightweight"},
    {"id": "3", "name": "Llama 3.3 70B Versatile", "description": "Most Capable"},
    {"id": "4", "name": "Llama 4 Scout 17B",       "description": "Long Context & Smart"},
    {"id": "5", "name": "Kimi K2",                 "description": "Strong Reasoning"},
    {"id": "6", "name": "Qwen3 32B",               "description": "Multilingual & Sharp"},
    {"id": "7", "name": "GPT-OSS 20B",             "description": "OpenAI Open Weight"},
]

# id -> name map used by debate and followup routes
MODEL_CHOICE_MAP = {m["id"]: m["name"] for m in MODELS}

# ─── Pages ────────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("static/login.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.get("/debate", response_class=HTMLResponse)
async def debate_page():
    with open("static/index.html", "r", encoding="utf-8") as f:
        html = f.read()
    # Inject model list directly into the HTML so the browser never needs to
    # fetch /api/models — completely bypasses all caching issues.
    model_script = f"<script>window.__MODELS__ = {json.dumps(MODELS)};</script>"
    html = html.replace("<!-- MODEL_INJECTION_POINT -->", model_script)
    return HTMLResponse(content=html, headers={"Cache-Control": "no-store"})

# ─── Auth Routes ──────────────────────────────────────────────────────────────

@app.post("/api/auth/register")
async def register(req: RegisterRequest):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    if len(req.username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if await get_user_by_email(req.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await get_user_by_username(req.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    hashed = hash_password(req.password)
    user_id = await create_user(req.username, req.email, hashed)
    token = create_access_token({"sub": user_id, "username": req.username})
    return {"status": "success", "token": token, "username": req.username}

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    user = await get_user_by_email(req.email)
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "username": user["username"]})
    return {"status": "success", "token": token, "username": user["username"]}

# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Debate Arena"}

@app.get("/api/models")
async def get_models():
    return {"models": MODELS}

# ─── Debate History ───────────────────────────────────────────────────────────

@app.delete("/api/history/{debate_id}")
async def delete_debate_route(debate_id: str, current_user: dict = Depends(get_current_user)):
    success = await delete_debate(debate_id, current_user["user_id"])
    if success:
        return {"status": "success", "message": "Debate deleted"}
    raise HTTPException(status_code=404, detail="Debate not found or not authorized")

@app.get("/api/history")
async def debate_history(current_user: dict = Depends(get_current_user)):
    debates = await get_user_debates(current_user["user_id"])
    return {"status": "success", "debates": debates}

# ─── Debate Routes ────────────────────────────────────────────────────────────

async def run_debate_stream(
    topic: str, model_choice: str,
    depth: str = "standard", args_per_side: int = 4,
    tone: str = "balanced", focus: str = "general"
) -> AsyncGenerator[str, None]:
    try:
        yield f"data: {json.dumps({'type': 'status', 'message': f'Selected Model: {model_choice}'})}\\n\\n"
        llm = select_model(model_choice)
        yield f"data: {json.dumps({'type': 'status', 'message': 'Initializing agents...'})}\\n\\n"
        tasks = debate_tasks(topic, llm, depth=depth, args_per_side=args_per_side, tone=tone, focus=focus)
        yield f"data: {json.dumps({'type': 'status', 'message': 'Starting debate...'})}\\n\\n"
        crew = Crew(agents=[t.agent for t in tasks], tasks=tasks, verbose=False)
        yield f"data: {json.dumps({'type': 'debate_start', 'topic': topic})}\\n\\n"
        result = crew.kickoff()
        yield f"data: {json.dumps({'type': 'debate_complete', 'result': str(result)})}\\n\\n"
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\\n\\n"

@app.post("/api/debate/stream")
async def start_debate_stream(request: DebateRequest, current_user: dict = Depends(get_current_user)):
    return StreamingResponse(
        run_debate_stream(
            request.topic, request.model_choice,
            depth=request.depth, args_per_side=request.args_per_side,
            tone=request.tone, focus=request.focus
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )

@app.post("/api/debate")
async def start_debate(request: DebateRequest, current_user: dict = Depends(get_current_user)):
    try:
        model_name = MODEL_CHOICE_MAP.get(request.model_choice, "Llama 3.1 8B Instant")
        llm = select_model(model_name)
        tasks = debate_tasks(
            request.topic, llm,
            depth=request.depth, args_per_side=request.args_per_side,
            tone=request.tone, focus=request.focus
        )
        crew = Crew(agents=[t.agent for t in tasks], tasks=tasks, verbose=False)
        result = crew.kickoff()

        task_outputs = result.tasks_output if hasattr(result, 'tasks_output') else []
        parsed_results = {"for_arguments": "", "against_arguments": "", "summary": ""}

        if len(task_outputs) >= 3:
            parsed_results["for_arguments"]     = str(task_outputs[0].raw)
            parsed_results["against_arguments"] = str(task_outputs[1].raw)
            parsed_results["summary"]           = str(task_outputs[2].raw)
        else:
            result_str = str(result)
            parsed_results["for_arguments"]     = result_str
            parsed_results["against_arguments"] = "Unable to parse arguments"
            parsed_results["summary"]           = "Unable to parse summary"

        await save_debate(
            user_id=current_user["user_id"],
            topic=request.topic,
            model=model_name,
            results=parsed_results
        )

        return DebateResponse(
            status="success",
            message="Debate completed successfully",
            data={"topic": request.topic, "model": model_name, "results": parsed_results}
        )

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/followup")
async def ask_followup(request: FollowUpRequest, current_user: dict = Depends(get_current_user)):
    try:
        model_name = MODEL_CHOICE_MAP.get(request.model_choice, "Llama 3.1 8B Instant")
        llm = select_model(model_name)
        followup_task = create_followup_task(request.question, request.debate_context, llm)
        crew = Crew(agents=[followup_agent], tasks=[followup_task], verbose=False)
        result = crew.kickoff()
        return DebateResponse(
            status="success",
            message="Follow-up answer generated",
            data={"question": request.question, "answer": str(result)}
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = "0.0.0.0" if os.environ.get("RENDER") else "127.0.0.1"
    uvicorn.run(app, host=host, port=port)
