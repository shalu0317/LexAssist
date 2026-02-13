import datetime
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage
from services.graph_schema import (
    GraphState, 
    ChatMetadata, 
    RouteQueryFull, 
    RouteQueryRestricted
)
from configuration import get_api_key
from services.ragRetreiver import RAGRetriever
from services.vectorStore import VectorStore
from services.embedding import EmbeddingManager
from pydantic import BaseModel, Field
import json

groq_api_key = get_api_key()

# Core Components
llm_router = ChatGroq(api_key=groq_api_key, model="openai/gpt-oss-120b", temperature=0)
llm_gen = ChatGroq(api_key=groq_api_key, model="openai/gpt-oss-120b", temperature=0.1, max_tokens=4096)

# Initialize RAG Logic
embedding_manager = EmbeddingManager()
vector_store = VectorStore()
rag_retriever = RAGRetriever(vector_store, embedding_manager)

# --- NODE 1: ROUTER ---
def router_node(state: GraphState):
    print("\n--- NODE: Router ---")
    question = state["question"]
    manifest = state.get("file_manifest", "").strip()

    db_schema = """
    <database_schema>
    The 'Case Law Database' contains chunks of Indian Income Tax Judgments (ITAT, High Court, Supreme Court).
    Each chunk is structured as follows:
    - CASE_METADATA: [Case Name, Bench/Court, Date, Filename]
    - MAIN_ISSUE: The core legal question (e.g., "Whether Section 14A disallowance applies...")
    - DECISION_REASONING: The judge's detailed legal argument and ratio decidendi.
    - OUTCOME: "Revenue" or "Assessee".
    - SECTIONS_CITED: List of Income Tax Act sections discussed (e.g., "14, 14A, 147").
    </database_schema>
    """
    
    if manifest:
        print("[Router] Mode: FULL (Files Detected)")
        structured_llm = llm_router.with_structured_output(RouteQueryFull)
        
        system_prompt = f"""You are a legal query orchestrator.

        {db_schema}
        
        <file_context>
        {manifest}
        </file_context>
        
        TOOLS:
        1. 'file_search': User asks ONLY about facts in the file.
        2. 'case_search': User asks ONLY for external general law.
        
        3. 'hybrid_search': User asks to APPLY law to the file (Drafting, Analysis, Validity).
           - Trigger: "Draft a reply", "Check validity", "Prepare legal opinion", "from given information".
           - ACTION: Generate 'file_search_queries' to find facts. 
           - NOTE: You do NOT need to generate 'case_search_queries' perfectly yet; the system will refine them.

        4. 'direct_answer': Greetings/General.
        
        CRITICAL RULE: If user says "given information", "attached file" or "draft", MUST use 'file_search' or 'hybrid_search'.
        """
    else:
        print("[Router] Mode: RESTRICTED")
        structured_llm = llm_router.with_structured_output(RouteQueryRestricted)
        system_prompt = f"""You are a Legal Search Optimizer.
        
        {db_schema}
        
        TASK: Generate search terms to match the 'MAIN_ISSUE' and 'DECISION_REASONING' in our database.
        
        STRATEGY:
        1. **Core Concept:** Generate queries for the specific section/topic the user asked for.
        2. **Related Scope:** You MAY include queries for legally connected sections (Parent/Child relationships).
           - *Example:* If User asks "Section 14", it is valid to search for "Section 14A disallowance" as it is a specific application of Section 14.
        3. **Keywords:** Use terms like "principles", "reasoning", "applicability".
        
        EXAMPLE:
        User: "Cases on Section 14"
        Output Queries: 
        - "Principles of computing income under Section 14"
        - "Jurisprudence on Section 14 and Section 14A relationship"
        - "Supreme Court judgments on exempt income Section 14"
        """

    prompt = ChatPromptTemplate.from_messages([("system", system_prompt), ("human", "{question}")])
    
    try:
        result = (prompt | structured_llm).invoke({"question": question})
    except:
        class Fallback:
            tool_choice = "direct_answer"
            file_search_queries = []
            case_search_queries = []
        result = Fallback()
    
    print(f"[Router] Decision: {result.tool_choice}")
    return {
        "tool_choice": result.tool_choice,
        "file_search_queries": getattr(result, "file_search_queries", []),
        "case_search_queries": getattr(result, "case_search_queries", [])
    }

# --- NODE 2: RETRIEVER (ROBUST / MANUAL PARSE) ---
def retriever_node(state: GraphState):
    print("\n--- NODE: Retriever ---")
    route = state["tool_choice"]
    file_qs = state.get("file_search_queries", [])
    initial_case_qs = state.get("case_search_queries", []) 
    thread_id = state.get("thread_id") 
    
    documents = []
    source_metadata_list = []
    
    # ---------------------------------------------------------
    # STEP 1: RETRIEVE FILE CONTENT
    # ---------------------------------------------------------
    file_results = []
    if route in ["file_search", "hybrid_search"]:
        print(f"   [Step 1] Searching User File: {file_qs}")
        results_dict = rag_retriever.retrieve_split(
            file_queries=file_qs, case_queries=[], thread_id=thread_id, top_k=5
        )
        file_results = results_dict.get("files", [])
        
        if file_results:
            documents.append("### FACTS FROM UPLOADED FILE")
            for res in file_results:
                meta = res.get("metadata", {})
                content = meta.get("text", "")
                if content:
                    documents.append(f"SOURCE DOC: {meta.get('filename')}\nCONTENT: {content}")
                    source_metadata_list.append({"full_path": meta.get('source'), "metadata": meta})

    # ---------------------------------------------------------
    # STEP 2: DYNAMICALLY GENERATE CASE QUERIES (MANUAL PARSE MODE)
    # ---------------------------------------------------------
    final_case_qs = initial_case_qs 
    
    if route == "hybrid_search" and file_results:
        print("   [Step 2] Analyzing File Content to refine Case Search...")
        
        retrieved_text_blob = "\n".join([r['metadata']['text'] for r in file_results])[:3000]
        
        # WE DO NOT USE WITH_STRUCTURED_OUTPUT HERE. WE ASK FOR PLAIN STRING AND PARSE IT.
        query_prompt = f"""You are a Legal Research Assistant.
        
        FACTS FROM FILE:
        {retrieved_text_blob}
        
        TASK: Generate 3 specific search queries for a Supreme Court Case Database based on the legal issues in these facts.
        
        OUTPUT FORMAT:
        Return ONLY a JSON object with a single key "queries" containing a list of strings.
        Example: {{"queries": ["Section 148 notice validity", "Supreme Court judgment on reassessment"]}}
        
        Do NOT add markdown. Do NOT add explanations.
        """
        
        try:
            # 1. Invoke as standard chat
            response = llm_router.invoke([HumanMessage(content=query_prompt)])
            raw_content = response.content.strip()
            
            # 2. Clean Markdown
            if "```json" in raw_content:
                raw_content = raw_content.split("```json")[1].split("```")[0].strip()
            elif "```" in raw_content:
                raw_content = raw_content.split("```")[1].split("```")[0].strip()
                
            # 3. Parse JSON
            parsed_json = json.loads(raw_content)
            
            # 4. Extract List
            dynamic_queries = parsed_json.get("queries", [])
            
            if dynamic_queries:
                print(f"   [Smart Query] Generated: {dynamic_queries}")
                final_case_qs.extend(dynamic_queries)
            else:
                print("   [Warning] JSON parsed but no 'queries' key found.")

        except Exception as e:
            print(f"   [Warning] Failed to generate dynamic queries: {e}")
            print(f"   [Debug] Raw LLM Output was: {raw_content if 'raw_content' in locals() else 'Unknown'}")

    # ---------------------------------------------------------
    # STEP 3: RETRIEVE CASES
    # ---------------------------------------------------------
    if route in ["case_search", "hybrid_search"] and final_case_qs:
        print(f"   [Step 3] Searching Case Law DB: {final_case_qs}")
        
        results_dict = rag_retriever.retrieve_split(
            file_queries=[], case_queries=final_case_qs, thread_id=thread_id, top_k=5
        )
        
        if results_dict.get("cases"):
            documents.append("### RELEVANT LEGAL PRECEDENTS (EXTERNAL DB)")
            for res in results_dict["cases"]:
                meta = res.get("metadata", {})
                
                # --- METADATA EXTRACTION ---
                # Expected format: [CaseName, Bench, Date, Filename]
                case_meta = meta.get("case_metadata", [])
                
                case_name = case_meta[0] if len(case_meta) > 0 else "Unknown Case"
                bench = case_meta[1] if len(case_meta) > 1 else "Unknown Bench"
                date_str = case_meta[2] if len(case_meta) > 2 else "2000-01-01"
                filename = case_meta[3] if len(case_meta) > 3 else "unknown.pdf"

                # Convert Date (YYYY-MM-DD) to Month Name
                try:
                    date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d")
                    year_name = date_obj.strftime("%Y") 
                    month_name = date_obj.strftime("%m") 
                except:
                    year_name = "Unknown"
                    month_name = "Unknown"
                
                # --- FORMAT SOURCE STRING ---
                # Format: Bench/Month/Filename
                formatted_source_path = f"{bench}/{year_name}/{month_name}/{filename}"
                
                main_issue = meta.get("main_issue", "N/A")
                reasoning = meta.get("decision_reasoning", "N/A")
                outcome = meta.get("decided_in_favor_of", "Unknown")
                
                if reasoning != "N/A":
                    block = (f"CASE: {case_name}\nISSUE: {main_issue}\nOUTCOME: {outcome}\nREASONING: {reasoning}")
                    documents.append(block)
                    
                    # Store the formatted path for the API Response
                    source_metadata_list.append({
                        "full_path": formatted_source_path, 
                        "metadata": meta
                    })

    print(f"[Retriever] Retrieved {len(documents)} context blocks.")
    return {"documents": documents, "source_metadata": source_metadata_list}

# --- NODE 3: RAG GENERATOR (Unchanged) ---
def generate_rag_node(state: GraphState):
    print("\n--- NODE: Generator (RAG) ---")
    question = state["question"]
    docs = state["documents"]
    all_potential_sources = state.get("source_metadata", [])
    
    if not docs:
        return {"final_answer": "I searched but could not find specific information. Please refine your query."}

    context_str = "\n\n".join(docs)[:18000]
    
    prompt = f"""You are an expert Indian Tax Lawyer and Legal Drafter.
    
    USER QUERY: {question}
    
    LEGAL CONTEXT:
    {context_str}
    
    DRAFTING INSTRUCTIONS:
    1. **Primary Source:** Use facts from the 'UPLOADED FILE CONTENT' to fill specific details (Dates, Names).
    2. **Legal Backing:** Use principles from 'RELEVANT LEGAL PRECEDENTS' to strengthen the arguments.
       - *Example:* "Reliance is placed on [Case Name], where it was held that..."
       - YOU MUST CITE cases if they are relevant.
    3. **Tone:** Formal, Authoritative.
    
    CITATION RULES:
    - You MUST cite the sources you use.
    - If retrieved cases are not exact matches but are RELATED (e.g., Section 14A vs 14), you MAY cite them but must clearly explain the distinction.
    - Do not hide retrieved cases if they are the only ones found; explain their relevance instead.
    - For Files: [Source: Filename]
    - For Cases: [Case: Case Name]
    """
    
    response = llm_gen.invoke([HumanMessage(content=prompt)])
    final_answer = response.content

    filtered_sources = []
    seen_paths = set()
    
    print(f"   [Filter] Checking {len(all_potential_sources)} potential sources against answer...")
    
    for source in all_potential_sources:
        meta = source.get("metadata", {})
        
        # Get the identifiers
        filename = meta.get("filename", "#####")
        
        # Handle Case Names (List format)
        case_name = "#####"
        if meta.get("case_metadata") and isinstance(meta["case_metadata"], list):
            if len(meta["case_metadata"]) > 0:
                case_name = meta["case_metadata"][0]

        # CHECK: Is the Filename OR Case Name present in the LLM's answer?
        # We use strict string matching. The prompt above encourages exact copying.
        if (filename in final_answer) or (case_name in final_answer):
            
            # Avoid duplicates (e.g. if multiple chunks from same file were used)
            full_path = source.get("full_path")
            if full_path not in seen_paths:
                filtered_sources.append(source)
                seen_paths.add(full_path)
                print(f"   [Filter] Kept Source: {filename or case_name}")

    print(f"   [Filter] Final Source Count: {len(filtered_sources)}")

    # 3. Return updated state
    # We overwrite 'source_metadata' with the filtered list
    return {
        "final_answer": final_answer, 
        "source_metadata": filtered_sources
    }
    # return {"final_answer": response.content}

#  (Direct Generator and Metadata Node remain the same) 
def generate_direct_node(state: GraphState):
    print("\n--- NODE: Generator (Direct) ---")
    question = state["question"]
    summary = state.get("conversation_summary", "")
    prompt = f"You are an Indian Tax Law expert. Answer directly.\nQuery: {question}\nContext: {summary}"
    response = llm_gen.invoke([HumanMessage(content=prompt)])
    return {"final_answer": response.content}

# --- NODE 5: METADATA ---
def metadata_node(state: GraphState):
    print("\n--- NODE: Metadata ---")
    question = state["question"]
    # Truncate answer to ~3000 chars to save context window/tokens
    answer = state["final_answer"][:3000] 
    old_summary = state.get("conversation_summary", "")
    
    # We use the Router model because it is better at strict JSON instruction following
    structured_llm = llm_router.with_structured_output(ChatMetadata)
    
    system_prompt = """You are a background conversation processor. 
    Your job is to maintain the chat history and generate metadata.
    
    OUTPUT INSTRUCTIONS:
    1. 'title': Generate a professional title (6-10 words) for this session.
    2. 'updated_conversation_summary': Read the OLD SUMMARY and the NEW INTERACTION. Write a single fluid narrative paragraph (max 4 sentences) describing what has happened so far. Do NOT just append; synthesize.
    3. 'follow_up_question': Generate one relevant legal follow-up question for the user.
    """
    
    user_prompt = f"""
    --- OLD CONTEXT ---
    {old_summary}
    
    --- NEW INTERACTION ---
    User: {question}
    AI: {answer}
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", user_prompt)
    ])
    
    try:
        # SINGLE CALL: Generates Title + Summary + Follow-up in one shot
        meta = (prompt | structured_llm).invoke({})
        
        print(f"[Metadata] Updated Summary: {meta.updated_conversation_summary[:100]}...")
        
        return {
            "chat_title": meta.title,
            "updated_summary": meta.updated_conversation_summary,
            "follow_up": meta.follow_up_question
        }
        
    except Exception as e:
        print(f"[Metadata] Warning: 1-Call generation failed ({str(e)}). Using Fallback.")
        # Fallback: Simple string concatenation if JSON fails
        return {
            "chat_title": "Legal Consultation",
            "updated_summary": (old_summary + f" User asked: {question}. AI answered.")[:1000],
            "follow_up": "Do you have any other questions?"
        }