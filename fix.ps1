Get-ChildItem -Path "src" -Recurse -Include "*.jsx","*.js" | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName)
    
    $content = $content -replace 'http://localhost:5258', '${import.meta.env.VITE_API_URL}'
    
    $content = $content -replace '(`\$\{import\.meta\.env\.VITE_API_URL\}[^`"<]*)"', '$1`'
    
    $content = $content -replace '"(\$\{import\.meta\.env\.VITE_API_URL\}[^`"<]*)`', '`$1`'
    
    $content = $content -replace '"(\$\{import\.meta\.env\.VITE_API_URL\}[^`"<]*)"', '`$1`'
    
    [System.IO.File]::WriteAllText($_.FullName, $content)
    Write-Host "Fixed: $($_.Name)"
}