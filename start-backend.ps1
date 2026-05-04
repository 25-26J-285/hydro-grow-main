$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot "backend"
$venvDir = Join-Path $backendDir ".venv"
$pythonExe = Join-Path $venvDir "Scripts\\python.exe"
$uvicornExe = Join-Path $venvDir "Scripts\\uvicorn.exe"
$requirementsFile = Join-Path $backendDir "requirements.txt"

Write-Host "[Backend] Repo root: $repoRoot"
Write-Host "[Backend] Backend dir: $backendDir"
Write-Host "[Backend] Virtual env: $venvDir"

if (-not (Test-Path $venvDir)) {
    Write-Host "[Backend] Creating virtual environment..."
    python -m venv $venvDir
}

if (-not (Test-Path $pythonExe)) {
    throw "Python executable not found at $pythonExe"
}

Write-Host "[Backend] Installing or refreshing backend dependencies..."
& $pythonExe -m pip install --upgrade pip
& $pythonExe -m pip install -r $requirementsFile

if (-not (Test-Path $uvicornExe)) {
    throw "uvicorn not found at $uvicornExe after dependency installation"
}

if (-not $env:MONGODB_URL) {
    $env:MONGODB_URL = "mongodb://localhost:27017"
}

if (-not $env:MONGODB_DB_NAME) {
    $env:MONGODB_DB_NAME = "hydro_grow"
}

Write-Host "[Backend] MongoDB URL: $env:MONGODB_URL"
Write-Host "[Backend] MongoDB DB: $env:MONGODB_DB_NAME"

$stale = Get-CimInstance Win32_Process |
    Where-Object {
        $_.CommandLine -and
        $_.CommandLine -like "*uvicorn*" -and
        $_.CommandLine -like "*app.main:app*" -and
        $_.ProcessId -ne $PID
    }

if ($stale) {
    Write-Host "[Backend] Stopping stale backend process(es)..."
    $stale | ForEach-Object {
        Write-Host ("[Backend] Stopping PID {0}" -f $_.ProcessId)
        Stop-Process -Id $_.ProcessId -Force
    }
    Start-Sleep -Seconds 1
}

Set-Location $backendDir

Write-Host "[Backend] Starting clean uvicorn instance on 0.0.0.0:8000"
& $uvicornExe app.main:app --host 0.0.0.0 --port 8000 --ws websockets --ws-ping-interval 20 --ws-ping-timeout 20
