/**
 * Text Analytics & Readability Analyzer
 * Computes word metrics, syllable density, and reading level.
 */

export function analyzeText(text) {
  if (!text || !text.trim()) {
    return {
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      readingTimeSeconds: 0,
      readingLevel: 'N/A',
      score: 100,
    };
  }

  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = trimmed.length;

  // Split by sentences (. ! ?)
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = Math.max(sentences.length, 1);

  // Approximate reading time (average 200 words per minute)
  const readingTimeSeconds = Math.max(Math.round((wordCount / 200) * 60), 1);

  // Approximate syllable count
  let syllableCount = 0;
  words.forEach((word) => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length <= 3) {
      syllableCount += 1;
    } else {
      const matches = cleanWord.match(/[aeiouy]{1,2}/g);
      syllableCount += matches ? matches.length : 1;
    }
  });

  // Flesch Reading Ease Formula: 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = syllableCount / Math.max(wordCount, 1);
  const fleschScore = Math.round(
    Math.max(0, Math.min(100, 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord))
  );

  let readingLevel = 'Standard';
  if (fleschScore >= 90) readingLevel = 'Very Easy (5th grade)';
  else if (fleschScore >= 80) readingLevel = 'Easy (6th grade)';
  else if (fleschScore >= 70) readingLevel = 'Fairly Easy (7th grade)';
  else if (fleschScore >= 60) readingLevel = 'Standard (8th–9th grade)';
  else if (fleschScore >= 50) readingLevel = 'Fairly Difficult (High School)';
  else if (fleschScore >= 30) readingLevel = 'Difficult (College)';
  else readingLevel = 'Very Confusing (Professional)';

  return {
    wordCount,
    charCount,
    sentenceCount,
    readingTimeSeconds,
    readingLevel,
    score: fleschScore,
  };
}
