# Gayathri Veterinary Hospital — Setup Guide

## 1. MongoDB (required before the server will start)

You need a running MongoDB instance. Choose one:

### Option A — MongoDB Atlas (free, no installation)
1. Go to https://cloud.mongodb.com and create a free account.
2. Create a free **M0** cluster.
3. Under **Database Access**, create a user with read/write access.
4. Under **Network Access**, add `0.0.0.0/0` (allow all) or your IP.
5. Click **Connect → Drivers**, copy the connection string.
6. Open `.env` and replace `MONGODB_URI` with your Atlas string:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/gayathri_veterinary_hospital?retryWrites=true&w=majority
   ```

### Option B — Local MongoDB
Install from https://www.mongodb.com/try/download/community then start it:
```bash
# macOS (after installing):
brew services start mongodb-community
# or run directly:
mongod --dbpath ~/data/db
```
The default `.env` already points to `mongodb://127.0.0.1:27017`.

---

## 2. Install dependencies
```bash
npm install
```

---

## 3. Seed default accounts
Run once to create the Admin, Doctor, and Staff accounts in MongoDB:
```bash
npm run seed
```
Default credentials after seeding:
| Role   | Email                     | Password   |
|--------|---------------------------|------------|
| Admin  | admin@gayathrivets.com    | Admin@123  |
| Doctor | doctor@gayathrivets.com   | Doctor@123 |
| Doctor | rahul@gayathrivets.com    | Doctor@123 |
| Doctor | meera@gayathrivets.com    | Doctor@123 |
| Staff  | staff@gayathrivets.com    | Staff@123  |

---

## 4. Start the server and frontend

Open **two terminals**:

**Terminal 1 — backend:**
```bash
npm run server
```
Expected output:
```
✅  MongoDB connected → gayathri_veterinary_hospital
🚀  API server running at http://localhost:5001
```

**Terminal 2 — frontend:**
```bash
npm run dev
```
Open http://localhost:5173

---

## API endpoints summary

| Method | Path                        | Access           |
|--------|-----------------------------|------------------|
| POST   | /api/auth/signup            | Public           |
| POST   | /api/auth/login             | Public           |
| GET    | /api/auth/me                | Authenticated    |
| GET    | /api/appointments           | All roles        |
| POST   | /api/appointments           | All roles        |
| PATCH  | /api/appointments/:id       | Admin/Staff/Doctor|
| GET    | /api/pets                   | Admin/Doctor/Staff|
| GET    | /api/owners                 | Admin/Doctor/Staff|
| GET    | /api/treatments             | Admin/Doctor/Staff|
| POST   | /api/treatments             | Doctor/Admin     |
| GET    | /api/billing                | Admin/Staff      |
| POST   | /api/billing                | Admin/Staff      |
| PATCH  | /api/billing/:id            | Admin/Staff      |
| GET    | /api/inventory              | Admin/Staff      |
| POST   | /api/inventory              | Admin/Staff      |
| GET    | /api/notifications          | Admin/Doctor     |
| POST   | /api/notifications          | Admin            |
| GET    | /api/users                  | Admin/Doctor/Staff|
| POST   | /api/users                  | Admin            |
| PATCH  | /api/users/:id              | Admin            |
| PATCH  | /api/users/:id/toggle-active| Admin            |
