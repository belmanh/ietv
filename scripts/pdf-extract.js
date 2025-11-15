const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function extract(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  const outDir = path.join(__dirname, 'extracted');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const dataBuffer = fs.readFileSync(filePath);
  try {
    const data = await pdf(dataBuffer);
    const text = data.text || '';
    const outPath = path.join(outDir, `${name}.txt`);
    fs.writeFileSync(outPath, text, 'utf8');
    console.log(`Wrote extracted text to ${outPath}`);
  } catch (err) {
    console.error(`Failed to extract ${filePath}:`, err.message || err);
    process.exitCode = 2;
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/pdf-extract.js <path/to/file1.pdf> [file2.pdf ...]');
    process.exit(1);
  }

  for (const p of args) {
    const full = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
    if (!fs.existsSync(full)) {
      console.error(`File not found: ${full}`);
      continue;
    }
    await extract(full);
  }
}

main();
