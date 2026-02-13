

# ⚖️ LexAssist — AI Legal Research & Drafting Assistant

> A specialised AI chatbot for lawyers — retrieves relevant case files and generates court-ready legal drafts using **FastAPI**, **LangGraph**, **RAG**, and **React**.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-blueviolet?style=flat)](https://langchain-ai.github.io/langgraph/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
---

## 🌟 Overview

LexAssist helps legal professionals instantly retrieve relevant case precedents, judgments, and statutes from their own document repository — and generate structured legal drafts (bail applications, petitions, plaints, notices, and more) grounded in those retrieved documents.

Powered by a **RAG pipeline** for accurate, citation-backed answers and a **LangGraph agent** that intelligently routes between case retrieval, legal Q&A, and draft generation.

---

## ✨ Features

- 🔍 **Semantic Case Retrieval** — Search case files in plain language with jurisdiction-aware filtering
- 📝 **Legal Draft Generation** — Auto-generate bail applications, petitions, plaints, notices, contracts, and more
- 🤖 **LangGraph Agent** — Intent-aware routing between retrieval, Q&A, and drafting workflows
- ⚡ **Streaming Responses** — Real-time token streaming via SSE
- 📎 **Source Citations** — Every answer references the exact case file and page
- 💬 **Multi-Turn Chat** — Full conversation memory across a legal session

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11+ |
| AI Orchestration | LangGraph, LangChain |
| LLM | OpenAI GPT-4o / Anthropic Claude |
| Vector Store | ChromaDB / Pinecone |
| Document Parsing | PyMuPDF, LangChain Loaders |

---