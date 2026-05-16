export interface GlobalSearchItemResult {
  id: string;
  title: string;
  preview: string;
  type: {
    name: string;
    icon: string | null;
    color: string | null;
  };
}

export interface GlobalSearchCollectionResult {
  id: string;
  name: string;
  preview: string;
  itemCount: number;
}

export interface GlobalSearchData {
  items: GlobalSearchItemResult[];
  collections: GlobalSearchCollectionResult[];
}

export interface GlobalSearchResults {
  items: GlobalSearchItemResult[];
  collections: GlobalSearchCollectionResult[];
}

const DEFAULT_RESULT_LIMIT = 8;
const MAX_ABBREVIATION_LENGTH = 3;

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase();
}

function getFuzzyScore(source: string, query: string) {
  const sourceText = normalizeSearchText(source);
  const queryText = normalizeSearchText(query);

  if (!queryText) {
    return 0;
  }

  const exactIndex = sourceText.indexOf(queryText);

  if (exactIndex >= 0) {
    return exactIndex;
  }

  const tokens = sourceText.split(/[^a-z0-9]+/).filter(Boolean);
  const prefixIndex = tokens.findIndex((token) => token.startsWith(queryText));

  if (prefixIndex >= 0) {
    return 25 + prefixIndex;
  }

  if (queryText.length > MAX_ABBREVIATION_LENGTH) {
    return null;
  }

  const tokenScores = tokens.flatMap((token, tokenIndex) => {
    let tokenIndexOffset = 0;
    let score = 0;

    for (const character of queryText) {
      const matchIndex = token.indexOf(character, tokenIndexOffset);

      if (matchIndex === -1) {
        return [];
      }

      score += matchIndex - tokenIndexOffset + 1;
      tokenIndexOffset = matchIndex + 1;
    }

    return [score + 100 + tokenIndex];
  });

  if (tokenScores.length > 0) {
    return Math.min(...tokenScores);
  }

  return null;
}

function compareSearchMatches(
  left: { score: number; label: string },
  right: { score: number; label: string }
) {
  if (left.score !== right.score) {
    return left.score - right.score;
  }

  return left.label.localeCompare(right.label);
}

function searchRecords<T>(
  records: T[],
  query: string,
  getLabel: (record: T) => string,
  getSearchText: (record: T) => string,
  limit: number
) {
  const queryText = normalizeSearchText(query);

  if (!queryText) {
    return records.slice(0, limit);
  }

  return records
    .flatMap((record) => {
      const score = getFuzzyScore(getSearchText(record), queryText);

      return score === null
        ? []
        : [
            {
              label: getLabel(record),
              result: record,
              score,
            },
          ];
    })
    .sort(compareSearchMatches)
    .slice(0, limit)
    .map(({ result }) => result);
}

export function getGlobalSearchResults(
  data: GlobalSearchData,
  query: string,
  limit = DEFAULT_RESULT_LIMIT
): GlobalSearchResults {
  return {
    items: searchRecords(
      data.items,
      query,
      (item) => item.title,
      (item) => `${item.title} ${item.type.name} ${item.preview}`,
      limit
    ),
    collections: searchRecords(
      data.collections,
      query,
      (collection) => collection.name,
      (collection) => `${collection.name} ${collection.preview}`,
      limit
    ),
  };
}
