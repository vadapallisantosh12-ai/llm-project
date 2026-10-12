# Contributing to DevAgent AI

Thank you for contributing to DevAgent AI.

## Core Rules

1. **NO DOCKER**: Do not add Dockerfiles, Compose files, or container-based workflows. Everything must run natively on Windows.
2. **Security First**: All file accesses must use `validate_path_within_root()`. Commands must use strict allowlists and timeouts.
3. **No Fake Code**: Do not mock backend behavior with hardcoded frontend data. Features must be real or clearly noted as scheduled.
4. **Testing**: Every change must be accompanied by automated tests (`pytest backend/tests`). Run `ruff check backend` before committing.
