# CarryAds - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Setup Database

1. **Start MySQL** (if not running):
   ```bash
   # Windows: Start MySQL service from Services or XAMPP/WAMP
   # Or use command:
   net start MySQL80
   ```

2. **Create Database**:
   ```bash
   mysql -u root -p
   ```
   
   Then in MySQL prompt:
   ```sql
   CREATE DATABASE IF NOT EXISTS carryads_db;
   USE carryads_db;
   source database/schema.sql;
   exit;
   ```

   Or use this one-liner:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS carryads_db;"
   mysql -u root -p carryads_db < database/schema.sql
   ```

### Step 2: Configure Environment

1. **Backend** - The `.env` file already exists in `backend/.env`. Update if needed:
   ```env
   DB_PASSWORD=your_mysql_password
   ```

2. **Frontend** - The `.env` file already exists in `frontend/.env`. No changes needed for local dev.

### Step 3: Run the Application

Open **TWO** terminal windows:

**Terminal 1 - Backend:**
```bash
cd c:\Users\Nermine\Desktop\carryads\backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\Nermine\Desktop\carryads\frontend
npm run dev
```

### Step 4: Access the Application

Open your browser:
- **Main App**: http://localhost:5173
- **API Server**: http://localhost:4242

## 🎯 Test Accounts

After setup, you can:
1. Sign up as an **Advertiser** at: http://localhost:5173/signup/annonceur
2. Sign up as a **Distributor** at: http://localhost:5173/signup/distributeur

## ⚠️ Troubleshooting

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `backend/.env`
- Ensure database `carryads_db` exists

### Port Already in Use
- **Backend (4242)**: Change `PORT` in `backend/.env`
- **Frontend (5173)**: Vite will suggest another port automatically

### Module Not Found
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## 📝 Next Steps

1. Create your first campaign as an advertiser
2. Manage distributors and assign campaigns
3. Track analytics and performance
4. Generate invoices and manage billing

For more details, see the main [README.md](README.md)
