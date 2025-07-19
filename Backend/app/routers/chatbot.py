# app/routers/chatbot.py
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
import os
import json
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langchain_google_genai import GoogleGenerativeAI
from langchain_openai import ChatOpenAI
import google.generativeai as genai

from ..models.users import User
from ..databse import get_db
from ..core.auth import get_current_user
from ..services.document_store import DocumentStore
from ..config import settings

router = APIRouter()

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# Configure OpenAI
os.environ["OPENAI_API_KEY"] = settings.OPENAI_API_KEY

PROMPT_TEMPLATE = """
You are a medical assistant tasked with answering questions based on OCR-extracted and LLM-formatted medical reports. 
Use the following information to answer the question. Pay special attention to laboratory results, diagnoses, and any mentions of specific diseases or viruses.

Information:
{context}

Question: {question}

Provide a concise and accurate answer based on the given information. If the information contains multiple relevant pieces, synthesize them into a coherent answer. Always maintain medical accuracy and relevance. If the answer is clearly stated in the context or summary, quote it directly.

If asked about a specific condition, test result, or virus, always check both the context and summary for any mentions, even if it's not the primary diagnosis.

Answer:
"""


@router.post("/chat", response_model=Dict[str, Any])
async def process_chat_message(
    query: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        document_store = DocumentStore()
        vectorstore = document_store.get_vectorstore(current_user.clerk_id)
        
        # Handle case where no documents are uploaded
        if vectorstore is None:
            return {
                "message": "I couldn't find any medical reports to reference. Please upload your medical documents first so I can provide accurate information about your health records."
            }

        llm = ChatOpenAI(model_name=settings.LLM_MODEL_NAME, temperature=0.2)

        prompt = PromptTemplate(
            template=PROMPT_TEMPLATE,
            input_variables=["context", "question"]
        )

        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={
                "prompt": prompt,
                "document_variable_name": "context"
            }
        )

        result = qa_chain.invoke({"query": query})

        return {
            "message": result["result"]
        }

    except Exception as e:
        print(f"Error during processing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat message: {str(e)}"
        )