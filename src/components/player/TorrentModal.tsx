'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TorrentResult {
  title: string;
  magnet: string;
  size: string;
  seeders: number;
  leechers: number;
  source?: string;
  date?: string;
  uploader?: string;
  audio?: string[];
  subs?: string[];
}

const LANG_MAP: Record<string, { name: string, code: string }> = {
  'pt': { name: 'Português (Brasil)', code: 'br' },
  'pt-br': { name: 'Português (Brasil)', code: 'br' },
  'br': { name: 'Português (Brasil)', code: 'br' },
  'portuguese (brazil)': { name: 'Português (Brasil)', code: 'br' },
  'portuguese': { name: 'Português', code: 'pt' },
  'en': { name: 'English', code: 'us' },
  'eng': { name: 'English', code: 'us' },
  'us': { name: 'English (US)', code: 'us' },
  'english': { name: 'English', code: 'us' },
  'es': { name: 'Español', code: 'es' },
  'spa': { name: 'Español', code: 'es' },
  'sa': { name: 'Español (Latam)', code: 'mx' },
  'spanish (latin american)': { name: 'Español (Latam)', code: 'mx' },
  'spanish (spain)': { name: 'Español (Espanha)', code: 'es' },
  'spanish': { name: 'Español', code: 'es' },
  'jp': { name: 'Japanese', code: 'jp' },
  'jap': { name: 'Japanese', code: 'jp' },
  'ja': { name: 'Japanese', code: 'jp' },
  'japanese': { name: 'Japanese', code: 'jp' },
  'zh': { name: 'Chinese', code: 'cn' },
  'chinese': { name: 'Chinese', code: 'cn' },
  'ru': { name: 'Russian', code: 'ru' },
  'russian': { name: 'Russian', code: 'ru' },
  'fr': { name: 'French', code: 'fr' },
  'french': { name: 'French', code: 'fr' },
  'de': { name: 'German', code: 'de' },
  'german': { name: 'German', code: 'de' },
  'it': { name: 'Italian', code: 'it' },
  'italian': { name: 'Italian', code: 'it' },
  'ar': { name: 'Arabic', code: 'sa' },
  'arabic': { name: 'Arabic', code: 'sa' },
  'id': { name: 'Indonesian', code: 'id' },
  'indonesian': { name: 'Indonesian', code: 'id' },
  'kr': { name: 'Korean', code: 'kr' },
  'korean': { name: 'Korean', code: 'kr' },
  'th': { name: 'Thai', code: 'th' },
  'thai': { name: 'Thai', code: 'th' }
};

function parseLanguagesFromTitle(title: string) {
  let audio: string[] = [];
  let subs: string[] = [];
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('dublado') || lowerTitle.includes('pt-br') || lowerTitle.includes('[pt-br]')) {
    audio.push('pt');
  }
  if (lowerTitle.includes('dual-audio') || lowerTitle.includes('dual audio')) {
    audio.push('jp', 'pt');
  }
  if (lowerTitle.includes('multi-audio') || lowerTitle.includes('multi')) {
    audio.push('jp', 'en', 'pt', 'es');
  }

  if (lowerTitle.includes('legendado') || lowerTitle.includes('sub') || lowerTitle.includes('multi-subs')) {
    subs.push('pt');
  }

  if (audio.length === 0) audio.push('jp');
  if (subs.length === 0 && !lowerTitle.includes('raw')) subs.push('pt');

  return { audio: Array.from(new Set(audio)), subs: Array.from(new Set(subs)) };
}

interface TorrentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuery: string;
  onSelectMagnet: (magnetUrl: string) => void;
  animeTitles?: {
    romaji?: string;
    english?: string;
    native?: string;
    currentEp?: number;
  };
}

export default function TorrentModal({ isOpen, onClose, defaultQuery, onSelectMagnet, animeTitles }: TorrentModalProps) {
  const [query, setQuery] = useState('');
  const [isDublado, setIsDublado] = useState(false);
  const [results, setResults] = useState<TorrentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchNyaa = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Se estiver buscando dublado, usa a categoria 1_0 (Todos) e adiciona os termos amplos
      const searchCategory = isDublado ? '1_0' : '1_2';

      let queries = [searchQuery];
      if (isDublado && !searchQuery.toLowerCase().match(/(dublado|pt-br|multi-audio|dual-audio|multi)/)) {
        queries = [
          `${searchQuery} PT-BR`,
          `${searchQuery} Dublado`,
          `${searchQuery} Dual-Audio`,
          `${searchQuery} Multi-Audio`,
          `${searchQuery} MULTi`
        ];
      }

      const fetchPromises: Promise<any>[] = [];
      queries.forEach(q => {
        fetchPromises.push(fetch(`/api/nyaa?q=${encodeURIComponent(q)}&c=${searchCategory}`).then(r => r.json()));
        fetchPromises.push(fetch(`/api/animetosho?q=${encodeURIComponent(q)}`).then(r => r.json()));
        fetchPromises.push(fetch(`/api/nekobt?q=${encodeURIComponent(q)}`).then(r => r.json()));
      });

      const allResponses = await Promise.all(fetchPromises);

      let combinedResults: TorrentResult[] = [];
      let hasError = false;
      let errorMessage = '';

      allResponses.forEach(data => {
        if (data.error) {
          hasError = true;
          errorMessage = data.error;
        }
        if (data.results) {
          // Fallback para title parsing se a API não retornar
          const enrichedResults = data.results.map((r: TorrentResult) => {
            if (!r.audio || !r.subs) {
              const { audio, subs } = parseLanguagesFromTitle(r.title);
              if (!r.audio) r.audio = audio;
              if (!r.subs) r.subs = subs;
            }
            return r;
          });
          combinedResults = [...combinedResults, ...enrichedResults];
        }
      });

      if (hasError && combinedResults.length === 0) {
        throw new Error(errorMessage || 'Erro ao buscar no Nyaa');
      }

      // Remover duplicatas baseadas no magnet link
      const uniqueResults = Array.from(
        new Map(combinedResults.map(item => [item.magnet, item])).values()
      );

      // Ordenar resultados:
      // 1. Áudio PT-BR primeiro
      // 2. Outros idiomas (Inglês, Espanhol, etc) em segundo
      // 3. Maior número de seeders como desempate final
      uniqueResults.sort((a, b) => {
        const hasPT = (t: TorrentResult) => t.audio?.some(lang =>
          ['pt', 'pt-br', 'br', 'portuguese', 'portuguese (brazil)'].includes(lang.toLowerCase())
        ) || false;

        const hasOtherDub = (t: TorrentResult) => t.audio?.some(lang =>
          !['jp', 'japanese', 'ja', 'jap'].includes(lang.toLowerCase())
        ) || false;

        const aPT = hasPT(a);
        const bPT = hasPT(b);

        if (aPT && !bPT) return -1;
        if (!aPT && bPT) return 1;

        const aOther = hasOtherDub(a);
        const bOther = hasOtherDub(b);

        if (aOther && !bOther) return -1;
        if (!aOther && bOther) return 1;

        // Desempate por número de seeders
        return b.seeders - a.seeders;
      });

      setResults(uniqueResults);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && defaultQuery) {
      setQuery(defaultQuery);
      searchNyaa(defaultQuery);
    }
  }, [isOpen, defaultQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <i className="fa-solid fa-magnet text-blue-500"></i> Buscar Torrent (Nyaa & NekoBT)
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-slate-800 bg-slate-950">
            <form
              onSubmit={(e) => { e.preventDefault(); searchNyaa(query); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 min-w-0"
                placeholder="Ex: Jujutsu Kaisen 05"
              />

              <button
                type="button"
                onClick={() => setIsDublado(!isDublado)}
                className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all border ${isDublado
                    ? 'bg-purple-600/20 text-purple-400 border-purple-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                title={isDublado ? 'Buscando animes Dublados (PT-BR)' : 'Buscando animes Originais (Inglês)'}
              >
                <i className={`fa-solid ${isDublado ? 'fa-microphone' : 'fa-language'}`}></i>
                <span className="hidden sm:inline">{isDublado ? 'Dublado / PT-BR' : 'Original / Inglês'}</span>
                <span className="sm:hidden">{isDublado ? 'PT-BR' : 'ING'}</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <><span className="hidden sm:inline">Buscar</span><i className="fa-solid fa-search sm:hidden"></i></>}
              </button>
            </form>

            {/* Chips de Títulos Alternativos */}
            {animeTitles && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-1">Títulos:</span>

                {animeTitles.romaji && (
                  <button
                    onClick={() => {
                      const q = `${animeTitles.romaji} ${animeTitles.currentEp?.toString().padStart(2, '0')}`;
                      setQuery(q);
                      searchNyaa(q);
                    }}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/30 rounded text-[10px] text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    Romaji
                  </button>
                )}

                {animeTitles.english && (
                  <button
                    onClick={() => {
                      const q = `${animeTitles.english} ${animeTitles.currentEp?.toString().padStart(2, '0')}`;
                      setQuery(q);
                      searchNyaa(q);
                    }}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/30 rounded text-[10px] text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    Inglês
                  </button>
                )}

                {animeTitles.native && (
                  <button
                    onClick={() => {
                      const q = `${animeTitles.native} ${animeTitles.currentEp?.toString().padStart(2, '0')}`;
                      setQuery(q);
                      searchNyaa(q);
                    }}
                    className="px-2 py-1 bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/30 rounded text-[10px] text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    Original
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-center mb-4">
                {error}
              </div>
            )}

            {!loading && !error && results.length === 0 && query && (
              <div className="text-center text-slate-500 py-10">
                Nenhum torrent encontrado para "{query}". Tente usar o nome em Inglês ou Romaji (ex: SubsPlease Jujutsu).
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="flex flex-col gap-2">
                {results.map((torrent, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectMagnet(torrent.magnet);
                      onClose();
                    }}
                    className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-blue-500/50 p-4 rounded-xl cursor-pointer transition-all group flex flex-col gap-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Linha superior: Fonte e Data */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-medium text-slate-200 group-hover:text-blue-400 line-clamp-2 leading-snug flex-1">
                        {torrent.title}
                      </h3>
                      {torrent.source && (
                        <span className={`flex items-center gap-1 font-black px-2 py-0.5 text-[9px] uppercase tracking-widest rounded border flex-shrink-0 ${torrent.source === 'NekoBT' ? 'text-pink-400 bg-pink-500/10 border-pink-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                          }`}>
                          <i className="fa-solid fa-database"></i> {torrent.source}
                        </span>
                      )}
                    </div>

                    {/* Linha do Meio: Bandeiras */}
                    <div className="flex flex-wrap gap-2">
                      {torrent.audio && torrent.audio.length > 0 && (
                        <div className="flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded-md border border-white/5" title="Idiomas de Áudio">
                          <i className="fa-solid fa-microphone text-[10px] text-slate-500 mr-1"></i>
                          {torrent.audio.map(l => {
                            const mapped = LANG_MAP[l.toLowerCase()];
                            return (
                              <span key={`audio-${l}`} title={mapped?.name || l} className="inline-block drop-shadow-md shrink-0">
                                {mapped?.code ? (
                                  <img
                                    src={`https://flagcdn.com/w20/${mapped.code}.png`}
                                    srcSet={`https://flagcdn.com/w40/${mapped.code}.png 2x`}
                                    alt={mapped.name}
                                    className="w-[16px] h-[12px] rounded-sm object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] font-bold bg-slate-800 px-1 rounded text-slate-300 border border-slate-700">{l.length <= 2 ? l.toUpperCase() : '🏳️'}</span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {torrent.subs && torrent.subs.length > 0 && (
                        <div className="flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded-md border border-white/5" title="Idiomas de Legenda">
                          <i className="fa-solid fa-closed-captioning text-[10px] text-slate-500 mr-1"></i>
                          {torrent.subs.map(l => {
                            const mapped = LANG_MAP[l.toLowerCase()];
                            return (
                              <span key={`sub-${l}`} title={mapped?.name || l} className="inline-block drop-shadow-md shrink-0">
                                {mapped?.code ? (
                                  <img
                                    src={`https://flagcdn.com/w20/${mapped.code}.png`}
                                    srcSet={`https://flagcdn.com/w40/${mapped.code}.png 2x`}
                                    alt={mapped.name}
                                    className="w-[16px] h-[12px] rounded-sm object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] font-bold bg-slate-800 px-1 rounded text-slate-300 border border-slate-700">{l.length <= 2 ? l.toUpperCase() : '🏳️'}</span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Linha Inferior: Metadados (Peers, Data, Uploader) */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold mt-1 border-t border-white/5 pt-2">
                      <span className="text-green-400 flex items-center gap-1" title="Seeders (Uploaders)">
                        <i className="fa-solid fa-arrow-up"></i> {torrent.seeders}
                      </span>
                      <span className="text-red-400 flex items-center gap-1" title="Leechers (Downloaders)">
                        <i className="fa-solid fa-arrow-down"></i> {torrent.leechers}
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <i className="fa-solid fa-hard-drive"></i> {torrent.size}
                      </span>

                      {torrent.uploader && (
                        <span className="text-slate-400 flex items-center gap-1 ml-auto">
                          <i className="fa-solid fa-user text-slate-500"></i> {torrent.uploader}
                        </span>
                      )}

                      {torrent.date && (
                        <span className="text-slate-500 flex items-center gap-1">
                          <i className="fa-solid fa-calendar text-slate-600"></i>
                          {new Date(torrent.date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex flex-col justify-center items-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest animate-pulse">
                  Buscando no Nyaa.si...
                </p>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-900 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-500">
              A reprodução usa o serviço gratuito do Webtor.io. Torrents com poucos seeders (<span className="text-green-400 font-bold">↑</span>) podem demorar para carregar.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
