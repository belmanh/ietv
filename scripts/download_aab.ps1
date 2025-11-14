<#
PowerShell helper script to download an AAB from a known Expo artifact URL or using the provided fingerprint with `eas build:download`.

Usage examples:
# 1) Download directly from artifact URL:
#    .\download_aab.ps1 -Url "https://expo.dev/artifacts/eas/XXXXX.aab" -OutName "myietv-1.0.1.aab"
# 2) Use fingerprint (requires eas CLI installed and logged in):
#    .\download_aab.ps1 -Fingerprint "abcd1234" -OutName "myietv-1.0.1.aab"
#
# The script saves the file into the project's `release/` directory.
#>
param(
    [string]$Url = "",
    [string]$Fingerprint = "",
    [string]$OutName = "myietv-1.0.1.aab"
)

$releaseDir = Join-Path -Path (Get-Location) -ChildPath "release"
if (-not (Test-Path $releaseDir)) { New-Item -ItemType Directory -Path $releaseDir | Out-Null }

if ($Url -ne "") {
    $outPath = Join-Path $releaseDir $OutName
    Write-Host "Downloading AAB from URL to $outPath ..."
    Invoke-WebRequest -Uri $Url -OutFile $outPath
    Write-Host "Downloaded to: $outPath"
    exit 0
}

if ($Fingerprint -ne "") {
    Write-Host "Downloading AAB using eas build:download (fingerprint=$Fingerprint) ..."
    Push-Location $releaseDir
    try {
        # This will download into the current directory
        & eas build:download --fingerprint $Fingerprint -p android
    } finally {
        Pop-Location
    }
    Write-Host "If the eas command succeeded, the AAB is in: $releaseDir"
    exit 0
}

Write-Host "Usage: .\download_aab.ps1 -Url <artifact_url> -OutName <name.aab>  OR  .\download_aab.ps1 -Fingerprint <fingerprint> -OutName <name.aab>"
exit 1
