# Contributing to ShiftCore Mission Control

First off, thank you for considering contributing to ShiftCore Mission Control! It's people like you that make this project a great collaborative environment.

This guide outlines our process for contributing to the repository. Please ensure you also read the [Team Handbook](https://platform.shiftcore.workers.dev/docs/handbook) for our broader engineering culture and rules.

---

## Git Workflow & Branching Strategy

To maintain stability, we enforce a strict branching strategy. 

Our core branches are:
- `main`: The production-ready branch. **Never commit directly to main.**
- `develop`: The active development and integration branch.

### How to Contribute:
1. **Always branch from `develop`:** Before starting new work, ensure your local `develop` branch is up to date, then create your feature branch from it.
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b type/short-task-name
   ```
   *(e.g., `feat/SMC-94-identity-foundation`, `fix/login-bug`, `docs/update-readme`)*

2. **Commit your changes:** Follow the [Team Handbook](https://platform.shiftcore.workers.dev/docs/handbook). Use Conventional Commits format (e.g., `feat(identity): add login route`).

3. **Push to your branch:**
   ```bash
   git push -u origin type/short-task-name
   ```

4. **Open a Pull Request:**
   - All Pull Requests **MUST** be opened against the `develop` branch.
   - Do not open PRs against `main`. 
   - Releases to `main` are handled by maintainers merging `develop` into `main` after thorough testing.

---

## Local Development
Before opening a PR, ensure that:
- Your code builds correctly.
- You have verified your work locally (see [Setup Guide](setup.md) for how to run the stack).
- Any new features are properly documented in the corresponding `README.md` or `ARCHITECTURE.md` files.

For full guidelines on reviewing and submitting PRs, see the [Team Handbook](https://platform.shiftcore.workers.dev/docs/handbook).
