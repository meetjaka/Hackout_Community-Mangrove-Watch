@echo off
echo Setting environment variables for Community Mangrove Watch Backend...
set JWT_SECRET=mangrove_watch_jwt_secret_key_2024_development
set MONGODB_URI=mongodb://127.0.0.1:27017/mangrove_watch
set PORT=5003
set NODE_ENV=development

echo Environment variables set:
echo JWT_SECRET: %JWT_SECRET%
echo MONGODB_URI: %MONGODB_URI%
echo PORT: %PORT%
echo NODE_ENV: %NODE_ENV%
echo.

echo Starting Community Mangrove Watch Backend...
echo Server will be available at: http://localhost:%PORT%
echo Health check: http://localhost:%PORT%/api/health
echo.

npm run dev
pause
