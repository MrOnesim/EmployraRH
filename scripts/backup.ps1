param(
  [string]$BackupDir = "./backups",
  [string]$DbName = "employepro",
  [string]$DbUser = "postgres",
  [string]$DbHost = "localhost",
  [string]$DbPort = "5432"
)

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupPath = Join-Path -Path $BackupDir -ChildPath "${DbName}_${Timestamp}.sql"
$LogPath = Join-Path -Path $BackupDir -ChildPath "backup.log"

if (-not (Test-Path -Path $BackupDir)) {
  New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

Write-Host "Backing up $DbName@$DbHost:$DbPort to $BackupPath ..."

$env:PGPASSWORD = $env:DB_PASSWORD

& pg_dump --host=$DbHost --port=$DbPort --username=$DbUser --dbname=$DbName --format=custom --file=$BackupPath 2>> $LogPath

if ($LASTEXITCODE -eq 0) {
  Write-Host "Backup successful: $BackupPath"
  $RotateDays = 30
  Get-ChildItem -Path $BackupDir -Filter "${DbName}_*.sql" | Where-Object {
    $_.LastWriteTime -lt (Get-Date).AddDays(-$RotateDays)
  } | Remove-Item -Force
  Write-Host "Rotated backups older than $RotateDays days."
} else {
  Write-Host "Backup FAILED. Check log: $LogPath"
  exit 1
}
