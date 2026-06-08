$javaHome = "C:\Program Files\Android\Android Studio\jbr"
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"

if (-not (Test-Path "$javaHome\bin\java.exe")) {
  Write-Error "Java non trovato in: $javaHome. Installa Android Studio o imposta JAVA_HOME."
  exit 1
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:Path = "$javaHome\bin;$androidHome\platform-tools;$env:Path"

Set-Location (Join-Path $PSScriptRoot "..")
npx expo run:android @args
