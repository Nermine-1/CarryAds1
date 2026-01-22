# Database Setup Guide for CarryAds

## Option 1: Using MySQL (Recommended)

### Install MySQL

1. **Download MySQL**:
   - Visit: https://dev.mysql.com/downloads/installer/
   - Download MySQL Installer for Windows
   - Install MySQL Server and MySQL Workbench

2. **During Installation**:
   - Set root password (remember this!)
   - Keep default port: 3306
   - Add MySQL to Windows PATH (select this option)

### Setup Database

**Option A: Using MySQL Workbench (GUI)**

1. Open MySQL Workbench
2. Connect to Local Instance
3. Open SQL tab and paste the content from `backend/database/schema.sql`
4. Execute the script (lightning bolt icon)

**Option B: Using Command Line**

1. Open Command Prompt as Administrator
2. Navigate to MySQL bin directory:
   ```cmd
   cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
   ```

3. Login to MySQL:
   ```cmd
   mysql -u root -p
   ```
   Enter your password

4. Create and setup database:
   ```sql
   CREATE DATABASE IF NOT EXISTS carryads_db;
   USE carryads_db;
   source C:\Users\Nermine\Desktop\carryads\backend\database\schema.sql
   ```

## Option 2: Using XAMPP/WAMP (Easy Alternative)

### Install XAMPP

1. **Download XAMPP**:
   - Visit: https://www.apachefriends.org/
   - Download and install XAMPP for Windows

2. **Start MySQL**:
   - Open XAMPP Control Panel
   - Click "Start" next to MySQL

3. **Setup Database**:
   - Click "Admin" next to MySQL (opens phpMyAdmin)
   - Click "New" to create database
   - Database name: `carryads_db`
   - Click "Create"
   - Click "Import" tab
   - Choose file: `backend/database/schema.sql`
   - Click "Go"

## Verify Database Setup

After setting up the database, verify the tables were created:

```sql
USE carryads_db;
SHOW TABLES;
```

You should see:
- carryads_user
- customer
- distributer
- campaign
- campaign_distributer
- invoice
- stock
- notification

## Update Backend Configuration

Edit `backend/.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=carryads_db
DB_PORT=3306
```

**Important**: Replace `your_mysql_password_here` with your actual MySQL root password!

## Test Database Connection

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. You should see:
   ```
   Connecté à la base de données MySQL
   Serveur démarré sur le port 4242
   ```

If you see "Erreur de connexion à la base de données", check:
- MySQL service is running
- Password in `.env` is correct
- Database `carryads_db` exists

## Troubleshooting

### "Access denied for user 'root'@'localhost'"
- Check password in `backend/.env`
- Try resetting MySQL root password

### "Unknown database 'carryads_db'"
- Database wasn't created
- Run the CREATE DATABASE command again

### "Can't connect to MySQL server"
- MySQL service not running
- Start MySQL service or XAMPP

### MySQL not in PATH
- Add MySQL bin directory to Windows PATH
- Or use full path: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`
