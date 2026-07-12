# BigStack Management — Backend API Documentation

> NestJS + MongoDB REST API powering the **BigStack Management System** frontend.
> Deployed at: **https://bistack-management-backend.vercel.app**
> All routes are prefixed with `/api`.

---

## 📑 Table of Contents

1. [Base URL & Conventions](#-base-url--conventions)
2. [Authentication](#-authentication)
3. [Response Format](#-response-format)
4. [Error Handling](#-error-handling)
5. [Endpoints Overview](#-endpoints-overview)
6. [Students](#-students)
7. [IT Students](#-it-students)
8. [Hub Subscriptions](#-hub-subscriptions)
9. [Finance](#-finance)
10. [KCP (KidsCode Program)](#-kcp-kidscode-program)
11. [Staff](#-staff)
12. [Courses](#-courses)
13. [Roles](#-roles)
14. [Data Models Reference](#-data-models-reference)
15. [Local Development](#-local-development)
16. [Environment Variables](#-environment-variables)

---

## 🌐 Base URL & Conventions

| Environment | Base URL |
|---|---|
| **Production** | `https://bistack-management-backend.vercel.app/api` |
| **Local** | `http://localhost:3001/api` |

### Conventions

- All request and response bodies are **JSON**.
- IDs are MongoDB ObjectIds (24-char hex strings) returned as `_id`.
- Dates are stored as **ISO date strings** (`YYYY-MM-DD`) — not full timestamps.
- All collections use Mongoose `timestamps: true`, so every record has `createdAt` and `updatedAt`.

---

## 🔐 Authentication

> **No authentication is currently enforced.** The API is publicly accessible.
> Suitable for an internal tool / private deployment, but **must be secured** before going truly public.

---

## ✅ Response Format

Successful responses return the resource (or array of resources) directly as JSON.

```json
{
  "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "sn": "BST-ST001",
  "name": "John Doe",
  "createdAt": "2026-07-01T10:00:00.000Z",
  "updatedAt": "2026-07-01T10:00:00.000Z"
}
```

---

## ⚠️ Error Handling

The API uses standard HTTP status codes and NestJS's default error envelope:

| Status | Meaning | Example |
|---|---|---|
| `200` | Success | — |
| `201` | Resource created | `POST /students` |
| `400` | Validation failed | Missing required field |
| `404` | Not found | Invalid `:id` |
| `500` | Server error | DB connection lost |

### Example error body

```json
{
  "statusCode": 404,
  "message": "Student #66f1a2b3c4d5e6f7a8b9c0d1 not found",
  "error": "Not Found"
}
```

---

## 🗂️ Endpoints Overview

| Resource | Base Path | Endpoints |
|---|---|---|
| [Students](#-students) | `/students` | `GET` `GET /:id` `POST` `PUT /:id` `DELETE /:id` |
| [IT Students](#-it-students) | `/it-students` | `GET` `GET /:id` `POST` `PUT /:id` `DELETE /:id` |
| [Hub Subscriptions](#-hub-subscriptions) | `/hub-subscriptions` | `GET` `GET /:id` `POST` `PUT /:id` `DELETE /:id` |
| [Finance](#-finance) | `/finance` | `GET` `GET /:id` `POST` `PUT /:id` `DELETE /:id` |
| [KCP](#-kcp-kidscode-program) | `/kcp` | `GET` `GET /:id` `POST` `PUT /:id` `DELETE /:id` |
| [Staff](#-staff) | `/staff` | `GET` `GET /:id` `POST` `PUT /:id` `DELETE /:id` |
| [Courses](#-courses) | `/courses` | `GET` `GET /:id` `POST` `PUT /:id` `DELETE /:id` |
| [Roles](#-roles) | `/roles` | `GET` `GET /:id` `POST` `PUT /:id` `DELETE /:id` |

Every resource follows the **same 5-endpoint CRUD pattern** described below.

---

## 🎓 Students

> Manages regular students enrolled in courses.
> Auto-generates a serial number like `BST-ST001` on creation.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/students` | List all students (sorted by `createdAt` ASC) |
| `GET` | `/students/:id` | Get a single student |
| `POST` | `/students` | Create a new student |
| `PUT` | `/students/:id` | Update an existing student |
| `DELETE` | `/students/:id` | Delete a student |

### Create a student — `POST /students`

**Request body**

```json
{
  "name": "John Doe",
  "course": "Full-Stack Web Development",
  "tutor": "Mr. Smith",
  "amountPaid": 50000,
  "balance": 10000,
  "feeToPay": 60000,
  "duration": "3 months",
  "date": "2026-07-12"
}
```

**Response** (`201 Created`)

```json
{
  "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "sn": "BST-ST001",
  "name": "John Doe",
  "course": "Full-Stack Web Development",
  "tutor": "Mr. Smith",
  "amountPaid": 50000,
  "balance": 10000,
  "feeToPay": 60000,
  "duration": "3 months",
  "date": "2026-07-12",
  "createdAt": "2026-07-12T09:30:00.000Z",
  "updatedAt": "2026-07-12T09:30:00.000Z"
}
```

> 💡 The `sn` field is **auto-generated** by the backend from the current document count and cannot be supplied by the client.

---

## 💻 IT Students

> Manages university IT students. Serial prefix: `BST-RG001`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/it-students` | List all IT students |
| `GET` | `/it-students/:id` | Get one |
| `POST` | `/it-students` | Create one |
| `PUT` | `/it-students/:id` | Update one |
| `DELETE` | `/it-students/:id` | Delete one |

### Create — `POST /it-students`

```json
{
  "name": "Jane Smith",
  "university": "University of Lagos",
  "department": "Computer Science",
  "level": "300",
  "feeToPay": 80000,
  "amountPaid": 80000,
  "balance": 0,
  "date": "2026-07-12"
}
```

---

## 📡 Hub Subscriptions

> Tracks WiFi/Hub subscription customers. Serial prefix: `BST-HB001`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/hub-subscriptions` | List all subscriptions |
| `GET` | `/hub-subscriptions/:id` | Get one |
| `POST` | `/hub-subscriptions` | Create one |
| `PUT` | `/hub-subscriptions/:id` | Update one |
| `DELETE` | `/hub-subscriptions/:id` | Delete one |

### Create — `POST /hub-subscriptions`

```json
{
  "name": "Alex Johnson",
  "amountPaid": 15000,
  "duration": "1 month",
  "date": "2026-07-12"
}
```

---

## 💰 Finance

> Tracks income (`credit`) and expenses (`debit`) with a running `balance`.
> **No auto-generated serial** — entries are identified only by their MongoDB `_id`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/finance` | List all entries |
| `GET` | `/finance/:id` | Get one |
| `POST` | `/finance` | Create one |
| `PUT` | `/finance/:id` | Update one |
| `DELETE` | `/finance/:id` | Delete one |

### Create — `POST /finance`

```json
{
  "date": "2026-07-12",
  "description": "Student fees — July intake",
  "credit": 250000,
  "debit": 0,
  "balance": 250000
}
```

> 📊 The frontend dashboard computes:
> - `totalIncome = Σ credit`
> - `totalExpense = Σ debit`
> - `netBalance  = totalIncome - totalExpense`

---

## 👶 KCP (KidsCode Program)

> Manages the KidsCode Program enrollees. Serial prefix: `BST-KC001`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/kcp` | List all KCP entries |
| `GET` | `/kcp/:id` | Get one |
| `POST` | `/kcp` | Create one |
| `PUT` | `/kcp/:id` | Update one |
| `DELETE` | `/kcp/:id` | Delete one |

### Create — `POST /kcp`

```json
{
  "name": "Little Timmy",
  "feeToPay": 30000,
  "amountPaid": 20000,
  "balance": 10000,
  "date": "2026-07-12",
  "age": "8"
}
```

---

## 👥 Staff

> Manages staff members (tutors, admins, accountants, etc.) and tracks which classes / students each is assigned to. Serial prefix: `BST-SF001`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/staff` | List all staff (sorted by `createdAt` ASC) |
| `GET` | `/staff/:id` | Get a single staff member |
| `POST` | `/staff` | Register a new staff member |
| `PUT` | `/staff/:id` | Update staff details |
| `DELETE` | `/staff/:id` | Remove a staff member |

### Allowed `role` values

`Tutor`, `Class Teacher`, `Admin`, `Manager`, `Receptionist`, `Accountant`, `IT Support`, `Other`

### Allowed `status` values

`Active` (default), `Inactive`, `Suspended`

### Create — `POST /staff`

```json
{
  "firstName": "Mary",
  "lastName": "Johnson",
  "role": "Tutor",
  "assignedClasses": "Full-Stack Web Development, Mobile App Development",
  "phone": "08012345678",
  "email": "mary@bigstack.com",
  "address": "12 Main Street, Lagos",
  "status": "Active",
  "date": "2026-07-12"
}
```

**Response** (`201 Created`)

```json
{
  "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "sn": "BST-SF001",
  "firstName": "Mary",
  "lastName": "Johnson",
  "role": "Tutor",
  "assignedClasses": "Full-Stack Web Development, Mobile App Development",
  "phone": "08012345678",
  "email": "mary@bigstack.com",
  "address": "12 Main Street, Lagos",
  "status": "Active",
  "date": "2026-07-12",
  "createdAt": "2026-07-12T09:30:00.000Z",
  "updatedAt": "2026-07-12T09:30:00.000Z"
}
```

> 💡 The `sn` field is **auto-generated** by the backend from the current document count and cannot be supplied by the client.
> 💡 `assignedClasses` is a free-text/comma-separated string, so the same staff can be linked to multiple classes or students without a join table.
> ⚠️ The `UpdateStaffDto` currently requires **all fields** (including optional ones). Send the full staff object on `PUT /staff/:id`.

### Example — filter staff by role (client side)

Because the API doesn't expose query parameters on `/staff`, role-based filtering is done client-side:

```ts
const tutors = (await api.get<Staff[]>('/staff'))
  .data.filter((s) => s.role === 'Tutor' && s.status === 'Active');
```

---

## 📚 Courses

> Course catalog (referenced by the Students module). No auto-generated serial.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/courses` | List all courses (sorted by `name` ASC) |
| `GET` | `/courses/:id` | Get one |
| `POST` | `/courses` | Create one |
| `PUT` | `/courses/:id` | Update one |
| `DELETE` | `/courses/:id` | Delete one |

### Create — `POST /courses`

```json
{
  "name": "Full-Stack Web Development",
  "description": "HTML, CSS, JS, React, Node, MongoDB",
  "price": 60000,
  "duration": "3 months"
}
```

> ⚠️ `name` is **unique** — creating a course with a duplicate name will fail.
> 💡 Only `name` is required on `POST`. `description`, `price`, and `duration` are optional (default `price` is `0`).

---

## 🏷️ Roles

> Custom role catalog used to classify staff (beyond the built-in `StaffRole` enum). For example, you can add roles like `"Volunteer"`, `"Janitor"`, or `"Intern"`.
> No auto-generated serial — entries are identified only by their MongoDB `_id`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/roles` | List all roles (sorted by `createdAt` ASC) |
| `GET` | `/roles/:id` | Get a single role |
| `POST` | `/roles` | Create a new role |
| `PUT` | `/roles/:id` | Update a role |
| `DELETE` | `/roles/:id` | Delete a role |

### Allowed `status` values

`Active` (default), `Inactive`. (Any string is accepted by the API; these are the values the UI uses.)

### Create — `POST /roles`

```json
{
  "name": "Volunteer",
  "status": "Active"
}
```

**Response** (`201 Created`)

```json
{
  "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
  "name": "Volunteer",
  "status": "Active",
  "createdAt": "2026-07-12T09:30:00.000Z",
  "updatedAt": "2026-07-12T09:30:00.000Z"
}
```

### Update — `PUT /roles/:id`

The update DTO is identical to create (both require `name`; `status` is optional):

```json
{
  "name": "Senior Volunteer",
  "status": "Active"
}
```

> ⚠️ `name` is **unique** — creating a role with a duplicate name will fail.
> 💡 Roles are **independent** of the `Staff.role` field — the built-in `StaffRole` enum (`Tutor`, `Class Teacher`, etc.) is still valid input for staff. Custom roles created here are for display / filtering only and are **not** auto-linked to staff.

---

## 🧬 Data Models Reference

### Student

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | `ObjectId` | auto | MongoDB ID |
| `sn` | `string` | auto | Auto-generated, e.g. `BST-ST001` |
| `name` | `string` | ✅ | — |
| `course` | `string` | ✅ | — |
| `tutor` | `string` | ✅ | — |
| `amountPaid` | `number` | ❌ | Default `0` |
| `balance` | `number` | ❌ | Default `0` |
| `feeToPay` | `number` | ❌ | Default `0` |
| `duration` | `string` | ✅ | Free text (e.g. `"3 months"`) |
| `date` | `string` | ✅ | `YYYY-MM-DD` |
| `createdAt` | `Date` | auto | — |
| `updatedAt` | `Date` | auto | — |

### IT Student

| Field | Type | Required | Notes |
|---|---|---|---|
| `sn` | `string` | auto | `BST-RGxxx` |
| `name` | `string` | ✅ | — |
| `university` | `string` | ✅ | — |
| `department` | `string` | ✅ | — |
| `level` | `string` | ✅ | e.g. `"100"`, `"200"` |
| `feeToPay` | `number` | ❌ | Default `0` |
| `amountPaid` | `number` | ❌ | Default `0` |
| `balance` | `number` | ❌ | Default `0` |
| `date` | `string` | ✅ | `YYYY-MM-DD` |

### Hub Subscription

| Field | Type | Required | Notes |
|---|---|---|---|
| `sn` | `string` | auto | `BST-HBxxx` |
| `name` | `string` | ✅ | — |
| `amountPaid` | `number` | ❌ | Default `0` |
| `duration` | `string` | ✅ | e.g. `"1 month"` |
| `date` | `string` | ✅ | `YYYY-MM-DD` |

### Finance Entry

| Field | Type | Required | Notes |
|---|---|---|---|
| `date` | `string` | ✅ | `YYYY-MM-DD` |
| `description` | `string` | ✅ | — |
| `credit` | `number` | ❌ | Income, default `0` |
| `debit` | `number` | ❌ | Expense, default `0` |
| `balance` | `number` | ❌ | Running balance, default `0` |

### KCP Entry

| Field | Type | Required | Notes |
|---|---|---|---|
| `sn` | `string` | auto | `BST-KCxxx` |
| `name` | `string` | ✅ | — |
| `feeToPay` | `number` | ❌ | Default `0` |
| `amountPaid` | `number` | ❌ | Default `0` |
| `balance` | `number` | ❌ | Default `0` |
| `date` | `string` | ✅ | `YYYY-MM-DD` |
| `age` | `string` | ✅ | Free text — child age |

### Staff

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | `ObjectId` | auto | MongoDB ID |
| `sn` | `string` | auto | `BST-SFxxx` |
| `firstName` | `string` | ✅ | — |
| `lastName` | `string` | ✅ | — |
| `role` | `string` | ✅ | One of: `Tutor`, `Class Teacher`, `Admin`, `Manager`, `Receptionist`, `Accountant`, `IT Support`, `Other` |
| `assignedClasses` | `string` | ❌ | Comma-separated list of classes/students. Default `""` |
| `phone` | `string` | ❌ | Default `""` |
| `email` | `string` | ❌ | Default `""` |
| `address` | `string` | ❌ | Default `""` |
| `status` | `string` | ❌ | `Active` (default) \| `Inactive` \| `Suspended` |
| `date` | `string` | ✅ | `YYYY-MM-DD` — registration date |
| `createdAt` | `Date` | auto | — |
| `updatedAt` | `Date` | auto | — |

### Course

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | `ObjectId` | auto | MongoDB ID |
| `name` | `string` | ✅ | **Unique** |
| `description` | `string` | ❌ | — |
| `price` | `number` | ❌ | Default `0` |
| `duration` | `string` | ❌ | — |
| `createdAt` | `Date` | auto | — |
| `updatedAt` | `Date` | auto | — |

### Role

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | `ObjectId` | auto | MongoDB ID |
| `name` | `string` | ✅ | **Unique** — e.g. `"Volunteer"`, `"Intern"` |
| `status` | `string` | ❌ | Default `"Active"` |
| `createdAt` | `Date` | auto | — |
| `updatedAt` | `Date` | auto | — |

---

## 🛠️ Local Development

```bash
# 1. Clone and install
git clone <repo>
cd bistack_management_backend
npm install

# 2. Set up env (see below)

# 3. Run in watch mode
npm run start:dev

# 4. Server runs on http://localhost:3001
#    API base: http://localhost:3001/api
```

### Useful scripts

| Script | What it does |
|---|---|
| `npm run start:dev` | Start dev server with hot reload |
| `npm run start:debug` | Start with debugger attached |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Run compiled `dist/main` |
| `npm run lint` | Lint + auto-fix |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |

---

## 🔑 Environment Variables

Create a `.env` file in the project root (or set in your Vercel project settings):

```env
# Required
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/bigstack_management

# Optional
PORT=3001                  # default; Vercel ignores this
```

> On Vercel, set `MONGO_URI` in **Project Settings → Environment Variables**.

---

## 📦 Example: Full CRUD Flow (cURL)

```bash
# Base URL
API="https://bistack-management-backend.vercel.app/api"

# 1. Create a student
curl -X POST "$API/students" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "course": "Full-Stack Web Development",
    "tutor": "Mr. Smith",
    "amountPaid": 50000,
    "balance": 10000,
    "feeToPay": 60000,
    "duration": "3 months",
    "date": "2026-07-12"
  }'

# 2. List all students
curl "$API/students"

# 3. Get one (replace :id)
curl "$API/students/66f1a2b3c4d5e6f7a8b9c0d1"

# 4. Update
curl -X PUT "$API/students/66f1a2b3c4d5e6f7a8b9c0d1" \
  -H "Content-Type: application/json" \
  -d '{ "amountPaid": 60000, "balance": 0 }'

# 5. Delete
curl -X DELETE "$API/students/66f1a2b3c4d5e6f7a8b9c0d1"
```

---

## 📝 Notes & Gotchas

1. **Auto-generated serials (`sn`)** are computed from `countDocuments() + 1`. If a record is deleted, the next created record will **reuse that number** — not auto-increment beyond the gap. This is fine for the current scale.
2. **Finance `balance` is not auto-computed** — the client supplies it on create/update. Consider a future improvement to compute it server-side.
3. **CORS** is locked to specific origins — add new domains in [main.ts](src/main.ts) before deploying.
4. **No pagination** is implemented server-side yet; the frontend paginates client-side.

---

_Last updated: 2026-07-12_
