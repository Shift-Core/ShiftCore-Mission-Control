# ShiftCore Mission Control

## Project Overview

ShiftCore Mission Control is an internal web application and a team practice project. The long-term product brings sprint tasks, blockers, delivery health, decisions, pull-request context, and summaries into one workspace. 

### The Problem
Delivery information is spread across Jira, GitHub, chat, meetings, and documents. That makes ownership, current work, blockers, and progress difficult to understand. This project serves as a safe environment for the team to learn estimation, contracts, integration, review, testing, and release discipline.

### MVP (August 24 Release Goal)
Deliver a small but real vertical slice that uses the actual frontend, gateway, services, database, authentication flow, and runbook. The MVP includes:
- Starting the reviewed stack from a clean clone.
- Signing in with a seeded active Lead account.
- Loading one seeded project, its active sprint, tasks, blockers, and KPIs.
- Displaying tasks on a three-column board.
- Moving a `To Do` task to `In Progress` and persisting the change.
- Requesting a structured weekly-summary preview from the AI/Data API.

## Project Structure

*(Project hierarchy to be defined)*

## Team Workflow & Guidelines

This repository strictly follows the ShiftCore Team Handbook guidelines. We prioritize clean git practices, code reviews, and proper task management. 

### Branching Strategy
- **`main`**: The production-ready branch. All releases are merged here from `develop`.
- **`develop`**: The active development branch. All feature branches are created from here and merged back here.

### Important Links

**Team Handbook**
- [Team Handbook Repository](https://github.com/Shift-Core/team-handbook)
- [Start Here Guide](https://github.com/Shift-Core/team-handbook/blob/main/docs/00-start-here.md)
- [Git Workflow](https://github.com/Shift-Core/team-handbook/blob/main/docs/git/git-workflow.md)
- [Branch and Commit Rules](https://github.com/Shift-Core/team-handbook/blob/main/docs/git/branch-and-commit-rules.md)
- [Pull Request Guide](https://github.com/Shift-Core/team-handbook/blob/main/docs/git/pull-request-guide.md)

**Project Wiki**
- [ShiftCore Mission Control Wiki](https://github.com/Shift-Core/ShiftCore-Mission-Control/wiki)
- [Project Overview](https://github.com/Shift-Core/ShiftCore-Mission-Control/wiki/01-Project-Overview)
- [MVP Scope](https://github.com/Shift-Core/ShiftCore-Mission-Control/wiki/02-MVP-Scope)
- [Architecture & Design](https://github.com/Shift-Core/ShiftCore-Mission-Control/wiki/08-System-Architecture)
