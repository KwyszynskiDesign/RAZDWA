$path = "h:\RAZ DWA\RAZDWA\docs\js\categories\cad-upload.js"
$text = [System.IO.File]::ReadAllText($path)

$testBlockFixed = @'
// 🧪 FORMAT TEST SUITE - usuń po weryfikacji
console.log('🧪 Testing classifyFormat...');
const tests = [
  { w: 210, h: 297, expect: 'A4' },
  { w: 305, h: 425, expect: 'A3-custom' },
  { w: 850, h: 1200, expect: 'A0' },
  { w: 900, h: 1300, expect: 'A0+ (90x130cm)' },
  { w: 500, h: 700, expect: 'Custom (50x70cm)' }
];

tests.forEach((test, i) => {
  const result = classifyFormat(test.w, test.h);
  const pass = result.includes(test.expect);
  console.log(`Test ${i + 1}: ${pass ? '✅' : '❌'} ${test.w}x${test.h} → ${result}`);
});
'@

$classifyBlockFixed = @'
// ─── CLASSIFY FORMAT (UI) ──────────────────────────────────────────────────
const CLASSIFY_TOLERANCE_MM = 15;

function classifyFormat(widthMm, heightMm) {
  const short = Math.min(widthMm, heightMm);
  const long = Math.max(widthMm, heightMm);

  console.group('📏 FORMAT CLASSIFICATION');
  console.log(`Input: ${widthMm}x${heightMm}mm → Short:${short} Long:${long}`);

  let result;
  // A-FORMATY z tolerancją ±15mm
  if (inRange(short, 210, 297)) result = classifyA4(long);
  else if (inRange(short, 297, 420)) result = classifyA3(long);
  else if (inRange(short, 420, 594)) result = classifyA2(long);
  else if (inRange(short, 594, 841)) result = classifyA1(long);
  else if (inRange(short, 841, 1189)) result = classifyA0(long);
  else result = classifyA0Plus(short, long);

  console.log('FORMAT READY');
  console.groupEnd();
  return result;
}

function inRange(value, min, max) {
  return value >= (min - CLASSIFY_TOLERANCE_MM) && value <= (max + CLASSIFY_TOLERANCE_MM);
}

function classifyA4(long) { return long >= 280 && long <= 310 ? 'A4' : 'A4-custom'; }
function classifyA3(long) { return long >= 400 && long <= 440 ? 'A3' : 'A3-custom'; }
function classifyA2(long) { return long >= 575 && long <= 615 ? 'A2' : 'A2-custom'; }
function classifyA1(long) { return long >= 825 && long <= 860 ? 'A1' : 'A1-custom'; }
function classifyA0(long) { return long >= 1170 && long <= 1215 ? 'A0' : 'A0-custom'; }

function classifyA0Plus(short, long) {
  const shortCm = Math.round(short / 10);
  const longCm = Math.round(long / 10);
  return short > 1189 ? `A0+ (${shortCm}x${longCm}cm)` : `Custom (${shortCm}x${longCm}cm)`;
}
'@

# Replace test block if present (double-quote artifact) or insert after import
$importLine = "import { drukCad } from '../prices.js';"
if ($text -notmatch [regex]::Escape($testBlockFixed.Trim())) {
  $text = $text -replace [regex]::Escape($importLine), ($importLine + "`r`n`r`n" + $testBlockFixed.TrimEnd())
}

# Replace classify block (any variant)
$pattern = "(?s)// ─── CLASSIFY FORMAT \(UI\).*?function classifyA0Plus\([\s\S]*?\}\r?\n"
$text = [regex]::Replace($text, $pattern, $classifyBlockFixed + "`r`n", 1)

[System.IO.File]::WriteAllText($path, $text)
