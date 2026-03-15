# 🌿 Neema Environmental Management System

> **mazingira yetu | uhai wetu | wajibu wetu**
> *our environment | our life | our responsibility*

A full-stack environmental management web application built for Kenya's 47 counties — tracking projects, incidents, licenses, research, audits and donations through a live MySQL database with role-based dashboards.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Features by Role](#features-by-role)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
- [MySQL Objects](#mysql-objects)
- [Screenshots](#screenshots)
- [What I Learned](#what-i-learned)

---

## Overview

Neema DBMS is a complete full-stack project built from scratch using **MySQL**, **Node.js**, **Express** and **Vanilla JavaScript**. It manages environmental data across all 47 Kenyan counties with four separate role-based dashboards — Public, Employee, Manager and Admin.

### Key Numbers

| Metric | Count |
|--------|-------|
| MySQL Tables | 12 |
| Views | 6 |
| Stored Functions | 13 |
| Stored Procedures | 2 |
| API Endpoints | 40+ |
| User Roles | 4 |
| Counties Covered | 47 |
| Data Rows (bulk) | 300+ per table |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Database | MySQL 8.0 | All data storage, views, functions, procedures |
| Backend | Node.js v24 + Express.js | REST API server |
| DB Driver | mysql2 | MySQL connection & parameterised queries |
| Frontend | HTML5 + CSS3 | Role-based dashboards |
| Logic | Vanilla JavaScript | DOM manipulation, async/await, fetch API |
| Tools | MySQL Workbench | Schema design & query execution |

---

## Database Schema

```
Branches (47 counties)
    ├── Employees ──────────────────── self-ref (ManagerID)
    │       ├── ProjectTeam
    │       ├── Inspections (as inspector)
    │       ├── Incidents (as reporter)
    │       ├── ResearchStudies (as lead researcher)
    │       └── EnvironmentalAudits (as lead auditor)
    │
    ├── Projects
    │       ├── ProjectTeam
    │       └── ProjectFunding
    │
    └── Organizations
            ├── Licenses
            │       └── Inspections
            └── EnvironmentalAudits

Donors
    ├── ProjectFunding
    └── ResearchFunding ──── ResearchStudies
```

### Tables

| Table | Description | Key Relationships |
|-------|-------------|-------------------|
| `Branches` | Kenya's 47 county offices | Referenced by almost all tables |
| `Employees` | All staff members | Self-referencing FK (ManagerID) |
| `Projects` | Environmental projects | → Branches, Employees |
| `ProjectTeam` | Many-to-many: Projects ↔ Employees | Junction table |
| `Organizations` | Registered env. organizations | → Branches |
| `Licenses` | Org license applications | → Organizations |
| `Inspections` | License inspection records | → Licenses, Employees |
| `Incidents` | Reported environmental incidents | → Branches, Employees |
| `Donors` | Funding partners | Referenced by funding tables |
| `ProjectFunding` | Donor → Project funding | Junction table |
| `EnvironmentalAudits` | Org compliance audits | → Organizations, Employees |
| `ResearchStudies` | Environmental research | → Branches, Employees |

---

## Features by Role

### 🌍 Public Portal (`/public.html`)
- No login required
- Browse Projects, Incidents, Research Publications, Organizations
- Live search and filtering
- Counts from live database
- Prompt to sign in for more detail

### 👤 Employee (`/employee.html`)
- Login: `neema_employee` / `NeemaEmp2026!`
- View all 6 report views (read-only)
- Submit new incident reports (writes to database)
- Live stats dashboard

### 🔑 Manager (`/manager.html`)
- Login: `neema_manager` / `NeemaManager2026!`
- All 6 report views (read-only)
- Full CRUD on: **Employees**, **Projects**, **Incidents**
- Incident reporting form
- Modal-based add/edit forms

### ⚙️ Admin (`/admin.html`)
- Login: `neema_admin` / `NeemaAdmin2026!`
- Full CRUD on all **8 tables**
- Search and filter on every table
- Add/Edit via modal pop-up forms
- Delete with confirmation
- Toast notifications on every action
- Live row counts

---

## Project Structure

```
neema-app/
├── server.js                  # Express API server
├── package.json
├── node_modules/
└── public/
    ├── index.html             # Login page (4 roles)
    ├── public.html            # Public portal (no login)
    ├── employee.html          # Employee dashboard
    ├── manager.html           # Manager dashboard
    └── admin.html             # Admin dashboard (full CRUD)

sql/
├── neema_complete.sql         # Full DB rebuild (DROP → CREATE → INSERT)
├── neema_more_data.sql        # 10 additional rows per table
├── neema_bulk_data.sql        # 200 Python-generated rows per table
├── neema_10_each.sql          # 10 targeted rows per table
└── neema_mysql_extras.sql     # Procedures, functions, AppSettings
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- [MySQL 8.0](https://dev.mysql.com/downloads/) or higher
- [MySQL Workbench](https://www.mysql.com/products/workbench/) (recommended)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/neema-dbms.git
cd neema-dbms

# 2. Install dependencies
cd neema-app
npm install

# 3. Set up the database (see Database Setup below)

# 4. Start the server
node server.js
```

Open **http://localhost:3000** in your browser.

---

## Database Setup

### Option A — Full Rebuild (Recommended)

Open MySQL Workbench and run:

```
File → Open SQL Script → neema_complete.sql → ⚡ Execute All
```

> ⚠️ This **DROPS** and recreates `neema_db` from scratch. All existing data will be lost.

### Option B — Step by Step

```sql
-- 1. Run base schema and data
SOURCE neema_complete.sql;

-- 2. Add more data (optional)
SOURCE neema_more_data.sql;

-- 3. Add bulk data (optional, 200+ rows per table)
SOURCE neema_bulk_data.sql;
```

### Before Running

In MySQL Workbench go to:
**Edit → Preferences → SQL Editor** → uncheck **"Safe Updates"** → reconnect.

### MySQL Users Created

| Username | Password | Role |
|----------|----------|------|
| `neema_admin` | `NeemaAdmin2026!` | Full access — all tables |
| `neema_manager` | `NeemaManager2026!` | CRUD on Employees, Projects, Incidents |
| `neema_employee` | `NeemaEmp2026!` | Read-only — views only |

---

## Running the App

```bash
cd neema-app
node server.js
```

Expected output:
```
Connected to neema_db
Neema running at http://localhost:3000
```

Then open:

| URL | Page |
|-----|------|
| `http://localhost:3000` | Login page |
| `http://localhost:3000/public.html` | Public portal |
| `http://localhost:3000/employee.html` | Employee dashboard |
| `http://localhost:3000/manager.html` | Manager dashboard |
| `http://localhost:3000/admin.html` | Admin dashboard |

---

## API Endpoints

All endpoints served by `server.js` on port **3000**.

### GET (Read)

| Endpoint | Returns |
|----------|---------|
| `GET /api/stats` | Dashboard counts (employees, projects, incidents...) |
| `GET /api/employees` | All employees with branch and manager names |
| `GET /api/projects` | All projects with branch and lead names |
| `GET /api/incidents` | All incidents with branch and reporter names |
| `GET /api/licenses` | All licenses with org names |
| `GET /api/organizations` | All organizations with branch names |
| `GET /api/donors` | All donors |
| `GET /api/research` | All research studies |
| `GET /api/audits` | All environmental audits |
| `GET /api/branches` | All 47 county branches (used for dropdowns) |

### Report Views

| Endpoint | MySQL View |
|----------|-----------|
| `GET /api/reports/projects` | `VW_Report_Projects_Overview` |
| `GET /api/reports/hr` | `VW_Report_HR_Directory` |
| `GET /api/reports/incidents` | `VW_Report_Incidents_Log` |
| `GET /api/reports/compliance` | `VW_Report_Regulatory_Compliance` |
| `GET /api/reports/finance` | `VW_Report_Financial_Donations` |
| `GET /api/reports/research` | `VW_Report_Research_Portfolio` |

### POST / PUT / DELETE (CRUD)

All tables support full CRUD via:

```
POST   /api/{table}       → INSERT new record
PUT    /api/{table}/:id   → UPDATE record by ID
DELETE /api/{table}/:id   → DELETE record by ID
```

Where `{table}` is one of: `employees`, `projects`, `organizations`, `licenses`, `incidents`, `donors`, `research`, `audits`

---

## MySQL Objects

### Views (6)

| View | Purpose |
|------|---------|
| `VW_Report_HR_Directory` | Employee list with branch and manager names |
| `VW_Report_Projects_Overview` | Projects with location and lead names |
| `VW_Report_Incidents_Log` | Incidents with location and reporter names |
| `VW_Report_Regulatory_Compliance` | Org licenses + audit scores (4-table JOIN) |
| `VW_Report_Financial_Donations` | Donor totals using SUM + GROUP BY |
| `VW_Report_Research_Portfolio` | Research studies with funding totals |

### Stored Functions (13)

| Function | Returns | Use |
|----------|---------|-----|
| `fn_full_name(id)` | `VARCHAR` | Employee full name |
| `fn_branch_name(id)` | `VARCHAR` | County name from BranchID |
| `fn_manager_name(id)` | `VARCHAR` | Employee's manager name |
| `fn_employee_count_by_branch(id)` | `INT` | Staff count per county |
| `fn_project_status(id)` | `VARCHAR` | Not Started / Active / Completed |
| `fn_project_duration_days(id)` | `INT` | Days between start and end |
| `fn_total_project_funding(id)` | `DECIMAL` | Sum of all donations to a project |
| `fn_budget_utilisation_pct(id)` | `DECIMAL` | Funded ÷ budget × 100 |
| `fn_license_is_expired(id)` | `VARCHAR` | YES / NO / N/A |
| `fn_days_to_license_expiry(id)` | `INT` | Days remaining (negative = expired) |
| `fn_org_compliance_score(id)` | `DECIMAL` | Average audit score for an org |
| `fn_incident_count_by_branch(id)` | `INT` | Total incidents per county |
| `fn_format_kes(amount)` | `VARCHAR` | Formats as "KES 1,234.00" |

### Stored Procedures (2)

| Procedure | Purpose |
|-----------|---------|
| `sp_welcome()` | Displays personalised greeting with live stats on login |
| `sp_add_image_columns()` | Safely adds image URL columns using INFORMATION_SCHEMA check |

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Error 1054: Unknown column 'Branch'` | Wrong column name — it's `BranchID` | Use `BranchID INT` not `Branch ENUM` |
| `Error 1064: Syntax error near 'ang'a'` | Apostrophe in `Ng'ang'a` breaks SQL | Escape as `Ng''ang''a` |
| `Error 1175: Safe update mode` | UPDATE without WHERE key column | Disable Safe Updates in Workbench Preferences |
| `Error 1396: CREATE USER failed` | User already exists | Add `DROP USER IF EXISTS` before `CREATE USER` |
| `Error 1452: FK constraint fails` | Inserting child before parent | Add `SET FOREIGN_KEY_CHECKS = 0` before bulk insert |
| `node: command not found` | Node.js not in PATH | Reinstall Node.js and restart terminal |
| `Cannot find module` | Running `node server.js` from wrong folder | `cd neema-app` first |

---

## What I Learned

This project was built as a hands-on learning experience covering:

**MySQL**
- Relational schema design with foreign keys and ENUM constraints
- Self-referencing relationships (employee → manager)
- Many-to-many junction tables (ProjectTeam, ProjectFunding)
- Views as stable report interfaces
- Stored procedures with DECLARE, IF/ELSEIF, multiple result sets
- User-defined functions with DETERMINISTIC, READS SQL DATA
- User creation and privilege management (least privilege principle)
- Bulk data generation and import strategies
- INFORMATION_SCHEMA queries for dynamic schema management
- BLOB storage with FROM_BASE64() for binary data

**Node.js & Express**
- REST API design (GET/POST/PUT/DELETE → SELECT/INSERT/UPDATE/DELETE)
- Parameterised queries to prevent SQL injection
- Middleware pattern (express.json(), express.static())
- Error handling with try/catch and HTTP status codes
- The DRY helper function pattern

**JavaScript**
- async/await and Promise.all for parallel API calls
- DOM manipulation for dynamic table rendering
- Real-time search with Array.filter()
- Template literals for HTML generation
- Event listeners and form handling
- Client-side role-based routing

**HTML & CSS**
- CSS custom properties (variables) for theming
- Flexbox split-screen layout
- Responsive design with media queries
- Modal forms without a framework
- Toast notifications

---

## License

This project is for educational purposes.

---

