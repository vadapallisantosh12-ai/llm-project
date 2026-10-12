# DevAgent AI — Architecture Specification

## 1. System Overview

DevAgent AI is a controlled, intelligent software development platform built natively for Windows. It provides context-aware code analysis, debugging assistance, safe patch generation with diff reviews, controlled test execution, and multi-step development agents without requiring Docker containers.

```
+-------------------------------------------------------------+
|               DevAgent AI React & TS Frontend               |
|            (Vite, Monaco Editor, Diff Viewer, Lucide)       |
+-------------------------------------------------------------+
                              |
                     REST /api/v1 (JSON)
                              |
+-------------------------------------------------------------+
|                 FastAPI Application Server                  |
|    +---------------------------------------------------+    |
|    | API Routers: /health, /projects, /assistant, ... |    |
|    +---------------------------------------------------+    |
|    | Security Middleware: Request-ID, Path Validation  |    |
|    +---------------------------------------------------+    |
|    | Core Services: Indexing, Retrieval, LLM, Patching |    |
|    +---------------------------------------------------+    |
+-------------------------------------------------------------+
        |                                      |
+-------------------+                 +-------------------+
|   SQLite DB       |                 | Local Project FS  |
| ./app_data/db     |                 | Canonical Paths   |
+-------------------+                 +-------------------+
```

## 2. Architectural Principles

1. **Native Windows Operation**: Runs directly on Windows PowerShell without Docker abstraction or emulation.
2. **Security First**: Filesystem isolation via canonical resolution, command allowlists, and explicit human approval gates.
3. **Provider-Agnostic AI**: Unified abstraction supporting local Ollama models and optional hosted APIs (OpenAI, Anthropic) with zero frontend credential exposure.
4. **Data Isolation**: Application data, databases, and logs live strictly inside `app_data/`, isolated from registered user projects.
5. **Human Approval**: Consequential operations (file writes, test execution, destructive actions) require explicit user confirmation.
