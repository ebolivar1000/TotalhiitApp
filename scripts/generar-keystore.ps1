<#
.SYNOPSIS
    Script de ayuda para generar la Keystore de producción de TOTALHIIT App.
.DESCRIPTION
    Genera un archivo totalhiit-release.keystore en PKCS12 (RSA 2048, 10.000 días de validez).
    REGLA DE SEGURIDAD:
    - La keystore generada NUNCA debe commitearse al repositorio git (.gitignore la excluye).
    - Guárdela en un lugar seguro (ej. OneDrive personal cifrado o gestor de contraseñas).
    - Si se pierde la keystore, los usuarios no podrán actualizar la app sin desinstalarla.
#>

$KeystoreNombre = "totalhiit-release.keystore"
$Alias = "totalhiit"
$RutaSalida = Join-Path $PSScriptRoot "..\$KeystoreNombre"

Write-Host "=== Generador de Keystore para TOTALHIIT App ===" -ForegroundColor Magenta

if (Test-Path $RutaSalida) {
    Write-Warning "El archivo '$KeystoreNombre' ya existe en la raíz del proyecto. No se sobreescribirá."
    exit 0
}

# Verificar disponibilidad de keytool (viene con JDK)
$KeytoolCmd = Get-Command keytool -ErrorAction SilentlyContinue
if (-not $KeytoolCmd) {
    Write-Host "Aviso: 'keytool' no está en el PATH del sistema." -ForegroundColor Yellow
    Write-Host "Cuando instales JDK 21 (o en tu máquina con Java), ejecuta el siguiente comando:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "keytool -genkeypair -v -storetype PKCS12 -keystore $KeystoreNombre -alias $Alias -keyalg RSA -keysize 2048 -validity 10000" -ForegroundColor White
    Write-Host ""
    Write-Host "Validez: 10.000 días (~27 años). Guardar la contraseña elegida en el gestor de contraseñas." -ForegroundColor Gray
    exit 0
}

Write-Host "Ejecutando keytool..." -ForegroundColor Green
keytool -genkeypair -v -storetype PKCS12 -keystore $RutaSalida -alias $Alias -keyalg RSA -keysize 2048 -validity 10000
