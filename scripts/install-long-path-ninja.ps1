# Ninja di CMake 3.22.1 non è longPathAware: con path >260 caratteri fallisce
# anche se Windows ha LongPathsEnabled=1. Sostituiamo con Ninja 1.12.1 (backup .stock).
$ErrorActionPreference = "Stop"

$ninjaVersion = "1.12.1"
$ninjaUrl = "https://github.com/ninja-build/ninja/releases/download/v$ninjaVersion/ninja-win.zip"
$toolsDir = Join-Path $PSScriptRoot "..\tools\ninja"
$ninjaExe = Join-Path $toolsDir "ninja.exe"

if (-not (Test-Path $ninjaExe)) {
  New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
  $zip = Join-Path $env:TEMP "ninja-win-$ninjaVersion.zip"
  Write-Host "Scarico Ninja $ninjaVersion (supporto path lunghi Windows)..."
  Invoke-WebRequest -Uri $ninjaUrl -OutFile $zip
  Expand-Archive -Path $zip -DestinationPath $toolsDir -Force
}

$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
$cmakeNinja = Join-Path $androidHome "cmake\3.22.1\bin\ninja.exe"
if (-not (Test-Path $cmakeNinja)) {
  throw "Ninja CMake non trovato in: $cmakeNinja"
}

$backup = "$cmakeNinja.stock"
if (-not (Test-Path $backup)) {
  Copy-Item $cmakeNinja $backup
}

$srcHash = (Get-FileHash $ninjaExe -Algorithm SHA256).Hash
$dstHash = (Get-FileHash $cmakeNinja -Algorithm SHA256).Hash
if ($srcHash -ne $dstHash) {
  Copy-Item $ninjaExe $cmakeNinja -Force
  Write-Host "Ninja CMake aggiornato a $ninjaVersion (path lunghi)."
}
