"""
MongoDB Atlas Connection & Generalized CRUD Operations
Students Performance Estimation System Using AI
Project Owner: Nithyasri S
"""

from typing import Any, Optional
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.database import Database
from pymongo.collection import Collection
from backend.app.core.config import settings

class MongoDBManager:
    _client: Optional[MongoClient] = None
    _db: Optional[Database] = None

    @classmethod
    def get_client(cls) -> MongoClient:
        if cls._client is None:
            cls._client = MongoClient(
                settings.MONGODB_URL,
                serverSelectionTimeoutMS=8000,
                connectTimeoutMS=8000,
                maxPoolSize=50
            )
        return cls._client

    @classmethod
    def get_database(cls) -> Database:
        if cls._db is None:
            client = cls.get_client()
            cls._db = client[settings.MONGODB_DB_NAME]
        return cls._db

    @classmethod
    def get_collection(cls, collection_name: str) -> Collection:
        db = cls.get_database()
        return db[collection_name]

def serialize_mongo_doc(doc: Optional[dict[str, Any]]) -> Optional[dict[str, Any]]:
    """Recursively converts MongoDB ObjectId and datetime to JSON-serializable primitives."""
    if doc is None:
        return None
    res = {}
    for k, v in doc.items():
        if k == "_id":
            res["id"] = str(v)
            res["_id"] = str(v)
        elif isinstance(v, ObjectId):
            res[k] = str(v)
        elif isinstance(v, datetime):
            res[k] = v.isoformat()
        elif isinstance(v, dict):
            res[k] = serialize_mongo_doc(v)
        elif isinstance(v, list):
            res[k] = [serialize_mongo_doc(item) if isinstance(item, dict) else (str(item) if isinstance(item, ObjectId) else item) for item in v]
        else:
            res[k] = v
    return res

class MongoCRUD:
    """Comprehensive CRUD Service for MongoDB Collections."""

    @staticmethod
    def get_db() -> Database:
        return MongoDBManager.get_database()

    @staticmethod
    def get_collection(collection_name: str) -> Collection:
        return MongoDBManager.get_collection(collection_name)

    @classmethod
    def list_collections(cls) -> list[dict[str, Any]]:
        db = cls.get_db()
        names = db.list_collection_names()
        info = []
        for name in names:
            coll = db[name]
            count = coll.count_documents({})
            info.append({
                "collection_name": name,
                "document_count": count
            })
        return sorted(info, key=lambda x: x["collection_name"])

    @classmethod
    def create_collection(cls, collection_name: str, indexes: Optional[list[tuple]] = None) -> bool:
        db = cls.get_db()
        if collection_name not in db.list_collection_names():
            db.create_collection(collection_name)
        if indexes:
            coll = db[collection_name]
            for idx in indexes:
                coll.create_index([idx])
        return True

    @classmethod
    def create(cls, collection_name: str, document: dict[str, Any]) -> dict[str, Any]:
        """CREATE: Inserts a document into the specified collection."""
        coll = cls.get_collection(collection_name)
        doc = document.copy()
        if "created_at" not in doc:
            doc["created_at"] = datetime.now(timezone.utc)
        if "updated_at" not in doc:
            doc["updated_at"] = datetime.now(timezone.utc)

        result = coll.insert_one(doc)
        doc["_id"] = result.inserted_id
        return serialize_mongo_doc(doc)

    @classmethod
    def create_many(cls, collection_name: str, documents: list[dict[str, Any]]) -> list[str]:
        """CREATE: Bulk inserts documents into collection."""
        if not documents:
            return []
        coll = cls.get_collection(collection_name)
        docs = []
        for d in documents:
            item = d.copy()
            if "created_at" not in item:
                item["created_at"] = datetime.now(timezone.utc)
            if "updated_at" not in item:
                item["updated_at"] = datetime.now(timezone.utc)
            docs.append(item)
        res = coll.insert_many(docs)
        return [str(_id) for _id in res.inserted_ids]

    @classmethod
    def get_by_id(cls, collection_name: str, doc_id: str) -> Optional[dict[str, Any]]:
        """READ: Retrieves single document by ObjectId string or custom key."""
        coll = cls.get_collection(collection_name)
        try:
            doc = coll.find_one({"_id": ObjectId(doc_id)})
        except Exception:
            doc = coll.find_one({"_id": doc_id})
        return serialize_mongo_doc(doc)

    @classmethod
    def find_one(cls, collection_name: str, filter_query: dict[str, Any]) -> Optional[dict[str, Any]]:
        """READ: Retrieves single document matching filter query."""
        coll = cls.get_collection(collection_name)
        doc = coll.find_one(filter_query)
        return serialize_mongo_doc(doc)

    @classmethod
    def find_many(
        cls,
        collection_name: str,
        filter_query: Optional[dict[str, Any]] = None,
        sort_by: Optional[str] = None,
        ascending: bool = True,
        skip: int = 0,
        limit: int = 50
    ) -> dict[str, Any]:
        """READ: Retrieves multiple documents with pagination and sorting."""
        coll = cls.get_collection(collection_name)
        query = filter_query or {}
        
        cursor = coll.find(query)
        if sort_by:
            direction = ASCENDING if ascending else DESCENDING
            cursor = cursor.sort(sort_by, direction)
        
        total_count = coll.count_documents(query)
        items = cursor.skip(skip).limit(limit)
        
        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "items": [serialize_mongo_doc(d) for d in items]
        }

    @classmethod
    def update(cls, collection_name: str, doc_id: str, update_data: dict[str, Any]) -> Optional[dict[str, Any]]:
        """UPDATE: Modifies document by ID and returns the updated document."""
        coll = cls.get_collection(collection_name)
        data = update_data.copy()
        data["updated_at"] = datetime.now(timezone.utc)
        
        # Remove _id or id from update fields if present
        data.pop("_id", None)
        data.pop("id", None)

        try:
            filter_q = {"_id": ObjectId(doc_id)}
        except Exception:
            filter_q = {"_id": doc_id}

        res = coll.find_one_and_update(
            filter_q,
            {"$set": data},
            return_document=True
        )
        return serialize_mongo_doc(res)

    @classmethod
    def delete(cls, collection_name: str, doc_id: str) -> bool:
        """DELETE: Removes document by ID."""
        coll = cls.get_collection(collection_name)
        try:
            filter_q = {"_id": ObjectId(doc_id)}
        except Exception:
            filter_q = {"_id": doc_id}

        res = coll.delete_one(filter_q)
        return res.deleted_count > 0

    @classmethod
    def delete_many(cls, collection_name: str, filter_query: dict[str, Any]) -> int:
        """DELETE: Removes multiple documents matching filter."""
        coll = cls.get_collection(collection_name)
        res = coll.delete_many(filter_query)
        return res.deleted_count
