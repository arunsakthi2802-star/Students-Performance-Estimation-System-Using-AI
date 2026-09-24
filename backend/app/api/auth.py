"""
Authentication & Authorization API Routes
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import (
    verify_password, get_password_hash, create_access_token, decode_access_token, security_bearer
)
from backend.app.models.db_models import User, Student
from backend.app.schemas.api_schemas import UserRegister, UserLogin, Token, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(
    auth_credentials = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    if not auth_credentials or not auth_credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token missing or invalid.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_credentials.credentials
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload.",
        )
    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account does not exist or has been disabled.",
        )
    return user

def require_roles(allowed_roles: list[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Requires one of following roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # If student role, check or create student record
    if user_in.role == "student" and user_in.student_id:
        existing_student = db.query(Student).filter(Student.student_id == user_in.student_id).first()
        if not existing_student:
            student = Student(
                student_id=user_in.student_id,
                name=user_in.full_name,
                email=user_in.email.lower(),
                department=user_in.department or "Computer Science",
                semester=1
            )
            db.add(student)

    hashed_pw = get_password_hash(user_in.password)
    user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pw,
        full_name=user_in.full_name,
        role=user_in.role,
        student_id=user_in.student_id,
        department=user_in.department
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token_payload = {
        "sub": user.email,
        "role": user.role,
        "name": user.full_name,
        "student_id": user.student_id
    }
    token = create_access_token(token_payload)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "student_id": user.student_id,
            "department": user.department
        }
    }

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Please contact the administrator."
        )

    token_payload = {
        "sub": user.email,
        "role": user.role,
        "name": user.full_name,
        "student_id": user.student_id
    }
    token = create_access_token(token_payload)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "student_id": user.student_id,
            "department": user.department
        }
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
