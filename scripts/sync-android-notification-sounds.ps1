$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$soundsDir = Join-Path $projectRoot "assets\sounds"
$rawDir = Join-Path $projectRoot "android\app\src\main\res\raw"

if (-not (Test-Path (Join-Path $projectRoot "android"))) {
  Write-Host "Cartella android assente: salto copia suoni notifiche."
} elseif (-not (Test-Path $soundsDir)) {
  Write-Error "Cartella suoni notifiche assente: $soundsDir"
  exit 1
} else {
  New-Item -ItemType Directory -Force -Path $rawDir | Out-Null

  $wavs = @(Get-ChildItem -Path $soundsDir -Filter "*.wav")
  if ($wavs.Count -eq 0) {
    Write-Error "Nessun file .wav in $soundsDir"
    exit 1
  }

  foreach ($wav in $wavs) {
    Copy-Item -Path $wav.FullName -Destination (Join-Path $rawDir $wav.Name) -Force
  }

  Write-Host "Suoni notifiche copiati in android/app/src/main/res/raw ($($wavs.Count) file)"
}
