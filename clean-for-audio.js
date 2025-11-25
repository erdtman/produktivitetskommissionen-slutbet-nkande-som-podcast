const fs = require('fs');
const path = require('path');

// Function to convert decade years to Swedish words
function convertDecadeToSwedish(year) {
  const yearNum = parseInt(year);
  
  // Handle 1900s
  if (yearNum >= 1900 && yearNum < 2000) {
    const decade = yearNum % 100;
    const decadeMap = {
      0: 'nittonhundra',
      10: 'nittonhundratio',
      20: 'nittonhundratjugo',
      30: 'nittonhundratrettio',
      40: 'nittonhundrafyrtio',
      50: 'nittonhundrafemtio',
      60: 'nittonhundrasextio',
      70: 'nittonhundrasjuttio',
      80: 'nittonhundraåttio',
      90: 'nittonhundranittio'
    };
    return decadeMap[decade] || year;
  }
  
  // Handle 2000s
  if (yearNum >= 2000 && yearNum < 2100) {
    const decade = yearNum % 100;
    const decadeMap = {
      0: 'tjugohundra',
      10: 'tjugohundratio',
      20: 'tjugohundratjugo',
      30: 'tjugohundratrettio',
      40: 'tjugohundrafyrtio',
      50: 'tjugohundrafemtio',
      60: 'tjugohundrasextio',
      70: 'tjugohundrasjuttio',
      80: 'tjugohundraåttio',
      90: 'tjugohundranittio'
    };
    return decadeMap[decade] || year;
  }
  
  // For years outside these ranges, return the original
  return year;
}

function cleanMarkdownForAudio(content) {
  // Split into lines
  let lines = content.split('\n');
  
  // Remove lines that are headers/footers with SOU references
  lines = lines.filter(line => {
    const trimmed = line.trim();
    // Match patterns like "**Sammanfattande analys och inriktning SOU 2025:**"
    // or "**SOU 2025:96 Sammanfattande analys och inriktning**"
    // More flexible pattern to catch various formats including "SOU 2025:" without digits after colon
    const souPattern = /\*\*.*?SOU\s*\d+(:\d*)?.*?\*\*/i;
    return !souPattern.test(trimmed);
  });
  
  // Remove code block markers (standalone ``` lines)
  lines = lines.filter(line => {
    return line.trim() !== '```';
  });
  
  // Remove lines with multiple dots (table of contents formatting, etc.)
  lines = lines.filter(line => {
    const trimmed = line.trim();
    // Remove lines that are mostly dots (5 or more consecutive dots)
    return !/\.{5,}/.test(trimmed);
  });
  
  // Remove URLs - lines containing http:// or https://
  lines = lines.filter(line => {
    return !line.includes('http://') && !line.includes('https://');
  });
  
  // Handle figure and table references - make them audio-friendly
  lines = lines.map(line => {
    // Match patterns like "**Figur X.Y ..." or "**Tabell X.Y ..."
    if (/^\*\*(Figur|Tabell)\s+\d+\.?\s*\d*\s+/i.test(line.trim())) {
      const type = line.match(/\*\*(Figur|Tabell)/i)[1];
      const number = line.match(/(\d+\.?\s*\d*)/)[1].trim();
      return `[${type} ${number} - se ursprungsdokument]`;
    }
    return line;
  });
  
  // Remove lines that contain chart/table data (sequences of numbers/percentages with labels)
  lines = lines.filter(line => {
    const trimmed = line.trim();
    // Match lines with multiple percentage signs (e.g., "0% 5% 10% 15%...")
    if ((trimmed.match(/%/g) || []).length >= 3) {
      return false;
    }
    // Match lines with sequences of single/double digit numbers followed by text
    // that indicate axis labels or legend items (e.g., "12 13 14 15 16 17 18...")
    if (/^\*?\*?\d+%?\s+\d+%?\s+\d+%?\s+\d+/.test(trimmed)) {
      return false;
    }
    // Match lines with multiple 4-digit years in sequence (e.g., "1969197219751978...")
    // or large numbers with spaces (e.g., "20 000 40 000 60 000...")
    if (/\d{4}\d{4}\d{4}\d{4}/.test(trimmed) || 
        (trimmed.match(/\d+\s\d{3}(\s|$)/g) || []).length >= 2) {
      return false;
    }
    return true;
  });
  
  // Remove superscript references like ^1, ^2, etc. and footnote lines
  lines = lines.map(line => {
    // Remove inline superscript references
    line = line.replace(/\^(\d+)/g, '');
    // Remove footnote lines that start with (^1) etc
    if (/^\(\^\d+\)/.test(line.trim())) {
      return '';
    }
    return line;
  });
  
  // Join lines back together
  let text = lines.join('\n');
  
  // Remove empty parentheses that remain after removing footnote numbers
  text = text.replace(/\(\s*\)/g, '');
  
  // Remove (^) patterns that remain from footnotes
  text = text.replace(/\(\^\)/g, '');
  
  // Remove SOU and proposition references like (SOU 2024:29), (prop. 2008/09:29), 
  // (SOU 2024), (prop 2008), (SOU 2024:29, 2025:30), (SOU 1993:16, sida 109), 
  // (prop. 2008/09:29, sida 205), (SOU 2024:29 sida 205 ff.), etc.
  text = text.replace(/\((SOU|prop\.?)\s*[0-9:\/,\-\s]+(?:,?\s*(?:sida|s\.)\s*\d+[.\s]*(?:ff\.)?[.\s]*)?\)/gi, '');
  
  // Remove standalone SOU and prop references not in parentheses
  text = text.replace(/\b(SOU|prop\.?)\s*\d{4}[:\d\/]*/gi, '');
  
  // Remove Dir. and Ds references like (Dir. 2023:58), (dir. 2024:98), (Ds 2024:31)
  text = text.replace(/\((Dir|Ds)\.?\s*\d{4}:\d+\)/gi, '');
  
  // Remove standalone Dir. and Ds references not in parentheses
  text = text.replace(/\b(Dir|Ds)\.?\s*\d{4}:\d+/gi, '');
  
  // Remove SFS references like (SFS 1998:1474), (sfs 2024:783)
  text = text.replace(/\(SFS\.?\s*\d{4}:\d+\)/gi, '');
  
  // Remove standalone SFS references not in parentheses
  text = text.replace(/\bSFS\.?\s*\d{4}:\d+/gi, '');
  
  // Remove cross-references like "se kapitel X", "se avsnitt X.X.X", "se även kapitel X"
  // "se också", "se vidare", "se bilaga X", "se originalrapporten", etc.
  text = text.replace(/\bse\s+(även|också|vidare|till exempel|exempelvis)?\s*(kapitel|avsnitt|bilaga|delbetänkandet|slutbetänkandet|originalrapporten|figur|tabell)\s*\d*\.?\d*\.?\d*/gi, '');
  text = text.replace(/\bse\s+(originalrapporten|delbetänkandet|slutbetänkandet)\b[^.!?]*/gi, '');
  
  // Remove parenthetical cross-references like "(se kapitel X)", "(se avsnitt X.X)"
  text = text.replace(/\(\s*se\s+[^)]+\)/gi, '');
  
  // Remove parenthetical chapter references like "(kapitel 3)", "(kapitel 7)", "(kapitel 12)"
  // Handle both single-line and hyphenated line breaks like "(kapi-\ntel 13)"
  text = text.replace(/\(\s*kapi-?\s*\n?\s*tel\s+\d+\s*\)/gi, '');
  text = text.replace(/\(\s*kapitel\s+\d+\s*\)/gi, '');
  
  // Remove bibliographic citations like (Vårdföretagarna, 2025), (SCB, 2025b; Skolverket, 2025a),
  // (Skolverket, 2025a; 2025b), etc.
  // Matches: opening paren, capital letter start, comma, year with optional letter suffix
  text = text.replace(/\([A-ZÅÄÖ][^()]*?,\s*\d{4}[a-z]?[^()]*?\)/g, '');
  
  // Remove standalone year references in parentheses like (2012), (1995), (2024a), (2023b), etc.
  text = text.replace(/\(\d{4}[a-z]?\)/g, '');
  
  // Remove organization/author names followed by year in parentheses, e.g., "Statskontoret (2023a)", "Digg (2025e)"
  // This handles cases where the citation is inline rather than at the end
  text = text.replace(/\b([A-ZÅÄÖ][a-zåäöA-ZÅÄÖ\-]+)\s+\(\d{4}[a-z]?\)/g, '$1');
  
  // Remove "för grafisk presentation" and similar phrases
  text = text.replace(/för grafisk presentation/gi, 'se ursprungsdokument');
  
  // Remove legal references in parentheses like (2018:1277), (2024:783), (1994:200), etc.
  // This includes law references like "lag (2018:1277)" - we keep "lag" but remove the numbers
  text = text.replace(/\(\d{4}:\d+\)/g, '');
  
  // Remove section references like "11 kapitel 6 – 11 §", "6 kapitel 12 §"
  // Keep the word "kapitel" but remove the numbers and section symbols
  text = text.replace(/\d+\s+kapitel\s+\d+\s*[–-]\s*\d+\s*§/g, 'kapitel');
  text = text.replace(/\d+\s+kapitel\s+\d+\s*§/g, 'kapitel');
  
  // Remove standalone section references like "2 §", "12 §"
  text = text.replace(/\b\d+\s*§\b/g, '');
  
  // Fix spacing issues in dates (e.g., "2 0 april" -> "20 april")
  text = text.replace(/(\d)\s+(\d)(\s+(?:januari|februari|mars|april|maj|juni|juli|augusti|september|oktober|november|december))/gi, '$1$2$3');
  
  // Normalize large numbers with spaces (e.g., "28 350" -> "28350", "5 000 000" -> "5000000")
  // This helps TTS handle numbers more consistently
  // Match patterns like "digit(s) space digit(s) space digit(s)" where each group is 3 digits or less
  text = text.replace(/\b(\d{1,3})(\s\d{3})+\b/g, (match) => {
    return match.replace(/\s/g, '');
  });
  
  // Remove underscores used for italics (e.g., _word_ becomes word)
  text = text.replace(/_/g, '');
  
  // Remove bold formatting markers (e.g., **word** becomes word)
  text = text.replace(/\*\*/g, '');
  
  // Remove markdown heading indicators (e.g., # Heading becomes Heading)
  text = text.replace(/^#+\s*/gm, '');
  
  // Remove numbering from headings (e.g., "7 Konkurrens och handel" becomes "Konkurrens och handel")
  // Matches patterns like "7 ", "7.1 ", "7.1.2 ", "8.3.10 " at the start of lines
  text = text.replace(/^(\d+\.)*\d+\s+(?=[A-ZÅÄÖ])/gm, '');
  
  // Remove section/chapter references like "1.4.2", "1.4.3", "1.4" etc.
  // These are typically standalone or at the beginning of sentences
  // Pattern matches: X.Y.Z (like 1.4.2), X.Y.Z.W (like 1.4.2.1), or X.Y (like 1.4)
  // with word boundaries to avoid matching decimals in numbers
  text = text.replace(/\b\d{1,2}\.\d{1,2}\.\d{1,2}\.\d{1,2}\b/g, ''); // 1.4.2.1
  text = text.replace(/\b\d{1,2}\.\d{1,2}\.\d{1,2}\b/g, ''); // 1.4.2
  text = text.replace(/\b\d{1,2}\.\d{1,2}(?!\d)/g, ''); // 1.4 (but not if followed by more digits)
  
  // Replace common Swedish abbreviations with full forms for better audio rendering
  const abbreviations = {
    'bl\\.a\\.': 'bland annat',
    '\\bbl a\\b': 'bland annat',
    'd\\.v\\.s\\.': 'det vill säga',
    '\\bdvs\\b': 'det vill säga',
    'ekon\\. dr\\.': 'ekonomie doktor',
    'etc\\.': 'et cetera',
    'f\\.d\\.': 'före detta',
    'fil\\. dr\\.': 'filosofie doktor',
    'f\\.r\\.o\\.m\\.': 'från och med',
    'fr\\.o\\.m\\.': 'från och med',
    '\\bfrom\\b': 'från och med',
    'm\\.fl\\.': 'med flera',
    '\\bm fl\\b': 'med flera',
    'm\\.m\\.': 'med mera',
    'M\\. Sc\\.': 'Master of Science',
    'o\\.d\\.': 'och dylikt',
    'osv\\.': 'och så vidare',
    'p\\.g\\.a\\.': 'på grund av',
    '\\bpga\\b': 'på grund av',
    's\\.k\\.': 'så kallad',
    '(?<![a-zåäöéèàüA-ZÅÄÖÉÈÀÜ])sk(?![a-zåäöéèàüA-ZÅÄÖÉÈÀÜ])': 'så kallad',
    't\\.ex\\.': 'till exempel',
    '\\bt ex\\b': 'till exempel',
    't\\.o\\.m\\.': 'till och med',
    '\\btom\\b': 'till och med',
    '\\bca\\b': 'cirka',
    '\\bvd\\b': 'verkställande direktör',
    '\\bVD\\b': 'verkställande direktör'
  };
  
  // Apply abbreviation replacements
  Object.keys(abbreviations).forEach(abbr => {
    const regex = new RegExp(abbr, 'gi');
    text = text.replace(regex, abbreviations[abbr]);
  });
  
  
  // Replace decade references (e.g., 1980-talet -> nittonhundraåttiotalet)
  text = text.replace(/(\d{4})-talet/g, (match, year) => {
    return convertDecadeToSwedish(year) + 'talet';
  });
  
  // Replace abbreviated decade references (e.g., 90-talet -> nittonhundranittiotalet)
  // For decades 10-99, assume 1900s; for 00-09, assume 2000s
  text = text.replace(/\b(\d{2})-talet/g, (match, decade) => {
    const decadeNum = parseInt(decade);
    let fullYear;
    
    // Assume 00-09 refers to 2000s, 10-99 refers to 1900s
    if (decadeNum >= 0 && decadeNum <= 9) {
      fullYear = 2000 + decadeNum;
    } else {
      fullYear = 1900 + decadeNum;
    }
    
    return convertDecadeToSwedish(fullYear.toString()) + 'talet';
  });
  
  // Handle common organization and term replacements for better pronunciation
  const organizationReplacements = {
    '\\bMcKinsey\\b': 'Mäk kinzi',
    '\\bGoogle\\b': 'Guugel',
    '\\bFacebook\\b': 'Fejsbuk',
    '\\bLinkedIn\\b': 'Linkd in',
    '\\bPatent- och marknadsöverdomstolen\\b': 'Patent och marknadsöverdomstolen',
    '\\bregion Stockholm\\b': 'Region Stockholm',
    '\\bGATT\\b': 'G A T T'
  };
  
  // Apply organization/term replacements
  Object.keys(organizationReplacements).forEach(org => {
    const regex = new RegExp(org, 'g');
    text = text.replace(regex, organizationReplacements[org]);
  });
  
  // Clean up bracketed ellipsis [..] or [.. ] - remove the brackets and dots (with optional spaces)
  text = text.replace(/\[\s*\.\.\s*\]/g, '');
  
  // Clean up double periods at the end of headers or sentences
  text = text.replace(/\.\.\s*$/gm, '.');
  
  // Clean up double periods that start a line (continuation markers)
  // Replace with nothing as they're just visual markers
  text = text.replace(/^\.\.\s+/gm, '');
  
  // Clean up double periods inside quotes (e.g., ".. text")
  text = text.replace(/"\.\.\s+/g, '"');
  
  // Clean up any remaining double periods that might occur after abbreviation expansion
  text = text.replace(/\.\./g, '.');
  
  // Special case: "kap." when followed by a number (chapter reference)
  text = text.replace(/\bkap\.\s*(\d+)/gi, 'kapitel $1');
  
  // Special case: "s." when followed by a number (page reference)
  text = text.replace(/\bs\.\s*(\d+)/g, 'sida $1');
  
  // Remove chart/figure data remnants (e.g., axis labels, country codes in sequence)
  // Pattern: lines starting with numbers/decimals and containing multiple country codes
  text = text.replace(/^\s*[-\d,\s\.]+\s+[A-Z]{3}(\s+[A-Z]{3})+.*?(?=\n|$)/gm, '');
  // Also remove year ranges with country codes that appear in text
  text = text.replace(/\s+[-\d,\s\.]+\s+[A-Z]{3}(\s+[A-Z]{3})+\s+(?:EUR\s+)?\d{4}[-–\d\s]+(?=\s+[a-zåäö])/g, ' ');
  // Remove standalone year range patterns like "1996-2006 2007-2010 2011-2019 2020-2023"
  text = text.replace(/\s+\d{4}[-–]\d{4}(?:\s+\d{4}[-–]\d{4}){2,}\s+/g, ' ');
  
  // Add paragraph breaks before bold section titles that appear mid-paragraph
  // This helps with audio rendering by creating natural pauses
  text = text.replace(/([.!?])\s+(\*\*[A-ZÅÄÖ])/g, '$1\n\n$2');
  
  // Now merge paragraphs - join lines that are not separated by blank lines
  // Split by double newlines (paragraph breaks) to preserve them
  const paragraphs = text.split(/\n\n+/);
  
  const cleanedParagraphs = paragraphs.map(para => {
    // Check if this is a header (starts with #)
    if (para.trim().startsWith('#')) {
      // Keep headers as-is, just trim
      return para.trim();
    }
    
    // For regular paragraphs, merge lines
    let cleaned = para
      // Handle hyphenated words split across lines (e.g., "produktivitets-\nkommissionen")
      // Keep the hyphen and add space, then let the next step decide what to do
      .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1- $2')
      // Handle hyphenated words within the same line that should be merged or kept as separate
      .replace(/(\w+)-\s+(\w+)/g, (match, p1, p2) => {
        // Keep spaces and hyphens around common Swedish conjunctions and prepositions
        const keepSpaceWords = /^(och|eller|i|på|av|för|till|med|om|som|från|än|vid|under|över)$/i;
        if (keepSpaceWords.test(p2)) {
          return p1 + '- ' + p2; // Keep hyphen and space before conjunction
        }
        // For other cases, merge the words (they were likely split compound words)
        return p1 + p2;
      })
      // Replace single newlines with spaces
      .replace(/\n/g, ' ')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      // Trim whitespace
      .trim();
    
    return cleaned;
  }).filter(para => para.length > 0); // Remove empty paragraphs
  
  // Now merge paragraphs that were split mid-sentence (due to removed headers)
  const mergedParagraphs = [];
  for (let i = 0; i < cleanedParagraphs.length; i++) {
    const current = cleanedParagraphs[i];
    
    // Skip headers - they should always start a new paragraph
    if (current.startsWith('#')) {
      mergedParagraphs.push(current);
      continue;
    }
    
    // Check if the previous paragraph ended without proper punctuation
    // and this one starts with a lowercase letter (indicates continuation)
    if (mergedParagraphs.length > 0) {
      const previous = mergedParagraphs[mergedParagraphs.length - 1];
      const prevEndsIncomplete = !previous.match(/[.!?:;]$/);
      const currentStartsLower = current.match(/^[a-zåäöé]/);
      
      if (prevEndsIncomplete && currentStartsLower && !previous.startsWith('#')) {
        // Merge with previous paragraph
        mergedParagraphs[mergedParagraphs.length - 1] = previous + ' ' + current;
        continue;
      }
    }
    
    mergedParagraphs.push(current);
  }
  
  // Join paragraphs with double newlines
  let finalText = mergedParagraphs.join('\n\n');
  
  // Split extremely long sentences for better TTS handling
  // Only split sentences longer than 300 characters at natural break points
  finalText = finalText.replace(/([^.!?]{300,}?)([,;]\s+(?:och|men|eller|samt|dock|därför|dessutom|vidare|samtidigt|emellertid))/g, '$1.$2');
  
  // Final cleanup of any remaining problematic patterns after paragraph merging
  // Remove any remaining [..] or [.. ] patterns
  finalText = finalText.replace(/\[\s*\.\.\s*\]/g, '');
  
  // Remove double periods at start of sentences (after merging)
  finalText = finalText.replace(/\.\s+\.\.\s+/g, '. ');
  
  // Remove standalone double periods that start fragments
  finalText = finalText.replace(/\s+\.\.\s+/g, ' ');
  
  // Clean up any remaining double periods
  finalText = finalText.replace(/\.\./g, '.');
  
  // Clean up extra spaces before punctuation (caused by removed parenthetical references)
  finalText = finalText.replace(/\s+,/g, ',');
  finalText = finalText.replace(/\s+\./g, '.');
  finalText = finalText.replace(/\s+;/g, ';');
  finalText = finalText.replace(/\s+:/g, ':');
  
  // Normalize percentage formatting for better TTS (e.g., ensure space before %)
  finalText = finalText.replace(/(\d)\s*%/g, '$1 procent');
  
  // Handle common mathematical expressions
  finalText = finalText.replace(/\b(\d+)\s*×\s*(\d+)/g, '$1 gånger $2');
  finalText = finalText.replace(/\b(\d+)\s*÷\s*(\d+)/g, '$1 delat med $2');
  
  // Clean up any double spaces that may have been introduced
  finalText = finalText.replace(/  +/g, ' ');
  
  return finalText;
}

// Main function to process all markdown files in chapters directory
function processChapters() {
  const chaptersDir = path.join(__dirname, 'chapters');
  const outputDir = path.join(__dirname, 'chapters-clean');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  // Read all files from chapters directory
  const files = fs.readdirSync(chaptersDir);
  
  files.forEach(file => {
    if (path.extname(file) === '.md') {
      console.log(`Processing ${file}...`);
      
      const inputPath = path.join(chaptersDir, file);
      const outputPath = path.join(outputDir, file);
      
      // Read the file
      const content = fs.readFileSync(inputPath, 'utf8');
      
      // Clean the content
      const cleaned = cleanMarkdownForAudio(content);
      
      // Write to output directory
      fs.writeFileSync(outputPath, cleaned, 'utf8');
      
      console.log(`  ✓ Saved to ${outputPath}`);
    }
  });
  
  console.log('\nAll files processed successfully!');
}

// Run the script
processChapters();

