const EXACT_TRANSLATIONS: Record<string, string> = {
  'Assassination Time': 'Hora do Assassinato',
  'Baseball Time': 'Hora do Beisebol',
  'Karma Time': 'Hora do Karma',
  'Grown-Up Time': 'Hora de Crescer',
  'Assembly Time': 'Hora da Assembleia',
  'Test Time': 'Hora da Prova',
  'School Trip Time/1st Period': 'Excursao Escolar - 1o Periodo',
  'School Trip Time/2nd Period': 'Excursao Escolar - 2o Periodo',
  'Transfer Student Time': 'Hora do Aluno Transferido',
  'L and R Time': 'Hora do L e R',
};

const WORD_TRANSLATIONS: Array<[RegExp, string]> = [
  [/\b1st\b/gi, '1o'],
  [/\b2nd\b/gi, '2o'],
  [/\b3rd\b/gi, '3o'],
  [/\b4th\b/gi, '4o'],
  [/\bPeriod\b/gi, 'Periodo'],
  [/\bSchool Trip\b/gi, 'Excursao Escolar'],
  [/\bTransfer Student\b/gi, 'Aluno Transferido'],
  [/\bBaseball\b/gi, 'Beisebol'],
  [/\bAssembly\b/gi, 'Assembleia'],
  [/\bGrown-Up\b/gi, 'Crescer'],
  [/\bAssassination\b/gi, 'Assassinato'],
  [/\bTest\b/gi, 'Prova'],
  [/\bTime\b/gi, 'Hora'],
];

export function translateEpisodeTitle(title?: string | null, episode?: number) {
  const fallback = episode ? `Episodio ${episode.toString().padStart(2, '0')}` : 'Episodio';
  if (!title) return fallback;

  const cleaned = title
    .replace(/^Episode\s+\d+\s*[-:]\s*/i, '')
    .replace(/^Ep\s+\d+\s*[-:]\s*/i, '')
    .trim();

  if (!cleaned) return fallback;
  if (EXACT_TRANSLATIONS[cleaned]) return EXACT_TRANSLATIONS[cleaned];

  return WORD_TRANSLATIONS.reduce((value, [pattern, replacement]) => {
    return value.replace(pattern, replacement);
  }, cleaned).replace(/\s*\/\s*/g, ' / ');
}

export function formatEpisodeLabel(episode: number) {
  return `EP ${episode.toString().padStart(2, '0')}`;
}
