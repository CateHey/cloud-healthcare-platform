# MediCert — Medical Certificate Management System

Cloud-native web platform for managing professional medical certification requests. Supports multi-role workflows including **ADMIN, OPERATOR, MANAGER, and DOCTOR**.

> **Note:** This system was originally designed, deployed, and is currently running in production on **AWS** (App Runner, RDS MySQL, S3, CloudFront, Lambda, Secrets Manager, EventBridge). Full AWS deployment documentation is available in the [`docs/deployment/`](docs/deployment/) directory. For portfolio demonstration purposes, this version has been adapted to run on free-tier hosting services (Render + Vercel), as AWS infrastructure incurs ongoing costs. The architecture, codebase, and business logic remain identical to the production environment.

## Requirements

- Python 3.12+ (tested with 3.13)
- Node.js 18+ (tested with 20)
- npm (included with Node.js)

## Quick Setup (After Cloning)

### 1. Backend

Navigate to the backend folder and install dependencies using requirements.txt.

### 2. Frontend

Navigate to the frontend folder and install dependencies using npm.

### 3. Create Database and Seed Test Data

Run the seed script located in the infra directory.

This creates `cmep_dev.db` (SQLite) in the project root including:

- 5 users: admin, operator, manager, doctor, suspended
- 2 promoters, 3 clients, 3 services

### 4. Run Locally

Start backend and frontend services in separate terminals.

### 5. Access

- Frontend: http://localhost:3000  
- Backend API: http://localhost:8000  
- Health Check: http://localhost:8000/health  

### Test Users

| Email | Password | Role |
|--------|-------------|-----------|
| admin@cmep.local | admin123 | ADMIN |
| operador@cmep.local | operador123 | OPERATOR |
| gestor@cmep.local | gestor123 | MANAGER |
| medico@cmep.local | medico123 | DOCTOR |

## Tests

The backend contains 117 unit and integration tests executed against an isolated in-memory database.

## Project Structure

backend/ — Python / FastAPI backend  
- app/api — Endpoints (auth, requests, admin, reports, files)  
- app/models — SQLAlchemy ORM models (person, user, client, request, etc.)  
- app/schemas — Pydantic request/response validation  
- app/services — Business logic (policy, workflow, reporting)  
- app/middleware — Session middleware  
- app/utils — Hashing and time utilities  
- tests — Unit and integration tests  

frontend/ — React 18 / TypeScript / Vite  
- src/pages/app — Dashboard, Requests, Users, Reports  
- src/components — Layout and Stepper UI  
- src/services — API client  
- src/types — TypeScript interfaces  

docs/  
- source — Original system documentation  
- claude — Technical specifications and roadmap  

infra/  
- Infrastructure configuration, Docker, seed scripts  

## Tech Stack

- Backend: FastAPI, SQLAlchemy 2.0 (async), Pydantic  
- Frontend: React 18, React Router, TypeScript, Vite, Recharts  
- Database: SQLite (development) / MySQL (production)  
- Authentication: Server-side session management with httpOnly cookies  

---

# Professional Experience Summary

Designed and implemented a **production-ready medical certification management platform**, delivering a secure, scalable, and highly available solution.

## Key Contributions

### Full-Stack Development

- Engineered backend services using FastAPI, SQLAlchemy 2.0 (async), and Pydantic, ensuring high-performance asynchronous processing and robust data validation.
- Developed a modern, responsive frontend using React 18, TypeScript, Vite, and React Router, optimizing performance and maintainability.
- Implemented role-based workflow automation supporting multi-actor medical certification processes.
- Designed modular UI architecture with state-driven authorization logic.

### Cloud Architecture & Deployment

Architected and deployed the system with cloud-ready infrastructure, ensuring scalability, reliability, and operational efficiency.

#### Infrastructure

- Containerized backend deployment with automatic scaling
- Production-grade relational database management with migration strategy from SQLite
- Secure document storage for medical certificates and attachments
- Global low-latency delivery of the React SPA via CDN
- Centralized credential and environment configuration management
- Automated background processing and scheduled system maintenance tasks

### System Design & Security

- Designed a multi-role workflow engine controlling medical certification lifecycle states.
- Implemented secure document processing pipelines.
- Developed session-based authentication with secure cookie handling.
- Built scalable REST APIs supporting high concurrency and asynchronous operations.
