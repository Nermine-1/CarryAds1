@echo off
echo ============================================
echo   CarryAds - Database Setup Script
echo ============================================
echo.

REM Check if MySQL is accessible
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL not found in PATH!
    echo Please ensure MySQL is installed and added to PATH
    echo Or run this script from MySQL bin directory
    pause
    exit /b 1
)

echo [1/3] Creating database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS carryads_db;"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to create database
    pause
    exit /b 1
)

echo [2/3] Importing schema...
mysql -u root -p carryads_db < database\schema.sql
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to import schema
    pause
    exit /b 1
)

echo [3/3] Verifying setup...
mysql -u root -p -e "USE carryads_db; SHOW TABLES;"

echo.
echo ============================================
echo   Database setup completed successfully!
echo ============================================
echo.
echo Next steps:
echo 1. Update backend/.env with your MySQL password
echo 2. Run: cd backend ^&^& npm start
echo 3. Run: cd frontend ^&^& npm run dev
echo.
pause
