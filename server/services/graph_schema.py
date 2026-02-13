from typing import TypedDict, List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

# --- ROUTER OUTPUT MODELS ---

class RouteQueryFull(BaseModel):
    """
    Schema for FULL mode (Files + Cases + Direct).
    """
    tool_choice: Literal["direct_answer", "case_search", "file_search", "hybrid_search"] = Field(
        ..., 
        description="Select 'hybrid_search' if the user wants to apply legal precedents to the file's facts."
    )
    # List 1: FACTUAL EXTRACTION (For your Private PDF)
    file_search_queries: List[str] = Field(
        default_factory=list, 
        description="Keywords to extract specific facts from the uploaded file (e.g., 'notice date', 'penalty amount', 'jurisdiction')."
    )
    # List 2: LEGAL PRINCIPLES (For your Public Case DB)
    case_search_queries: List[str] = Field(
        default_factory=list, 
        description="Keywords for the Case Law DB. MUST include Section numbers (e.g., 'Section 148') and legal concepts (e.g., 'territorial jurisdiction')."
    )

class RouteQueryRestricted(BaseModel):
    """
    Schema for RESTRICTED mode (No Files).
    """
    tool_choice: Literal["direct_answer", "case_search"] = Field(..., description="Select tool.")
    case_search_queries: List[str] = Field(default_factory=list, description="Queries for legal research.")


# --- METADATA & STATE MODELS ---

class ChatMetadata(BaseModel):
    title: str = Field(..., description="Chat Title.")
    updated_conversation_summary: str = Field(..., description="Merged summary.")
    follow_up_question: str = Field(..., description="Follow-up question.")

class GraphState(TypedDict):
    question: str
    conversation_summary: str
    file_manifest: str 
    thread_id: str
    
    # Internal Logic
    tool_choice: str
    file_search_queries: List[str] # Queries for the PDF
    case_search_queries: List[str] # Queries for the Vector DB
    
    documents: List[str]       
    source_metadata: List[dict] 
    final_answer: str          
    
    # Metadata Outputs
    chat_title: str
    updated_summary: str      
    follow_up: str