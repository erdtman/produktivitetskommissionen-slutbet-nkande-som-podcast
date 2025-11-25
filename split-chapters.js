const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE = 'Fler möjligheter till ökat välstånd.md';
const OUTPUT_DIR = 'chapters';

// Read the input file
console.log(`Reading ${INPUT_FILE}...`);
const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = content.split('\n');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
  console.log(`Created directory: ${OUTPUT_DIR}/`);
}

// Find all top-level chapters (## followed by a single digit and space)
// Pattern: ## [digit] [title]
const chapterRegex = /^## (\d+) (.+)$/;
const chapters = [];
let currentChapter = null;
let preamble = [];
let inPreamble = true;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(chapterRegex);
  
  if (match) {
    // Found a new top-level chapter
    inPreamble = false;
    
    // Save previous chapter if exists
    if (currentChapter) {
      chapters.push(currentChapter);
    }
    
    // Start new chapter
    const chapterNum = match[1];
    const chapterTitle = match[2];
    currentChapter = {
      number: chapterNum,
      title: chapterTitle,
      lines: [line]
    };
  } else {
    // Add line to current context
    if (inPreamble) {
      preamble.push(line);
    } else if (currentChapter) {
      currentChapter.lines.push(line);
    }
  }
}

// Don't forget the last chapter
if (currentChapter) {
  chapters.push(currentChapter);
}

// Save preamble (everything before first chapter)
if (preamble.length > 0) {
  const preambleFile = path.join(OUTPUT_DIR, '00-preamble.md');
  fs.writeFileSync(preambleFile, preamble.join('\n'), 'utf-8');
  console.log(`Created: ${preambleFile} (${preamble.length} lines)`);
}

// Save each chapter to a separate file
chapters.forEach(chapter => {
  // Create a safe filename from chapter title
  const safeTitle = chapter.title
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const filename = `${chapter.number.padStart(2, '0')}-${safeTitle}.md`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  fs.writeFileSync(filepath, chapter.lines.join('\n'), 'utf-8');
  console.log(`Created: ${filepath} (${chapter.lines.length} lines) - ${chapter.title}`);
});

console.log(`\nDone! Created ${chapters.length} chapter files in ${OUTPUT_DIR}/`);

