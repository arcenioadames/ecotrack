Param()

# Open required Expo/Metro ports if rules do not already exist
function Ensure-Rule {
    param(
        [string]$Name,
        [int]$Port
    )
    $existing = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
    if ($null -ne $existing) {
        Write-Host "Firewall rule '$Name' already exists. Skipping."
        return
    }
    Write-Host "Creating firewall rule '$Name' for TCP port $Port"
    New-NetFirewallRule -DisplayName $Name -Direction Inbound -LocalPort $Port -Protocol TCP -Action Allow | Out-Null
}

# Check for admin
try {
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
} catch {
    $isAdmin = $false
}

if (-not $isAdmin) {
    Write-Warning "This script should be run as Administrator to add firewall rules. Re-run PowerShell as admin."
    exit 1
}

Ensure-Rule -Name "Expo Metro 8081" -Port 8081
Ensure-Rule -Name "Expo Dev 19000" -Port 19000
Ensure-Rule -Name "Expo Dev 19001" -Port 19001
Ensure-Rule -Name "Expo Dev 19002" -Port 19002

Write-Host "Firewall rules ensured."
