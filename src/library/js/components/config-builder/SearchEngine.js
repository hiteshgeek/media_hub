/**
 * Config Builder - Search Engine
 * Fuzzy search functionality for options and styles
 */

/**
 * Build search index from option and style definitions
 * @param {Object} optionDefinitions - Option definitions object
 * @param {Object} styleDefinitions - Style definitions object
 * @returns {Array} Search index array
 */
export function buildSearchIndex(optionDefinitions, styleDefinitions) {
  const searchIndex = [];

  // Index config options
  for (const [categoryKey, category] of Object.entries(optionDefinitions)) {
    for (const [optionKey, option] of Object.entries(category.options)) {
      searchIndex.push({
        key: optionKey,
        label: option.label || optionKey,
        hint: option.hint || "",
        category: category.title,
        categoryKey: categoryKey,
        icon: category.icon,
        type: "config",
        searchText: `${option.label || optionKey} ${option.hint || ""} ${optionKey}`.toLowerCase()
      });
    }
  }

  // Index style options
  for (const [sectionKey, section] of Object.entries(styleDefinitions)) {
    // Handle variables as object (key-value pairs)
    if (section.variables && typeof section.variables === 'object') {
      for (const [varKey, variable] of Object.entries(section.variables)) {
        searchIndex.push({
          key: varKey,
          label: variable.label || varKey,
          hint: variable.hint || "",
          category: section.title,
          categoryKey: sectionKey,
          icon: section.icon,
          type: "style",
          searchText: `${variable.label || varKey} ${variable.hint || ""} ${varKey}`.toLowerCase()
        });
      }
    }
  }

  return searchIndex;
}

/**
 * Fuzzy search implementation
 * @param {Array} searchIndex - Search index to search in
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {Array} Matching results sorted by relevance
 */
export function fuzzySearch(searchIndex, query, limit = 15) {
  if (!searchIndex || !searchIndex.length) return [];

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
  const results = [];

  for (const item of searchIndex) {
    const score = calculateFuzzyScore(item, queryWords, queryLower);
    if (score > 0) {
      results.push({ ...item, score });
    }
  }

  // Sort by score (higher is better) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Calculate fuzzy match score for an item
 * @param {Object} item - Search index item
 * @param {Array} queryWords - Query split into words
 * @param {string} queryLower - Lowercase query
 * @returns {number} Match score (0 = no match)
 */
export function calculateFuzzyScore(item, queryWords, queryLower) {
  let score = 0;
  const labelLower = item.label.toLowerCase();
  const keyLower = item.key.toLowerCase();
  const hintLower = item.hint.toLowerCase();

  // Exact match in label (highest priority)
  if (labelLower === queryLower) {
    score += 100;
  } else if (labelLower.startsWith(queryLower)) {
    score += 80;
  } else if (labelLower.includes(queryLower)) {
    score += 60;
  }

  // Match in key
  if (keyLower.includes(queryLower)) {
    score += 40;
  }

  // Match in hint
  if (hintLower.includes(queryLower)) {
    score += 20;
  }

  // Word-by-word matching for multi-word queries
  if (queryWords.length > 1) {
    let wordMatches = 0;
    for (const word of queryWords) {
      if (labelLower.includes(word) || keyLower.includes(word) || hintLower.includes(word)) {
        wordMatches++;
      }
    }
    if (wordMatches === queryWords.length) {
      score += 30; // All words found
    } else if (wordMatches > 0) {
      score += wordMatches * 5;
    }
  }

  // Fuzzy character matching (for typos)
  if (score === 0) {
    const fuzzyScore = fuzzyCharMatch(queryLower, labelLower);
    if (fuzzyScore > 0.6) {
      score += fuzzyScore * 30;
    }
  }

  return score;
}

/**
 * Fuzzy character matching using Levenshtein-like approach
 * @param {string} query - Query string
 * @param {string} target - Target string to match against
 * @returns {number} Match ratio (0-1)
 */
export function fuzzyCharMatch(query, target) {
  if (query.length === 0) return 0;
  if (target.length === 0) return 0;

  let matchCount = 0;
  let targetIndex = 0;

  for (const char of query) {
    const foundIndex = target.indexOf(char, targetIndex);
    if (foundIndex !== -1) {
      matchCount++;
      targetIndex = foundIndex + 1;
    }
  }

  return matchCount / query.length;
}

/**
 * Highlight matching parts of text
 * @param {string} text - Text to highlight
 * @param {string} query - Query to highlight
 * @returns {string} HTML with highlighted matches
 */
export function highlightMatch(text, query) {
  if (!query) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}
