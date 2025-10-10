from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, List
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
You are a medical document assistant that helps users understand their EXISTING medical reports and prescriptions. 

CRITICAL RULES:
1. ONLY provide information that is DIRECTLY present in the user's uploaded documents
2. DO NOT recommend medications or treatments that aren't already prescribed in the documents
3. DO NOT suggest medications for conditions not mentioned in the uploaded documents
4. If asked about a condition or medication not in the documents, clearly state you don't have that information
5. NEVER suggest using medications prescribed for one condition to treat a different condition

Context from uploaded documents:
{context}

Question: {question}

Instructions:
- If the question asks about medication/treatment for a condition NOT in the documents, respond: "I don't have any prescriptions or medical reports about [condition] in your uploaded documents. Please consult your healthcare provider for medical advice about this condition."
- If the question is about something in the documents, provide accurate information and cite the specific document
- Always remind users to consult healthcare providers for new symptoms or conditions

Answer:
"""


def extract_filename(source_path: str) -> str:
    """Extract just the filename from a full path."""
    if not source_path:
        return "Unknown Document"
    
    # Handle both forward and backward slashes
    parts = source_path.replace('\\', '/').split('/')
    filename = parts[-1] if parts else source_path
    
    # Remove file extension if present
    if '.' in filename:
        filename = '.'.join(filename.split('.')[:-1])
    
    return filename if filename else "Unknown Document"


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
                "message": "I couldn't find any medical reports to reference. Please upload your medical documents first so I can provide accurate information about your health records.",
                "citations": []
            }

        llm = ChatOpenAI(model_name=settings.LLM_MODEL_NAME, temperature=0.2)

        prompt = PromptTemplate(
            template=PROMPT_TEMPLATE,
            input_variables=["context", "question"]
        )

        # Use retriever to get relevant documents
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
        
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={
                "prompt": prompt,
                "document_variable_name": "context"
            }
        )

        result = qa_chain.invoke({"query": query})
        
        # Get the AI's response
        ai_response = result["result"].lower()
        
        # Check if AI is saying it doesn't have information (refusing to answer)
        refusal_indicators = [
            "don't have any",
            "no prescriptions",
            "no medical reports",
            "not in your uploaded documents",
            "cannot find",
            "no information about"
        ]
        
        is_refusal = any(indicator in ai_response for indicator in refusal_indicators)
        
        print(f"\nQuery: {query}")
        print(f"AI Response preview: {result['result'][:300]}...")
        print(f"Is refusal/no-info response: {is_refusal}")
        
        # If AI refused or said it doesn't have info, don't show any citations
        if is_refusal:
            print("AI indicated no relevant information - returning empty citations")
            return {
                "message": result["result"],
                "citations": []
            }
        
        # Extract keywords from the AI response (remove common words)
        stop_words = {'the', 'is', 'are', 'was', 'were', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'this', 'that', 'these', 'those', 'i', 'you', 'your', 'it', 'its', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'please', 'any', 'about', 'my', 'take', 'based', 'according', 'consult', 'provider'}
        response_words = set(ai_response.split()) - stop_words
        
        # Filter to meaningful keywords (length > 3)
        response_keywords = {word.strip('.,!?:;()[]{}') for word in response_words if len(word) > 3}
        
        print(f"Response keywords: {list(response_keywords)[:15]}...")  # Show first 15

        # Analyze which source documents were actually used in the response
        citations = []
        seen_documents = set()
        
        if "source_documents" in result and response_keywords:
            print(f"\nAnalyzing {len(result['source_documents'])} source documents:")
            
            for idx, doc in enumerate(result["source_documents"]):
                metadata = doc.metadata
                document_name = metadata.get('filename') or metadata.get('source', '')
                content = doc.page_content.lower() if hasattr(doc, 'page_content') else ''
                
                # Count how many response keywords appear in this document
                matching_keywords = [kw for kw in response_keywords if kw in content]
                match_score = len(matching_keywords)
                
                # Calculate match percentage
                match_percentage = (match_score / len(response_keywords) * 100) if response_keywords else 0
                
                print(f"  Doc {idx}: {document_name}")
                print(f"    Keyword matches: {match_score}/{len(response_keywords)} ({match_percentage:.1f}%)")
                print(f"    Sample matches: {matching_keywords[:8]}")
                
                # Balanced criteria:
                # - Good keyword match (25%+) with minimum 4 keywords, OR
                # - Very high keyword match (40%+) regardless of count
                MIN_MATCH_PERCENTAGE_HIGH = 40  # Very confident match
                MIN_MATCH_PERCENTAGE_MED = 25   # Medium confidence
                MIN_KEYWORD_COUNT = 4
                
                is_relevant = (
                    (match_percentage >= MIN_MATCH_PERCENTAGE_HIGH) or
                    (match_percentage >= MIN_MATCH_PERCENTAGE_MED and match_score >= MIN_KEYWORD_COUNT)
                )
                
                if is_relevant:
                    if document_name:
                        cleaned_name = extract_filename(document_name)
                        
                        if cleaned_name and cleaned_name not in seen_documents:
                            seen_documents.add(cleaned_name)
                            citations.append({"document_name": cleaned_name})
                            print(f"    ✓ CITED (relevant to response)")
                else:
                    print(f"    ✗ Not cited (insufficient relevance: {match_percentage:.1f}% with {match_score} keywords)")
        
        print(f"\nFinal citations: {[c['document_name'] for c in citations]}")

        return {
            "message": result["result"],
            "citations": citations
        }

    except Exception as e:
        print(f"Error during processing: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat message: {str(e)}"
        )
