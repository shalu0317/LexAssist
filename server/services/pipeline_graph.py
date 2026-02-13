from langgraph.graph import StateGraph, END
from services.graph_schema import GraphState
from services.nodes import (
    router_node, 
    retriever_node, 
    generate_rag_node, 
    generate_direct_node, 
    metadata_node
)

def build_rag_graph():
    print("[Graph] Building LangGraph Pipeline...")
    workflow = StateGraph(GraphState)

    # Add Nodes
    workflow.add_node("router", router_node)
    workflow.add_node("retriever", retriever_node)
    workflow.add_node("rag_generator", generate_rag_node)
    workflow.add_node("direct_generator", generate_direct_node)
    workflow.add_node("metadata_extractor", metadata_node)

    # Entry Point
    workflow.set_entry_point("router")

    # Conditional Logic
    def route_decision(state):
        choice = state["tool_choice"]
        # Map all retrieval-based intents to the Retriever Node
        if choice in ["file_search", "case_search", "hybrid_search"]:
            return "retriever"
        return "direct_generator"

    workflow.add_conditional_edges(
        "router",
        route_decision,
        {
            "retriever": "retriever",
            "direct_generator": "direct_generator"
        }
    )
    # Flow
    workflow.add_edge("retriever", "rag_generator")
    workflow.add_edge("rag_generator", "metadata_extractor")
    workflow.add_edge("direct_generator", "metadata_extractor")
    workflow.add_edge("metadata_extractor", END)

    return workflow.compile()

# Initialize global instance
rag_app = build_rag_graph()