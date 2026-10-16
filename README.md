# DevAgent AI — Intelligent AI Software Development Platform

DevAgent AI is a controlled, context-aware AI software development platform rewritten as a modern React application. It provides intelligent codebase comprehension, safe patch generation with diff reviews, controlled test execution, and multi-step development workflows.

---

## 1. What DevAgent AI Is

DevAgent AI is an extensible developer tool that inspects software projects, understands code structures, diagnoses errors, proposes traceable modifications, generates tests, and assists developers through controlled workflows.

Unlike generic chatbot interfaces that generate disconnected snippets, DevAgent AI indexes your actual repository, retrieves relevant context, proposes reviewable patches, and requires human approval before applying consequential changes.

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Lucide Icons, Dark Developer Design System.
- **Client Persistence**: High-reliability local-first storage with live state synchronization.
- **AI Integration**: Provider-agnostic engine supporting local models (Ollama), hosted models (OpenAI/Anthropic), and mock evaluation.
- **Security Guard**: Canonical path traversal protection, sensitive file exclusion, and zero external dependency risk.

## 3. Project Structure

```
.
├── src/
│   ├── api/            # Typed API client with localStorage persistence & health checks
│   ├── app/            # App entry point, routing, and main layout
│   ├── components/     # Header, Sidebar, StatusBadge, ConfirmModal
│   ├── pages/          # Dashboard, Projects, Settings, Feature Stage Previews
│   ├── types/          # TypeScript interface definitions
│   ├── index.css       # Dark developer theme and styling system
│   └── main.tsx        # React DOM render entry point
├── public/             # Static assets (favicon.svg)
├── index.html          # HTML entry point with synchronized metadata
├── metadata.json       # Applet configuration and capabilities
├── package.json        # Dependencies and scripts (Vite on port 3000)
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite dev and build setup
```

## 4. Getting Started

### Development
```bash
npm run dev
```
Starts the Vite development server on port 3000 (accessible on 0.0.0.0:3000).

### Production Build
```bash
npm run build
```
Type checks the codebase with `tsc` and builds the production bundle with `vite build`.

### Linting
```bash
npm run lint
```
Verifies TypeScript types and syntax across all source files.
