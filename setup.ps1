# Tiger X Panel - Setup Script
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    Tiger X Panel - Setup Wizard v1.2   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Voraussetzungen prüfen
Write-Host "📋 Prüfe Voraussetzungen..." -ForegroundColor Yellow

# Docker prüfen
Write-Host "  → Docker..." -NoNewline
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "`n❌ Docker ist nicht installiert!" -ForegroundColor Red
    Write-Host "Bitte installiere Docker Desktop von: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Docker läuft?
Write-Host "  → Docker Service..." -NoNewline
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✅" -ForegroundColor Green
} else {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "`n❌ Docker läuft nicht!" -ForegroundColor Red
    Write-Host "Starte Docker Desktop und führe das Setup erneut aus." -ForegroundColor Yellow
    exit 1
}

# Node/NPM (optional)
Write-Host "  → Node.js..." -NoNewline
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host " ✅ ($nodeVersion)" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Nicht installiert (optional)" -ForegroundColor Yellow
}

# 2. Projekt-Struktur erstellen
Write-Host "`n📁 Erstelle Projekt-Struktur..." -ForegroundColor Yellow

$directories = @(
    "backups",
    "scripts",
    "logs",
    "data"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  → $dir ✅" -ForegroundColor Green
    } else {
        Write-Host "  → $dir (existiert bereits)" -ForegroundColor Gray
    }
}

# 3. Environment Setup
Write-Host "`n🔧 Konfiguriere Environment..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "  → .env erstellt ✅" -ForegroundColor Green
        
        # Frage nach benutzerdefinierten Werten
        Write-Host "`n📝 Möchtest du die Standardeinstellungen anpassen? (y/n)" -ForegroundColor Cyan
        $customize = Read-Host
        
        if ($customize -eq 'y') {
            $envContent = Get-Content ".env"
            
            Write-Host "`nAdmin-Email (Enter für admin@example.com):" -ForegroundColor Yellow
            $adminEmail = Read-Host
            if ($adminEmail) {
                $envContent = $envContent -replace "SEED_ADMIN_EMAIL=.*", "SEED_ADMIN_EMAIL=$adminEmail"
            }
            
            Write-Host "Admin-Passwort (Enter für 'admin'):" -ForegroundColor Yellow
            $adminPass = Read-Host
            if ($adminPass) {
                $envContent = $envContent -replace "SEED_ADMIN_PASSWORD=.*", "SEED_ADMIN_PASSWORD=$adminPass"
            }
            
            Write-Host "Standard-Sprache (de/en, Enter für 'en'):" -ForegroundColor Yellow
            $locale = Read-Host
            if ($locale -and ($locale -eq 'de' -or $locale -eq 'en')) {
                $envContent = $envContent -replace "DEFAULT_LOCALE=.*", "DEFAULT_LOCALE=$locale"
            }
            
            $envContent | Set-Content ".env"
            Write-Host "  → Konfiguration gespeichert ✅" -ForegroundColor Green
        }
    } else {
        # Erstelle minimale .env
        @"
# Tiger X Panel Configuration
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://mongo:27017/erp
JWT_SECRET=$(New-Guid)
JWT_EXPIRES_IN=7d
DEFAULT_LOCALE=en
AUTO_SEED=true
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=admin
VITE_API_URL=http://localhost:5000/api
"@ | Set-Content ".env"
        Write-Host "  → .env mit Standardwerten erstellt ✅" -ForegroundColor Green
    }
} else {
    Write-Host "  → .env existiert bereits" -ForegroundColor Gray
}

# 4. Docker Images vorab ziehen
Write-Host "`n🐳 Lade Docker Images..." -ForegroundColor Yellow
Write-Host "  (Dies kann beim ersten Mal einige Minuten dauern)" -ForegroundColor Gray

docker pull mongo:6 2>$null | Out-Null
Write-Host "  → MongoDB ✅" -ForegroundColor Green

docker pull node:20-alpine 2>$null | Out-Null
Write-Host "  → Node.js ✅" -ForegroundColor Green

docker pull offen/docker-volume-backup:v2 2>$null | Out-Null
Write-Host "  → Backup-Service ✅" -ForegroundColor Green

# 5. Docker Volumes erstellen
Write-Host "`n💾 Erstelle Docker Volumes..." -ForegroundColor Yellow
docker volume create tigerx-panel_mongo_data 2>$null | Out-Null
Write-Host "  → MongoDB Volume ✅" -ForegroundColor Green

# 6. Netzwerk erstellen
Write-Host "`n🌐 Erstelle Docker Netzwerk..." -ForegroundColor Yellow
docker network create tigerx-panel_default 2>$null | Out-Null
Write-Host "  → Netzwerk ✅" -ForegroundColor Green

# 7. System bauen und starten
Write-Host "`n🚀 Baue und starte System..." -ForegroundColor Yellow
Write-Host "  (Dies kann 2-5 Minuten dauern)" -ForegroundColor Gray

docker compose build --no-cache 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  → Build erfolgreich ✅" -ForegroundColor Green
} else {
    Write-Host "  → Build-Warnung ⚠️" -ForegroundColor Yellow
}

docker compose up -d 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  → Container gestartet ✅" -ForegroundColor Green
} else {
    Write-Host "  → Start-Fehler ❌" -ForegroundColor Red
    Write-Host "Führe 'docker compose logs' aus für Details" -ForegroundColor Yellow
}

# 8. Warte auf Services
Write-Host "`n⏳ Warte auf Services..." -ForegroundColor Yellow
$maxWait = 30
$waited = 0

while ($waited -lt $maxWait) {
    Start-Sleep -Seconds 1
    $waited++
    
    # Prüfe MongoDB
    $mongoReady = docker compose exec -T mongo mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok" 2>$null
    
    # Prüfe API
    try {
        $apiResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction SilentlyContinue
        $apiReady = $apiResponse.ok
    } catch {
        $apiReady = $false
    }
    
    if ($mongoReady -eq "1" -and $apiReady) {
        Write-Host "  → Alle Services bereit ✅" -ForegroundColor Green
        break
    }
    
    if ($waited % 5 -eq 0) {
        Write-Host "  → Warte... ($waited/$maxWait)" -ForegroundColor Gray
    }
}

# 9. Admin-User erstellen
Write-Host "`n👤 Erstelle Admin-Benutzer..." -ForegroundColor Yellow
docker compose exec -T api node src/scripts/seed-admin.js 2>$null | Out-Null
Write-Host "  → Admin erstellt ✅" -ForegroundColor Green

# 10. Backup einrichten
Write-Host "`n📦 Richte Backup-System ein..." -ForegroundColor Yellow
if (Test-Path "backup.yml") {
    Write-Host "  → backup.yml vorhanden ✅" -ForegroundColor Green
} else {
    Write-Host "  → backup.yml fehlt ⚠️" -ForegroundColor Yellow
}

# 11. Finale Checks
Write-Host "`n🔍 Finale System-Checks..." -ForegroundColor Yellow

# API Check
try {
    $api = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get -ErrorAction SilentlyContinue
    if ($api.ok) {
        Write-Host "  → API: ✅ Online" -ForegroundColor Green
    }
} catch {
    Write-Host "  → API: ❌ Nicht erreichbar" -ForegroundColor Red
}

# Web Check
try {
    $web = Invoke-WebRequest -Uri "http://localhost:5173" -Method Head -ErrorAction SilentlyContinue
    if ($web.StatusCode -eq 200) {
        Write-Host "  → Web: ✅ Online" -ForegroundColor Green
    }
} catch {
    Write-Host "  → Web: ⚠️  Startet noch..." -ForegroundColor Yellow
}

# MongoDB Check
$mongoOk = docker compose exec -T mongo mongosh --quiet --eval "db.runCommand({ ping: 1 }).ok" 2>$null
if ($mongoOk -eq "1") {
    Write-Host "  → DB:  ✅ Online" -ForegroundColor Green
} else {
    Write-Host "  → DB:  ❌ Nicht erreichbar" -ForegroundColor Red
}

# 12. Zusammenfassung
Write-Host "`n═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup abgeschlossen!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

# Lese finale Zugangsdaten aus .env
$envContent = Get-Content ".env"
$adminEmail = ($envContent | Where-Object { $_ -match "SEED_ADMIN_EMAIL=" }) -replace ".*=", ""
$adminPass = ($envContent | Where-Object { $_ -match "SEED_ADMIN_PASSWORD=" }) -replace ".*=", ""

Write-Host "`n📌 Zugangsdaten:" -ForegroundColor Cyan
Write-Host "   URL:      " -NoNewline -ForegroundColor Gray
Write-Host "http://localhost:5173" -ForegroundColor White
Write-Host "   Email:    " -NoNewline -ForegroundColor Gray
Write-Host "$adminEmail" -ForegroundColor White
Write-Host "   Passwort: " -NoNewline -ForegroundColor Gray
Write-Host "$adminPass" -ForegroundColor White

Write-Host "`n🎯 Nächste Schritte:" -ForegroundColor Cyan
Write-Host "   1. Öffne http://localhost:5173 im Browser" -ForegroundColor Gray
Write-Host "   2. Melde dich mit den obigen Zugangsdaten an" -ForegroundColor Gray
Write-Host "   3. Erstelle dein erstes Backup mit: .\manage.ps1" -ForegroundColor Gray

Write-Host "`n💡 Tipp:" -ForegroundColor Yellow
Write-Host "   Nutze '.\manage.ps1' für alle Admin-Aufgaben" -ForegroundColor Gray
Write-Host "   Nutze '.\scripts\backup.ps1' für manuelle Backups" -ForegroundColor Gray

Write-Host "`n"