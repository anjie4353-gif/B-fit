# Minimal Android SDK for Capacitor APK builds
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$sdkRoot = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$cmdlineDir = Join-Path $sdkRoot "cmdline-tools\latest"
$zipPath = Join-Path $env:TEMP "commandlinetools-win.zip"
$zipUrl = "https://dl.google.com/android/repository/commandlinetools-win-13114758_latest.zip"

New-Item -ItemType Directory -Force -Path $sdkRoot | Out-Null

if (-not (Test-Path (Join-Path $cmdlineDir "bin\sdkmanager.bat"))) {
    Write-Host "Downloading Android command-line tools..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
    $extractDir = Join-Path $env:TEMP "android-cmdline"
    if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
    Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force
    New-Item -ItemType Directory -Force -Path (Split-Path $cmdlineDir) | Out-Null
    if (Test-Path $cmdlineDir) { Remove-Item $cmdlineDir -Recurse -Force }
    Move-Item (Join-Path $extractDir "cmdline-tools") $cmdlineDir
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
}

$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$sdkmanager = Join-Path $cmdlineDir "bin\sdkmanager.bat"

Write-Host "Installing SDK packages (first run may take several minutes)..." -ForegroundColor Cyan
& $sdkmanager --sdk_root=$sdkRoot --licenses | ForEach-Object { "y" } | & $sdkmanager --sdk_root=$sdkRoot --licenses 2>&1 | Out-Null
echo y | & $sdkmanager --sdk_root=$sdkRoot "platform-tools" "platforms;android-36" "build-tools;36.0.0"

$localProps = Join-Path $root "android\local.properties"
"sdk.dir=$($sdkRoot -replace '\\','\\')" | Set-Content -Path $localProps -Encoding ASCII
Write-Host "SDK ready at $sdkRoot" -ForegroundColor Green
Write-Host "local.properties written." -ForegroundColor Green