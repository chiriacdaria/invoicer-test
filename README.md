# Invoicer App

A full-stack TypeScript application that allows users to create and update invoices, built using **React**, **Ant Design**, **Node.js**, and **TypeORM**.

## 🛠 Tech Stack

- **Frontend:** React, TypeScript, Ant Design
- **Backend:** Node.js, Express/NestJS, TypeScript
- **Database:** PostgreSQL (or other SQL DB via TypeORM)
- **ORM:** TypeORM

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/chiriacdaria/invoicer-test.git
cd invoicer-test
npm i (or npm install)
npm run dev
```
# .dev.vars
```
cp .dev.vars.example .dev.vars
```
POSTGRES_URL=given_db_url

## Features Implemented

### Backend (Hono + Drizzle)
GET: Retrieve all invoices or a specific invoice by ID
POST: Create a new invoice with associated line items
PUT: Update an existing invoice and its line items
DELETE: Delete an invoice
Validation & Error Handling: Input validation and basic error messages for missing/invalid data

### Frontend (React + AntD)
Invoice List Page
- Lists all invoices with action buttons: View, Edit, Delete
- "Delete" prompts confirmation and removes invoice via API
View Invoice Page
- Displays invoice details and line items
- Improved layout with Descriptions, Table, and summary footer
- Buttons: Edit, Print
Create/Edit Invoice Page
- Unified form for creating and editing invoices
- Uses Form.List to dynamically manage line items
- Validation for all fields (amount ≥ 0.01, quantity ≥ 1)
- Form detects changes to prevent unnecessary submissions
- Smart UX with default values and formatted inputs

### Design Considerations
Used InputNumber for numeric validation and formatting
Ensured default values don't show as 0.00 by leveraging controlled inputs
Summary footer in invoice table using Table.Summary

### Challenges Faced
- Ant Design auto-formatting 0.00 as default even with initial values set
- Handling dynamic form fields with correct validation

### Future Improvements
- Add authentication
- Add tags or labels per invoice
- Better error handling and user notifications
