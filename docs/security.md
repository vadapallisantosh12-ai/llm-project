# DevAgent AI — Security Architecture

## 1. Filesystem Security Model

DevAgent AI interacts with real files on local Windows systems. Because untrusted projects or prompts might attempt path traversal, the platform enforces strict filesystem boundaries:

- **Canonical Path Resolution**: All paths are resolved using `Path.resolve(strict=False)` before inspection or modification.
- **Drive Letter Matching**: On Windows, cross-drive traversal attempts (e.g. escaping `C:\` to `D:\`) are explicitly rejected.
- **Root Enclosure Verification**: Every requested file target must be strictly relative to the registered project root (`target.relative_to(root)`).
- **Default Exclusion Policy**: Sensitive directories (`.git`, `.venv`, `node_modules`, `build`, `dist`) and credentials (`.env`, `id_rsa`, `*.pem`, `*.key`) are completely excluded from indexing and inspection.

## 2. Command Execution & Subprocess Limits

- **No Arbitrary Shell Execution**: Commands are never constructed via raw shell concatenation.
- **Allowlist Policies**: Subprocesses are restricted to approved developer commands (e.g. pytest, npm test).
- **Execution Timeouts**: All child processes have a hard timeout (default: 30 seconds) and terminate with process trees.
- **Bounded Output**: Output capture is capped to prevent memory exhaustion from runaway loops.
- **Explicit Human Approval**: Operations that alter files or execute commands require explicit confirmation from the user.

## 3. Secret Protection & Prompt Injection Defense

- **Secret Redaction**: High-entropy strings, OpenAI API keys (`sk-...`), JWT tokens, and private keys are redacted by `SecretRedactionFilter` before logging.
- **Untrusted Context**: Repository files and error outputs are treated as untrusted data and delimited in AI prompts to prevent prompt injection.
