<div align="center">
  <h1>ShiftCore Mission Control</h1>
  <p>The central hub for project delivery, task management, and team collaboration.</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://www.postgresql.org/)
</div>

---

## The Problem
Delivery information is spread across Jira, GitHub, chat, meetings, and documents. That makes ownership, current work, blockers, and progress difficult to understand. This project serves as a safe environment for the team to learn estimation, contracts, integration, review, testing, and release discipline.

## MVP (August 24 Release Goal)
Deliver a small but real vertical slice that uses the actual frontend, gateway, services, database, authentication flow, and runbook. The MVP includes:
- Starting the reviewed stack from a clean clone.
- Signing in with a seeded active Lead account.
- Loading one seeded project, its active sprint, tasks, blockers, and KPIs.
- Displaying tasks on a three-column board.
- Moving a `To Do` task to `In Progress` and persisting the change.
- Requesting a structured weekly-summary preview from the AI/Data API.

---

## Project Structure (Monorepo)

This repository operates as a monorepo containing multiple microservices, the API gateway, and the frontend application.

```text
ShiftCore-Mission-Control/
├── frontend/             # Vite / React application (UI)
├── gateway/              # NGINX API Gateway (Reverse Proxy)
├── services/             # Backend Microservices
│   ├── identity-api/     # .NET 8 API (Authentication & Authorization)
│   ├── core-api/         # Express.js / Node API (Tasks & Projects)
│   └── ai-api/           # FastAPI / Python (AI integration for summaries)
├── docker-compose.yml    # Root orchestration for the entire stack
└── setup.md              # Local Environment Setup Guide
```

---

## Quick Start

For detailed instructions on running the environment, configuring environment variables, and local debugging, please refer to the **[Setup Guide](setup.md)**.

```bash
# 1. Setup Environment
cp .env.example .env

# 2. Run the full stack
docker compose up --build -d
```

---

## Important Links

### Team Handbook
- [Contributing Guidelines](CONTRIBUTING.md) (Local Guide)
- [Team Handbook Repository](https://github.com/Shift-Core/team-handbook)
- [Start Here Guide](https://github.com/Shift-Core/team-handbook/blob/main/docs/00-start-here.md)
- [Git Workflow](https://github.com/Shift-Core/team-handbook/blob/main/docs/git/git-workflow.md)
- [Branch and Commit Rules](https://github.com/Shift-Core/team-handbook/blob/main/docs/git/branch-and-commit-rules.md)
- [Pull Request Guide](https://github.com/Shift-Core/team-handbook/blob/main/docs/git/pull-request-guide.md)

### Project Wiki
- [ShiftCore Mission Control Wiki](https://github.com/Shift-Core/ShiftCore-Mission-Control/wiki)
- [Project Overview](https://github.com/Shift-Core/ShiftCore-Mission-Control/wiki/01-Project-Overview)
- [MVP Scope](https://github.com/Shift-Core/ShiftCore-Mission-Control/wiki/02-MVP-Scope)
- [Architecture & Design](https://github.com/Shift-Core/ShiftCore-Mission-Control/wiki/08-System-Architecture)

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
