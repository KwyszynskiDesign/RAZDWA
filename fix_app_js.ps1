$path = "docs\assets\app.js"
if (-not (Test-Path $path)) { Write-Error "File not found: $path"; exit }

$content = Get-Content $path -Raw
# The encoding is tricky. Let's try to fix blindly based on patterns seen.

# Fix "may Canon" -> "mały Canon" (lowercase)
if ($content -match "may Canon") {
    Write-Host "Replaced 'may Canon' -> 'mały Canon'"
    $content = $content -replace "may Canon", "mały Canon"
}

# Fix "May Canon" -> "Mały Canon" (title case)
if ($content -match "May Canon") {
    Write-Host "Replaced 'May Canon' -> 'Mały Canon'"
    $content = $content -replace "May Canon", "Mały Canon"
}

# Fix CAD table header "Składanie"
# Pattern: something like "SkÄąâ€šadanie" or "SkĹ„adanie"
if ($content -match "Sk.{1,6}adanie") {
    $match = [regex]::Match($content, "Sk.{1,6}adanie").Value
    Write-Host "Found '$match', replacing with 'Składanie'"
    $content = $content -replace "Sk.{1,6}adanie", "Składanie"
}

# Fix "Usu..." for delete button
if ($content -match 'aria-label="Usu.{1,6}"') {
    $match = [regex]::Match($content, 'aria-label="Usu.{1,6}"').Value
    Write-Host "Found '$match', replacing with 'aria-label=`"Usuń`"'"
    $content = $content -replace 'aria-label="Usu.{1,6}"', 'aria-label="Usuń"'
}

# Fix "Dugo (mm)" -> "Długość (mm)"
if ($content -match "Dugo \(mm\)") {
    Write-Host "Replaced 'Dugo (mm)' -> 'Długość (mm)'"
    $content = $content -replace "Dugo \(mm\)", "Długość (mm)"
}

# Fix "Ilo (szt)" -> "Ilość (szt)"
if ($content -match "Ilo \(szt\)") {
    Write-Host "Replaced 'Ilo (szt)' -> 'Ilość (szt)'"
    $content = $content -replace "Ilo \(szt\)", "Ilość (szt)"
}

# Fix "Moesz wpisa wasn dugo w mm" -> "Możesz wpisać własną długość w mm"
if ($content -match "Moesz wpisa wasn dugo w mm") {
    Write-Host "Replaced sentence 'Moesz wpisa wasn dugo w mm'"
    $content = $content -replace "Moesz wpisa wasn dugo w mm", "Możesz wpisać własną długość w mm"
}

Set-Content $path -Value $content -Encoding UTF8
Write-Host "app.js updated successfully."
