$javaHome = "C:\Program Files\Android\Android Studio\jbr"
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

if (-not (Test-Path "$javaHome\bin\java.exe")) {
  Write-Error "Java non trovato in: $javaHome. Installa Android Studio o imposta JAVA_HOME."
  exit 1
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:Path = "$javaHome\bin;$androidHome\platform-tools;$env:Path"

$gradleHome = "C:\gradle"
if (-not (Test-Path $gradleHome)) {
  New-Item -ItemType Directory -Path $gradleHome | Out-Null
}
$env:GRADLE_USER_HOME = $gradleHome

. (Join-Path $PSScriptRoot "install-long-path-ninja.ps1")

Set-Location $projectRoot

$cxxDir = Join-Path $projectRoot "android\app\.cxx"
if (Test-Path $cxxDir) {
  Remove-Item -Recurse -Force $cxxDir
}

$gradlew = Join-Path $projectRoot "android\gradlew.bat"
if (Test-Path $gradlew) {
  & $gradlew --stop | Out-Null
}

# --all-arch: Expo non passa le ABI del telefono (arm64+armeabi-v7a).
# gradle.properties resta su arm64-v8a.
& npx.cmd expo run:android --all-arch @args
