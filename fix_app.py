import re

path = "docs/assets/app.js"

try:
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
except UnicodeDecodeError:
    # Fallback if utf-8 fails, try loading as latin1 or cp1252 to rescue bytes
    print("UTF-8 read failed, trying latin-1 to rescue.")
    with open(path, "r", encoding="latin-1") as f:
        content = f.read()

# Replacements list
replacements = [
    (r'may Canon', 'mały Canon'),
    (r'May Canon', 'Mały Canon'),
    (r'Sk.{1,8}adanie', 'Składanie'),
    (r'aria-label="Usu.{1,8}"', 'aria-label="Usuń"'),
    (r'Dugo \(mm\)', 'Długość (mm)'),
    (r'Ilo \(szt\)', 'Ilość (szt)'),
    (r'Moesz wpisa wasn dugo w mm', 'Możesz wpisać własną długość w mm'),
    (r'czas realizacji 1-2 dni', 'czas realizacji 1-2 dni'), # check encoding
]

new_content = content
for pattern, replacement in replacements:
    new_content = re.sub(pattern, replacement, new_content)

if new_content != content:
    print("Changes detected, writing file...")
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("File updated.")
else:
    print("No changes made.")
