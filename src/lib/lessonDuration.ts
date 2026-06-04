/** ~140 WPM: paced educational speech (not rushed narration). */
export const EDUCATIONAL_SPEAKING_WPM = 140;

const MIN_MODULE_MINUTES = 4;

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countModuleSpeakableWords(slides: Array<{
  explanationText: string;
  points: string[];
}>): number {
  let total = 0;

  for (const slide of slides) {
    total += wordCount(slide.explanationText);
    for (const point of slide.points) {
      total += Math.round(wordCount(point) * 0.2);
    }
  }

  return total;
}

export function estimateModuleMinutes(wordCountTotal: number): number {
  if (wordCountTotal <= 0) return MIN_MODULE_MINUTES;
  return Math.max(MIN_MODULE_MINUTES, Math.ceil(wordCountTotal / EDUCATIONAL_SPEAKING_WPM));
}

export function formatLessonDuration(totalMinutes: number): string {
  if (totalMinutes <= 1) return "1 min";
  return `${totalMinutes} mins`;
}

export function estimateDurationFromSlides(
  slides: Array<{ explanationText: string; points: string[] }>,
): string {
  const words = countModuleSpeakableWords(slides);
  const minutes = estimateModuleMinutes(words);
  return formatLessonDuration(minutes);
}
