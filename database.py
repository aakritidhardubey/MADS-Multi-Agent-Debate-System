from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "mads_pro"

client = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        MONGODB_URI,
        tls=True,
        tlsAllowInvalidCertificates=True,   # fixes TLSv1 handshake errors on Windows / Python 3.12
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=20000,
        socketTimeoutMS=20000,
    )
    db = client[DB_NAME]
    print("✅ Connected to MongoDB Atlas")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db

# ─── Users ───────────────────────────────────────────────────────────────────

async def create_user(username: str, email: str, hashed_password: str):
    user = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    }
    result = await db.users.insert_one(user)
    return str(result.inserted_id)

async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email})

async def get_user_by_username(username: str):
    return await db.users.find_one({"username": username})

# ─── Debates ─────────────────────────────────────────────────────────────────

async def save_debate(user_id: str, topic: str, model: str, results: dict):
    debate = {
        "user_id": user_id,
        "topic": topic,
        "model": model,
        "results": results,
        "created_at": datetime.utcnow()
    }
    result = await db.debates.insert_one(debate)
    return str(result.inserted_id)

async def delete_debate(debate_id: str, user_id: str):
    """Delete a debate by ID, only if it belongs to the user."""
    from bson import ObjectId
    try:
        result = await db.debates.delete_one({
            "_id": ObjectId(debate_id),
            "user_id": user_id
        })
        return result.deleted_count == 1
    except Exception:
        return False

async def get_user_debates(user_id: str, limit: int = 20):
    cursor = db.debates.find(
        {"user_id": user_id},
        {"_id": 1, "topic": 1, "model": 1, "created_at": 1, "results": 1}
    ).sort("created_at", -1).limit(limit)

    debates = []
    async for debate in cursor:
        debate["_id"] = str(debate["_id"])
        debate["created_at"] = debate["created_at"].isoformat()
        debates.append(debate)
    return debates
