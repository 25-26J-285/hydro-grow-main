$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $repoRoot "backend"
$uvicornExe = Join-Path $backendDir ".venv\\Scripts\\uvicorn.exe"

Write-Host "[Backend] Repo root: $repoRoot"
Write-Host "[Backend] Backend dir: $backendDir"

if (-not (Test-Path $uvicornExe)) {
    throw "uvicorn not found at $uvicornExe"
}

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
