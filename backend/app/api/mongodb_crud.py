"""
MongoDB Direct REST API & Generic Collection CRUD Router
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

from typing import Any, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from pydantic import BaseModel, Field
from backend.app.core.mongodb import MongoCRUD
from backend.app.api.auth import get_current_user, require_roles
from backend.app.models.db_models import User
from backend.seed_mongodb import seed_mongodb_database

router = APIRouter(prefix="/mongo", tags=["MongoDB CRUD Operations"])

class CollectionCreateRequest(BaseModel):
    collection_name: str = Field(..., min_length=2, max_length=60, description="Name of the new MongoDB collection")
    initial_document: Optional[dict[str, Any]] = None

class DocumentCreateRequest(BaseModel):
    data: dict[str, Any]

class DocumentUpdateRequest(BaseModel):
    data: dict[str, Any]

@router.get("/collections")
def list_collections(current_user: User = Depends(get_current_user)):
    """List all MongoDB collections and their current document counts."""
    try:
        collections = MongoCRUD.list_collections()
        return {
            "database": "student_performance_ai",
            "total_collections": len(collections),
            "collections": collections
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query MongoDB collections: {str(e)}"
        )

@router.post("/collections", status_code=status.HTTP_201_CREATED)
def create_new_collection(
    req: CollectionCreateRequest,
    current_user: User = Depends(require_roles(["admin", "teacher"]))
):
    """Create a new collection in MongoDB and optionally insert an initial document."""
    try:
        coll_name = req.collection_name.strip().lower().replace(" ", "_")
        MongoCRUD.create_collection(coll_name)

        initial_doc = None
        if req.initial_document:
            initial_doc = MongoCRUD.create(coll_name, req.initial_document)

        return {
            "message": f"MongoDB collection '{coll_name}' successfully created.",
            "collection_name": coll_name,
            "initial_document": initial_doc
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create collection: {str(e)}")

@router.post("/seed")
def trigger_mongodb_seed(current_user: User = Depends(require_roles(["admin"]))):
    """Seed / Re-seed all collections on MongoDB Atlas."""
    try:
        seed_mongodb_database()
        collections = MongoCRUD.list_collections()
        return {
            "message": "MongoDB database 'student_performance_ai' successfully seeded with all initial collections and records!",
            "collections": collections
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database seeding failed: {str(e)}")

@router.get("/{collection_name}")
def get_collection_documents(
    collection_name: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """READ (List): Retrieve documents from specified collection with pagination & search."""
    try:
        query: dict[str, Any] = {}
        if search:
            # Match search against standard fields like student_id or name if present
            query["$or"] = [
                {"student_id": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}},
                {"subject_name": {"$regex": search, "$options": "i"}},
                {"title": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}}
            ]

        # For student role, filter by student_id if reading private collection
        if current_user.role == "student" and collection_name in ["students", "academic_records", "predictions"]:
            query["student_id"] = current_user.student_id

        result = MongoCRUD.find_many(
            collection_name=collection_name,
            filter_query=query,
            skip=skip,
            limit=limit,
            sort_by="created_at",
            ascending=False
        )
        return {
            "collection_name": collection_name,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch documents: {str(e)}")

@router.get("/{collection_name}/{doc_id}")
def get_document_by_id(
    collection_name: str,
    doc_id: str,
    current_user: User = Depends(get_current_user)
):
    """READ (Single): Retrieve a single document by its ObjectId string."""
    doc = MongoCRUD.get_by_id(collection_name, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document with ID '{doc_id}' not found in '{collection_name}'.")

    # Authorization check for student role
    if current_user.role == "student" and doc.get("student_id") and doc.get("student_id") != current_user.student_id:
        raise HTTPException(status_code=403, detail="Access denied: Cannot view another student's record.")

    return doc

@router.post("/{collection_name}", status_code=status.HTTP_201_CREATED)
def create_document(
    collection_name: str,
    payload: DocumentCreateRequest,
    current_user: User = Depends(require_roles(["admin", "teacher"]))
):
    """CREATE: Insert a new document into any MongoDB collection."""
    try:
        data = payload.data.copy()
        data["created_by"] = current_user.full_name
        created = MongoCRUD.create(collection_name, data)
        return {
            "message": f"Document successfully inserted into '{collection_name}'.",
            "document": created
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to insert document: {str(e)}")

@router.put("/{collection_name}/{doc_id}")
def update_document(
    collection_name: str,
    doc_id: str,
    payload: DocumentUpdateRequest,
    current_user: User = Depends(require_roles(["admin", "teacher"]))
):
    """UPDATE: Modify fields of a document in MongoDB."""
    updated = MongoCRUD.update(collection_name, doc_id, payload.data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Document with ID '{doc_id}' not found in '{collection_name}'.")
    return {
        "message": f"Document '{doc_id}' in '{collection_name}' successfully updated.",
        "document": updated
    }

@router.delete("/{collection_name}/{doc_id}")
def delete_document(
    collection_name: str,
    doc_id: str,
    current_user: User = Depends(require_roles(["admin", "teacher"]))
):
    """DELETE: Remove a document from MongoDB."""
    deleted = MongoCRUD.delete(collection_name, doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Document with ID '{doc_id}' not found in '{collection_name}'.")
    return {
        "message": f"Document '{doc_id}' in '{collection_name}' successfully deleted.",
        "deleted": True
    }
