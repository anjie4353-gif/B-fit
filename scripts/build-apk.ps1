# Build B-Fit Android APK (requires Android Studio + JDK 17+)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$jdkCandidates = @(
    (Get-ChildItem "C:\Program Files\Microsoft\jdk-*" -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1),
    (Get-ChildItem "C:\Program Files\Android\Android Studio\jbr" -ErrorAction SilentlyContinue),
    (Get-ChildItem "C:\Program Files\Java\jdk-*" -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1)
) | Where-Object { $_ -and (Test-Path (Join-Path $_.FullName "bin\java.exe")) }

if ($jdkCandidates.Count -gt 0) {
    $env:JAVA_HOME = $jdkCandidates[0].FullName
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    Write-Host "Using JAVA_HOME=$env:JAVA_HOME" -ForegroundColor Cyan
} else {
    $javaVersion = (java -version 2>&1 | Select-String -Pattern 'version "(\d+)' | ForEach-Object { $_.Matches.Groups[1].Value })
    if ($javaVersion -and [int]$javaVersion -lt 11) {
        Write-Host "Java 11+ required (found Java $javaVersion). Run: winget install Microsoft.OpenJDK.17" -ForegroundColor Red
        exit 1
    }
}

if (-not $env:NEXT_PUBLIC_APP_URL) {
    Write-Host "Set NEXT_PUBLIC_APP_URL to your deployed HTTPS link first." -ForegroundColor Yellow
    Write-Host 'Example: $env:NEXT_PUBLIC_APP_URL="https://b-fit.vercel.app"'
    exit 1
}

$redirectUrl = $env:NEXT_PUBLIC_APP_URL.TrimEnd("/")
$html = @"
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>B-Fit</title>
  </head>
  <body>
    <script>location.replace("$redirectUrl");</script>
  </body>
</html>
"@
Set-Content -Path "capacitor-www\index.html" -Value $html -Encoding UTF8

if (-not (Test-Path "android")) {
    npx cap add android
}

npx cap sync android

Set-Location android
if (Test-Path ".\gradlew.bat") {
    .\gradlew.bat assembleDebug
} else {
    Write-Host "Gradle wrapper missing. Open android/ in Android Studio and Build > Build APK." -ForegroundColor Yellow
    exit 1
}

$apkSource = "app\build\outputs\apk\debug\app-debug.apk"
$apkDest = "..\public\downloads\b-fit.apk"
New-Item -ItemType Directory -Force -Path "..\public\downloads" | Out-Null
Copy-Item $apkSource $apkDest -Force
Write-Host "APK ready: public/downloads/b-fit.apk" -ForegroundColor Green