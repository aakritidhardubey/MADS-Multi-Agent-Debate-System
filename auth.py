from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 72

pwd_context = CryptContext(
    schemes=["bcrypt_sha256"],
    deprecated="auto"
)

bearer_scheme = HTTPBearer(auto_error=False)


def _safe_password(password: str) -> str:
    # bcrypt supports max 72 bytes
    return password.encode("utf-8")[:72].decode("utf-8", "ignore")


def hash_password(password: str) -> str:
    password = _safe_password(password)
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    plain = _safe_password(plain)
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    payload = decode_token(credentials.credentials)

    user_id = payload.get("sub")
    username = payload.get("username")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"user_id": user_id, "username": username}