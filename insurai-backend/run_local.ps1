$ErrorActionPreference = "Stop"

# Load environment variables from .env file
if (Test-Path .env) {
    Write-Host "Loading .env file..." -ForegroundColor Green
    Get-Content .env | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line.Split("=", 2)
            if ($parts.Length -eq 2) {
                $name = $parts[0].Trim()
                $value = $parts[1].Trim()
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                Write-Host "Set env var: $name" -ForegroundColor Gray
            }
        }
    }
} else {
    Write-Warning ".env file not found!"
}

# Run Maven
Write-Host "Starting Spring Boot..." -ForegroundColor Cyan
mvn spring-boot:run
