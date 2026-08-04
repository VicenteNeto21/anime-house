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

const LANG_MAP: Record<string, { name: string, flag: React.ReactNode }> = {
  'pt': { name: 'Português (Brasil)', flag: <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'pt-br': { name: 'Português (Brasil)', flag: <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'br': { name: 'Português (Brasil)', flag: <img src="https://flagcdn.com/w20/br.png" alt="BR" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'en': { name: 'English', flag: <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'eng': { name: 'English', flag: <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'es': { name: 'Español', flag: <img src="https://flagcdn.com/w20/es.png" alt="ES" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'spa': { name: 'Español', flag: <img src="https://flagcdn.com/w20/es.png" alt="ES" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'jp': { name: 'Japanese', flag: <img src="https://flagcdn.com/w20/jp.png" alt="JP" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'jap': { name: 'Japanese', flag: <img src="https://flagcdn.com/w20/jp.png" alt="JP" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'ja': { name: 'Japanese', flag: <img src="https://flagcdn.com/w20/jp.png" alt="JP" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'zh': { name: 'Chinese', flag: <img src="https://flagcdn.com/w20/cn.png" alt="CN" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'ru': { name: 'Russian', flag: <img src="https://flagcdn.com/w20/ru.png" alt="RU" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'fr': { name: 'French', flag: <img src="https://flagcdn.com/w20/fr.png" alt="FR" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'de': { name: 'German', flag: <img src="https://flagcdn.com/w20/de.png" alt="DE" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'it': { name: 'Italian', flag: <img src="https://flagcdn.com/w20/it.png" alt="IT" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'ar': { name: 'Arabic', flag: <img src="https://flagcdn.com/w20/sa.png" alt="SA" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
  'id': { name: 'Indonesian', flag: <img src="https://flagcdn.com/w20/id.png" alt="ID" className="w-3.5 h-2.5 rounded-sm object-cover inline-block" /> },
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
  animeTitles?: { english?: string; romaji?: string; native?: string };
  currentEp?: number;
}

export default function TorrentModal({ isOpen, onClose, defaultQuery, onSelectMagnet, animeTitles, currentEp }: TorrentModalProps) {
  const [query, setQuery] = useState('');
  const [audioType, setAudioType] = useState<'RAW' | 'DUB' | 'MULTI'>('RAW');
  const [results, setResults] = useState<TorrentResult[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchNyaa = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // RAW/LEG usa categoria 1_2 (English-translated), DUB e MULTI usam 1_0 (Todos) pois podem estar em RAW ou Non-English
      const searchCategory = audioType === 'RAW' ? '1_2' : '1_0';
      
      let queries = [searchQuery];
      if (audioType === 'DUB' && !searchQuery.toLowerCase().match(/(dublado|pt-br)/)) {
        queries = [
          `${searchQuery} PT-BR`,
          `${searchQuery} Dublado`
        ];
      } else if (audioType === 'MULTI' && !searchQuery.toLowerCase().match(/(multi-audio|dual-audio|multi)/)) {
        queries = [
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
        fetchPromises.push(fetch(`/api/tokyotoshokan?q=${encodeURIComponent(q)}`).then(r => r.json()));
        fetchPromises.push(fetch(`/api/piratebay?q=${encodeURIComponent(q)}`).then(r => r.json()));
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

      // Ordenar por seeders (maior para menor)
      uniqueResults.sort((a, b) => b.seeders - a.seeders);

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
              <i className="fa-solid fa-magnet text-blue-500"></i> Buscar Torrent
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
              
              <div className="flex gap-1 border border-slate-700 bg-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setAudioType('RAW')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                    audioType === 'RAW' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                  }`}
                  title="Apenas Legendado (Inglês/Originais)"
                >
                  <i className="fa-solid fa-language sm:mr-1"></i>
                  <span className="hidden sm:inline">Leg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAudioType('DUB')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                    audioType === 'DUB' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                  }`}
                  title="Apenas Dublados em PT-BR"
                >
                  <i className="fa-solid fa-microphone sm:mr-1"></i>
                  <span className="hidden sm:inline">Dub</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAudioType('MULTI')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                    audioType === 'MULTI' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                  }`}
                  title="Dual-Audio ou Multi-Audio"
                >
                  <i className="fa-solid fa-layer-group sm:mr-1"></i>
                  <span className="hidden sm:inline">Multi</span>
                </button>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 flex-shrink-0"
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <><span className="hidden sm:inline">Buscar</span><i className="fa-solid fa-search sm:hidden"></i></>}
              </button>
            </form>
          </div>

          {/* Quick Language Search Buttons */}
          {animeTitles && (
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Pesquisa rápida:</span>
              
              {animeTitles.english && (
                <button 
                  onClick={() => {
                    const newQuery = `${animeTitles.english} ${currentEp?.toString().padStart(2, '0')}`;
                    setQuery(newQuery);
                    searchNyaa(newQuery);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/50 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                  title={animeTitles.english}
                >
                  <img src="https://flagcdn.com/w20/us.png" alt="US" className="w-4 h-3 rounded-sm object-cover" /> Inglês
                </button>
              )}
              
              {animeTitles.romaji && (
                <button 
                  onClick={() => {
                    const newQuery = `${animeTitles.romaji} ${currentEp?.toString().padStart(2, '0')}`;
                    setQuery(newQuery);
                    searchNyaa(newQuery);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/50 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                  title={animeTitles.romaji}
                >
                  <i className="fa-solid fa-language text-blue-400 text-xs"></i> Romaji
                </button>
              )}

              {animeTitles.native && (
                <button 
                  onClick={() => {
                    const newQuery = `${animeTitles.native} ${currentEp?.toString().padStart(2, '0')}`;
                    setQuery(newQuery);
                    searchNyaa(newQuery);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/50 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                  title={animeTitles.native}
                >
                  <img src="https://flagcdn.com/w20/jp.png" alt="JP" className="w-4 h-3 rounded-sm object-cover" /> Original
                </button>
              )}
            </div>
          )}

          {/* Source Filter Buttons */}
          {!loading && !error && results.length > 0 && (
            <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/30 flex gap-2 overflow-x-auto custom-scrollbar">
              {['ALL', 'NYAA', 'NEKOBT', 'ANIMETOSHO', 'TOKYOTOSHOKAN', 'PIRATEBAY'].map((source) => (
                <button
                  key={source}
                  onClick={() => setSourceFilter(source)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    sourceFilter === source
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {source === 'ALL' ? 'Todas as Fontes' : source}
                </button>
              ))}
            </div>
          )}

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
                {results.filter(r => sourceFilter === 'ALL' || r.source?.toUpperCase() === sourceFilter).map((torrent, idx) => (
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
                        <span className={`flex items-center gap-1 font-black px-2 py-0.5 text-[9px] uppercase tracking-widest rounded border flex-shrink-0 ${
                          torrent.source === 'NekoBT' ? 'text-pink-400 bg-pink-500/10 border-pink-500/20' 
                          : torrent.source === 'TokyoToshokan' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                          : torrent.source === 'PirateBay' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                          : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <i className="fa-solid fa-database"></i> {torrent.source}
                        </span>
                      )}
                    </div>

                    {/* Linha do Meio: Bandeiras */}
                    <div className="flex flex-wrap gap-2">
                      {torrent.audio && torrent.audio.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1 rounded-md border border-white/5" title="Idiomas de Áudio">
                          <i className="fa-solid fa-microphone text-[10px] text-slate-500 mr-1"></i>
                          {torrent.audio.map(l => (
                            <span key={`audio-${l}`} title={LANG_MAP[l.toLowerCase()]?.name || l} className="flex items-center drop-shadow-md">
                              {LANG_MAP[l.toLowerCase()]?.flag || <i className="fa-solid fa-flag text-slate-500 text-[10px]"></i>}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {torrent.subs && torrent.subs.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-1 rounded-md border border-white/5" title="Idiomas de Legenda">
                          <i className="fa-solid fa-closed-captioning text-[10px] text-slate-500 mr-1"></i>
                          {torrent.subs.map(l => (
                            <span key={`sub-${l}`} title={LANG_MAP[l.toLowerCase()]?.name || l} className="flex items-center drop-shadow-md">
                              {LANG_MAP[l.toLowerCase()]?.flag || <i className="fa-solid fa-flag text-slate-500 text-[10px]"></i>}
                            </span>
                          ))}
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
