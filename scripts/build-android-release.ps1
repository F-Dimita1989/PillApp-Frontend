$javaHome = "C:\Program Files\Android\Android Studio\jbr"
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
$projectRoot = Join-Path $PSScriptRoot ".."

if (-not (Test-Path "$javaHome\bin\java.exe")) {
  Write-Error "Java non trovato in: $javaHome. Installa Android Studio o imposta JAVA_HOME."
  exit 1
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:Path = "$javaHome\bin;$androidHome\platform-tools;$env:Path"

# Percorso Gradle breve per evitare il limite di 260 caratteri di Windows
$gradleHome = "C:\gradle"
if (-not (Test-Path $gradleHome)) {
  New-Item -ItemType Directory -Path $gradleHome | Out-Null
}
$env:GRADLE_USER_HOME = $gradleHome

Set-Location $projectRoot

if (-not (Test-Path (Join-Path $projectRoot "android"))) {
  Write-Host "Cartella android assente: eseguo expo prebuild..."
  npx expo prebuild --platform android --no-install
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

Set-Location (Join-Path $projectRoot "android")
Write-Host "Compilazione APK release (nessun telefono richiesto)..."
.\gradlew assembleRelease

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

$apkPath = Join-Path $projectRoot "android\app\build\outputs\apk\release\app-release.apk"
Write-Host ""
Write-Host "APK pronto:" -ForegroundColor Green
Write-Host $apkPath
