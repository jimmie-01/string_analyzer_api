export function parseNaturalLanguageQuery(query) {
  if (!query || typeof query !== "string") {
    throw { code: 400, message: "Query must be a string" };
  }

  const q = query.toLowerCase().trim();
  const filters = {};

  // Palindromic strings
  if (q.includes("palindromic")) filters.is_palindrome = true;

  // Word count (single word, two words, etc.)
  if (q.includes("single word") || q.includes("one word")) filters.word_count = 1;
  const wcMatch = q.match(/(\d+)\s+word/);
  if (wcMatch) filters.word_count = parseInt(wcMatch[1]);

  // Length comparisons
  const longerMatch = q.match(/longer than\s+(\d+)/);
  if (longerMatch) filters.min_length = parseInt(longerMatch[1]) + 1;

  const shorterMatch = q.match(/shorter than\s+(\d+)/);
  if (shorterMatch) filters.max_length = parseInt(shorterMatch[1]) - 1;

  // Contains specific letter
  const letterMatch = q.match(/letter\s+([a-z])/);
  if (letterMatch) filters.contains_character = letterMatch[1];

  const containsMatch = q.match(/containing the letter\s+([a-z])/);
  if (containsMatch) filters.contains_character = containsMatch[1];

  // Simple “strings containing X”
  const containsSimple = q.match(/containing the letter\s*'?([a-z])'?/);
  if (containsSimple) filters.contains_character = containsSimple[1];

  // Validate filters
  if (Object.keys(filters).length === 0) {
    throw { code: 400, message: "Unable to parse natural language query" };
  }

  return filters;
}
