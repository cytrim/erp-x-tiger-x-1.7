# Tiger X Panel – ERP Starter (MERN, MIT, Dark/Orange Theme)

**Features**
- MERN (Node/Express + MongoDB + React/Vite)
- Auth (JWT) + RBAC
- Modules: Customers, Products, Quotes, Invoices
- i18n (de/en), Ant Design v5 Dark + orange (#ff6b35)
- Docker Compose + local dev

**Start (Docker)**
```bash
cp .env.example .env
docker compose up --build -d
docker compose exec api node src/scripts/seed-admin.js
# Web: http://localhost:5173  · API: http://localhost:5000/api/health
```
