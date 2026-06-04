export type CourseSourceLink = { title: string; url: string };

/** Pick sources most related to a module title; fall back to course-wide list. */
export function sourcesForSection(
  sectionTitle: string,
  allSources: CourseSourceLink[],
  limit = 4,
): CourseSourceLink[] {
  if (allSources.length === 0) return [];

  const words = sectionTitle
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3);

  if (words.length === 0) {
    return allSources.slice(0, limit);
  }

  const scored = allSources.map((source) => {
    const haystack = `${source.title} ${source.url}`.toLowerCase();
    const score = words.reduce(
      (acc, word) => (haystack.includes(word) ? acc + 1 : 0),
      0,
    );
    return { source, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((row) => row.score > 0).map((row) => row.source);

  if (matched.length > 0) {
    return matched.slice(0, limit);
  }

  return allSources.slice(0, limit);
}
