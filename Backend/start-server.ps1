# Set environment variables for the Community Mangrove Watch Backend
$env:JWT_SECRET = "mangrove_watch_jwt_secret_key_2024_development"
$env:MONGODB_URI = "mongodb://127.0.0.1:27017/mangrove_watch"
$env:PORT = "5003"
$env:NODE_ENV = "development"

Write-Host "Environment variables set:" -ForegroundColor Green
Write-Host "JWT_SECRET: $env:JWT_SECRET" -ForegroundColor Yellow
Write-Host "MONGODB_URI: $env:MONGODB_URI" -ForegroundColor Yellow
Write-Host "PORT: $env:PORT" -ForegroundColor Yellow
Write-Host "NODE_ENV: $env:NODE_ENV" -ForegroundColor Yellow
Write-Host ""

Write-Host "Starting Community Mangrove Watch Backend..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:$env:PORT" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:$env:PORT/api/health" -ForegroundColor Cyan
Write-Host ""

# Start the server
npm run dev
