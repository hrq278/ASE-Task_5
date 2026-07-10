# Enterprise Inventory & Order Management System
 
A full-stack MERN application for managing products, suppliers, and customer orders across multiple branches, built with role-based access control and a DevOps-ready deployment pipeline.
 
## Tech Stack
 
- **Frontend:** React (JavaScript), Tailwind CSS, React Router, Axios, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcrypt password hashing
- **DevOps:** Docker, Docker Compose, GitHub Actions CI/CD
- **Docs:** Swagger / OpenAPI
## Features
 
- Role-based authentication (Admin, Manager, Employee)
- Product management with auto-generated codes, image upload, and validation
- Supplier management
- Order management with automatic stock deduction and total calculation
- Real-time inventory dashboard (totals, low stock, out of stock, inventory value)
- Search, filters, and pagination across product and order views
## Folder Structure
 
```
inventory-management-system/
  client/          React frontend
  server/          Express backend
  docs/            Deployment & installation guides
  api/             Swagger/OpenAPI specs
  tests/           API, UI, and security tests
  .github/workflows/  CI/CD pipeline
  docker/          Dockerfiles + docker-compose.yml
```
 
## Getting Started
 
### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Docker & Docker Compose (optional, for containerized run)
### Local Setup
 
```bash
# Clone the repo
git clone https://github.com/hrq278/inventory-management-system.git
cd inventory-management-system
 
# Backend
cd server
npm install
npm run dev
 
# Frontend
cd ../client
npm install
npm run dev
```
 
Create a `.env` file in `server/` with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```
 
### Run with Docker
 
```bash
docker compose up
```
 
This starts the client, server, and MongoDB containers together.
 
## API Documentation
 
Swagger docs available at `/api-docs` once the server is running, covering Authentication, Product, and Order APIs.
 
## Testing
 
```bash
npm test
```
 
Includes API tests (Jest + Supertest), UI tests, and security tests covering auth, validation, and role-based access.
 
## Git Workflow
 
- `main` — production-ready code
- `development` — integration branch
- `feature-*` — individual feature branches (authentication, products, orders)
- `release-v1.0` — release staging
- `hotfix` — urgent production fixes
Tagged release: `v1.0.0`
 
## License
 
Internal project — Allied Software Engineers Internship.