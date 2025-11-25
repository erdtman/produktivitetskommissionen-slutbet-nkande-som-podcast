# **Task: Prepare Swedish Government Document for Text-to-Speech**

You are tasked with transforming a Swedish government report chapter from a visually-formatted markdown document into clean, audio-friendly text suitable for text-to-speech (TTS) systems.

## Input
You will receive markdown-formatted Swedish text from a government report chapter.

## Goal
Create a natural, flowing listening experience by removing all elements that serve visual readers but interrupt or confuse audio listeners, while preserving all substantive content, analysis, and arguments.

## Core Transformation Principles

### 1. **Remove Document Metadata & Navigation**
Strip out all document identifiers, references, and navigation aids that help visual readers locate information but serve no purpose in audio:
- Document codes and references (SOU, propositions, directives, legal statute numbers)
- Cross-references to other chapters, sections, appendices, or figures
- Headers and footers containing document titles

### 2. **Replace Visual Elements with Placeholders**
Anything that exists primarily as a visual element should be removed or replaced with a brief Swedish placeholder:
- Figures, charts, and their data (replace with "[se ursprungsdokument]")
- Tables and tabular data
- URLs and hyperlinks
- Code blocks
- Graph axis labels, legend items, and numeric sequences

### 3. **Remove Academic Citation Apparatus**
Strip all citation and reference mechanisms:
- Footnote markers and footnote text
- Bibliographic citations in parentheses (author, year format)
- Legal paragraph references (§ symbols)
- Year-only references in parentheses

### 4. **Strip Formatting Markers**
Remove markdown and formatting syntax that are visual indicators:
- Bold (**) and italic (_) markers
- Heading indicators (#)
- Table of contents formatting (dotted lines)

### 5. **Optimize for Pronunciation**
Expand common Swedish abbreviations into their full spoken forms for better TTS pronunciation:
- "bl.a." → "bland annat"
- "t.ex." → "till exempel"  
- "dvs" → "det vill säga"
- "ca" → "cirka"
- And similar common abbreviations

### 6. **Create Natural Flow**
Reconstruct text into natural, complete paragraphs:
- Merge text fragments that were split by removed headers or references
- Handle hyphenated words that were split across lines
- Ensure paragraphs end with proper punctuation
- Maintain logical paragraph breaks (double newlines) between distinct ideas

## What to Preserve
Keep ALL substantive content including:
- Analysis and arguments
- Explanatory text
- Policy recommendations
- Statistical findings (when embedded in prose, not as chart data)
- Quotes and examples

## Output Format
Return Swedish text with:
- Natural paragraph structure (blank lines between paragraphs)
- Complete, properly punctuated sentences
- Expanded abbreviations
- No formatting markers
- No references or citations
- Smooth, speakable prose