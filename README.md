# Old City Sand Washing — Delivery Management System

## Quick Start

```bash
npm install
npm run dev
```
Then open http://localhost:3000

## Default Credentials
- **Admin**: `admin` / `admin123`
- **User**: `user1` / `user123`

## Features
- **Delivery Slips** — Create, view, edit, delete. Filters by date/company/vehicle. Printable PDF delivery note.
- **Tax Invoices** — Full VAT calculation, auto invoice numbering, PDF download, Excel export by date range.
- **Management** — Admin-only dashboard with stats, manage companies & materials lists.
- **Auth** — JWT cookie-based login with role-based access (admin vs user).

## Database
SQLite via sql.js — stored in `/data/delivery.db`. Auto-created on first run with seed data.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- sql.js (SQLite in Node)
- bcryptjs (password hashing)
- jose (JWT)
- jsPDF + html2canvas (PDF generation)
- xlsx (Excel export)
