@echo off
echo Starting local PostgreSQL server...
node "%~dp0ensure-db.mjs"
echo.
pause
