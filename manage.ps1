# Tiger X Panel - Management Script
param(
    [string]$Action
)

$ErrorActionPreference = "Stop"

function Show-Menu {
    Clear-Host
    Write-Host "╔══════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     Tiger X Panel Management v1.2    ║" -ForegroundColor Cyan  
    Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [1] 🚀 Start System" -ForegroundColor Green
    Write-Host "  [2] 🛑 Stop System" -ForegroundColor Yellow
    Write-Host "  [3] 🔄 Restart System" -ForegroundColor Yellow
    Write-Host "  [4] 📊 Status anzeigen" -ForegroundColor Blue
    Write-Host "  [5] 📦 Backup erstellen" -ForegroundColor Magenta
    Write-Host "  [6] 🔙 Backup wiederherstellen" -ForegroundColor Magenta
    Write-Host "  [7] 🗑️  System zurücksetzen" -ForegroundColor Red
    Write-Host "  [8] 📜 Logs anzeigen" -ForegroundColor Gray
    Write-Host "  [9] 🔧 Admin-Passwort zurücksetzen" -ForegroundColor Yellow
    Write-Host "  [0] ❌ Beenden" -ForegroundColor Red
    Write-Host ""
}

function Start-System {
    Write-Host "`n🚀 Starte Tiger X Panel..." -ForegroundColor Green
    
    # Prüfe ob .env existiert
    if (!(Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "✓ .env erstellt" -ForegroundColor Green
        }
    }
    
    # Erstelle backups Ordner
    if (!(Test-Path "backups")) {
        New-Item -ItemType Directory -Path "backups" -Force | Out-Null
        Write-Host "✓ Backup-Verzeichnis erstellt" -ForegroundColor Green
    }
    
    # Starte Container
    docker compose up -d --build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ System gestartet!" -ForegroundColor Green
        Write-Host "   Web: http://localhost:5173" -ForegroundColor Gray
        Write-Host "   API: http://localhost:5000/api/health" -ForegroundColor Gray
        Write-Host "   Login: admin@example.com / admin" -ForegroundColor Gray
    } else {
        Write-Host "❌ Fehler beim Starten!" -ForegroundColor Red
    }
}

function Stop-System {
    Write-Host "`n🛑 Stoppe Tiger X Panel..." -ForegroundColor Yellow
    docker compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ System gestoppt!" -ForegroundColor Green
    }
}

function Restart-System {
    Write-Host "`n🔄 Restarte Tiger X Panel..." -ForegroundColor Yellow
    docker compose restart
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ System neu gestartet!" -ForegroundColor Green
    }
}

function Show-Status {
    Write-Host "`n📊 System Status:" -ForegroundColor Blue
    Write-Host "────────────────────────────" -ForegroundColor Gray
    
    docker compose ps
    
    Write-Host "`n📈 Container Health:" -ForegroundColor Blue
    docker ps --filter "label=com.docker.compose.project=tigerx-panel" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Prüfe API Health
    Write-Host "`n🔍 API Health Check:" -ForegroundColor Blue
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction SilentlyContinue
        if ($response.ok) {
            Write-Host "   ✅ API ist erreichbar" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  API nicht erreichbar" -ForegroundColor Yellow
    }
}

function Create-Backup {
    Write-Host "`n📦 Erstelle Backup..." -ForegroundColor Magenta
    
    if (Test-Path ".\scripts\backup.ps1") {
        & ".\scripts\backup.ps1" -Type "manual"
    } else {
        # Fallback: Direktes Docker-Backup
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $backupFile = "backups\tigerx-manual-$timestamp.tar.gz"
        
        Write-Host "Erstelle MongoDB Dump..." -ForegroundColor Yellow
        docker compose exec -T mongo mongodump --archive=/tmp/dump.archive --db=erp
        docker compose exec -T mongo tar czf /tmp/backup.tar.gz /tmp/dump.archive
        docker compose cp mongo:/tmp/backup.tar.gz $backupFile
        
        if (Test-Path $backupFile) {
            $size = [math]::Round((Get-Item $backupFile).Length / 1MB, 2)
            Write-Host "✅ Backup erstellt: $backupFile ($size MB)" -ForegroundColor Green
        }
    }
}

function Restore-Backup {
    Write-Host "`n🔙 Backup wiederherstellen..." -ForegroundColor Magenta
    
    if (Test-Path ".\scripts\restore.ps1") {
        & ".\scripts\restore.ps1"
    } else {
        Write-Host "❌ Restore-Script nicht gefunden!" -ForegroundColor Red
    }
}

function Reset-System {
    Write-Host "`n⚠️  WARNUNG: Dies löscht ALLE Daten!" -ForegroundColor Red
    $confirm = Read-Host "Wirklich zurücksetzen? (yes/no)"
    
    if ($confirm -eq 'yes') {
        Write-Host "🗑️  Setze System zurück..." -ForegroundColor Red
        
        docker compose down -v
        docker volume rm tigerx-panel_mongo_data -f 2>$null
        
        Write-Host "✅ System zurückgesetzt!" -ForegroundColor Green
        Write-Host "   Führe 'Start System' aus für Neuinstallation" -ForegroundColor Gray
    } else {
        Write-Host "Abgebrochen." -ForegroundColor Yellow
    }
}

function Show-Logs {
    Write-Host "`n📜 Container Logs:" -ForegroundColor Gray
    Write-Host "[1] Alle Logs" -ForegroundColor Gray
    Write-Host "[2] API Logs" -ForegroundColor Gray
    Write-Host "[3] MongoDB Logs" -ForegroundColor Gray
    Write-Host "[4] Web Logs" -ForegroundColor Gray
    
    $choice = Read-Host "Auswahl"
    
    switch ($choice) {
        "1" { docker compose logs --tail=50 -f }
        "2" { docker compose logs api --tail=50 -f }
        "3" { docker compose logs mongo --tail=50 -f }
        "4" { docker compose logs web --tail=50 -f }
        default { Write-Host "Ungültige Auswahl" -ForegroundColor Red }
    }
}

function Reset-AdminPassword {
    Write-Host "`n🔧 Setze Admin-Passwort zurück..." -ForegroundColor Yellow
    
    $newPassword = Read-Host "Neues Passwort (Enter für 'admin')"
    if ([string]::IsNullOrWhiteSpace($newPassword)) {
        $newPassword = "admin"
    }
    
    # Erstelle temporäres Reset-Script
    $resetScript = @"
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo:27017/erp').then(async () => {
  const hash = await bcrypt.hash('$newPassword', 10);
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'admin@example.com' },
    { `$set: { passwordHash: hash } }
  );
  console.log('Password reset successful');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
"@
    
    $resetScript | docker compose exec -T api node -e -
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Passwort zurückgesetzt!" -ForegroundColor Green
        Write-Host "   Neues Passwort: $newPassword" -ForegroundColor Gray
    } else {
        Write-Host "❌ Fehler beim Zurücksetzen!" -ForegroundColor Red
    }
}

# Hauptprogramm
if ($Action) {
    switch ($Action.ToLower()) {
        "start" { Start-System }
        "stop" { Stop-System }
        "restart" { Restart-System }
        "status" { Show-Status }
        "backup" { Create-Backup }
        "restore" { Restore-Backup }
        "reset" { Reset-System }
        "logs" { Show-Logs }
        default { Write-Host "Unbekannte Aktion: $Action" -ForegroundColor Red }
    }
} else {
    # Interaktives Menü
    do {
        Show-Menu
        $choice = Read-Host "Auswahl"
        
        switch ($choice) {
            "1" { Start-System; Read-Host "`nEnter drücken..." }
            "2" { Stop-System; Read-Host "`nEnter drücken..." }
            "3" { Restart-System; Read-Host "`nEnter drücken..." }
            "4" { Show-Status; Read-Host "`nEnter drücken..." }
            "5" { Create-Backup; Read-Host "`nEnter drücken..." }
            "6" { Restore-Backup; Read-Host "`nEnter drücken..." }
            "7" { Reset-System; Read-Host "`nEnter drücken..." }
            "8" { Show-Logs }
            "9" { Reset-AdminPassword; Read-Host "`nEnter drücken..." }
            "0" { Write-Host "`n👋 Auf Wiedersehen!" -ForegroundColor Cyan; break }
            default { Write-Host "Ungültige Auswahl!" -ForegroundColor Red; Start-Sleep -Seconds 1 }
        }
    } while ($choice -ne "0")
}