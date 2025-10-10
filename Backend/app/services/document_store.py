# app/services/document_store.py
from fastapi import HTTPException, status
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain.docstore.document import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
import shutil
from typing import List, Dict, Any, Optional
import uuid
from ..config import settings
from sentence_transformers import SentenceTransformer

from langchain.embeddings.base import Embeddings
import numpy as np
from typing import List

class SentenceTransformerEmbeddings(Embeddings):
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return embeddings.tolist()

    def embed_query(self, text: str) -> List[float]:
        embedding = self.model.encode([text], show_progress_bar=False, convert_to_numpy=True)
        return embedding[0].tolist()

class DocumentStore:
    def __init__(self):
        self.embedding_model = SentenceTransformerEmbeddings()
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        # Dictionary to store vector stores by user ID
        self.vector_stores = {}
        
        # Ensure the persist directory exists
        os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)

    def delete_user_collection(self, user_id: str):
        """Delete entire collection and directory for a user"""
        try:
            # Remove from memory if loaded
            if user_id in self.vector_stores:
                del self.vector_stores[user_id]
            
            # Delete the physical directory
            user_dir = os.path.join(settings.CHROMA_PERSIST_DIRECTORY, str(user_id))
            if os.path.exists(user_dir):
                shutil.rmtree(user_dir)
                print(f"✅ Deleted Chroma directory: {user_dir}")
            else:
                print(f"⚠️ Chroma directory not found: {user_dir}")
                
        except Exception as e:
            print(f"❌ Error deleting collection for user {user_id}: {e}")
            raise

    def delete_document(self, report_id: int, user_id: int):
        """
        Deletes a document from the vector store based on report_id for a specific user.
        
        Args:
            report_id: The ID of the report/document to delete
            user_id: The user ID to fetch the relevant vector store
            
        Raises:
            HTTPException: If the document cannot be found or deleted.
        """
        user_dir = os.path.join(settings.CHROMA_PERSIST_DIRECTORY, str(user_id))
        
        if user_id not in self.vector_stores:
            if not os.path.exists(user_dir):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Vector store not found for user"
                )
            self.vector_stores[user_id] = Chroma(
                collection_name=f"user_{user_id}",
                embedding_function=self.embedding_model,
                persist_directory=user_dir
            )

        vector_store = self.vector_stores[user_id]
        
        # If Chroma supports document deletion by ID, use that
        try:
            vector_store.delete(ids=str(report_id))

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete document from vector store: {str(e)}"
            )
    
    def get_vectorstore(self, user_id: int) -> Optional[Chroma]:
        """
        Get the vector store for a specific user.
        
        Args:
            user_id: User ID
            
        Returns:
            Optional[Chroma]: Vector store instance or None if not found
        """
        # Create user directory path
        user_dir = os.path.join(settings.CHROMA_PERSIST_DIRECTORY, str(user_id))
        
        # Load vector store if not in memory
        if user_id not in self.vector_stores:
            if not os.path.exists(user_dir):
                return None
            
            self.vector_stores[user_id] = Chroma(
                collection_name=f"user_{user_id}",
                embedding_function=self.embedding_model,
                persist_directory=user_dir
            )
        
        return self.vector_stores[user_id]
    
    def store_document(self, user_id: int, filename: str, text: str, metadata: Dict[str, Any], user_uuid: str = None):
        """
        Store a document in the vector store for a specific user.
        
        Args:
            user_id: User ID
            filename: Original filename
            text: Extracted text from the document
            metadata: Document metadata
            user_uuid: User UUID (optional)
            
        Returns:
            Chroma: Vector store instance
        """
        # Create user directory if it doesn't exist
        user_dir = os.path.join(settings.CHROMA_PERSIST_DIRECTORY, str(user_id))
        os.makedirs(user_dir, exist_ok=True)
        
        # Split text into chunks
        text_chunks = self.text_splitter.split_text(text)
        
        # Prepare documents with metadata
        documents = []
        for idx, chunk in enumerate(text_chunks):
            chunk_metadata = metadata.copy()
            chunk_metadata["chunk_id"] = idx
            documents.append(Document(page_content=chunk, metadata=chunk_metadata))
        
        # Create or get vector store for the user
        if user_id not in self.vector_stores:
            self.vector_stores[user_id] = Chroma(
                collection_name=f"user_{user_id}",
                embedding_function=self.embedding_model,
                persist_directory=user_dir
            )
        
        # Add documents to vector store
        self.vector_stores[user_id].add_documents(documents)
        
        # Persist changes
        return self.vector_stores[user_id]
    
    def get_relevant_documents(self, user_id: int, query: str, top_k: int = 5):
        """
        Get relevant document chunks for a query.
        
        Args:
            user_id: User ID
            query: Search query
            top_k: Number of results to return
            
        Returns:
            List[Document]: List of relevant document chunks
        """
        # Create user directory path
        user_dir = os.path.join(settings.CHROMA_PERSIST_DIRECTORY, str(user_id))
        
        # Load vector store if not in memory
        if user_id not in self.vector_stores:
            if not os.path.exists(user_dir):
                return []
            
            self.vector_stores[user_id] = Chroma(
                collection_name=f"user_{user_id}",
                embedding_function=self.embedding_model,
                persist_directory=user_dir
            )
        
        # Search for relevant documents
        docs_with_scores = self.vector_stores[user_id].similarity_search_with_score(
            query, k=top_k
        )
        
        return docs_with_scores
    
    def persist_all(self):
        """Persist all vector stores to disk."""
        pass
