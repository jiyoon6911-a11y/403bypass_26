import React, { useState } from 'react';
import { Sparkles, Award, Megaphone, Search, X, Mic, Eye } from 'lucide-react';
import { Show } from '../types';
import { SHOWS_DATA } from '../data';

interface HomeTabProps {
  onShowSelect: (show: Show) => void;
  onAnnounce: (msg: string) => void;
  highContrast: boolean;
}

export default function HomeTab({ onShowSelect, onAnnounce, highContrast }: HomeTabProps) {
  const [selectedGenre, setSelectedGenre] = useState('전체');
  const [isSupporterRegistered, setIsSupporterRegistered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  const genres = ['전체', '뮤지컬', '연극', '콘서트'];

  const tagFilters = [
    { label: '휠체어 접근', tag: '휠체어석', icon: '♿', color: 'text-cyan-400' },
    { label: '자막 제공', tag: '자막제공', icon: '💬', color: 'text-cyan-400' },
    { label: '음성 해설', tag: '음성설명', icon: '🎙️', color: 'text-cyan-400' },
    { label: '수어 통역', tag: '수어통역', icon: '👁️', color: 'text-cyan-400' }
  ];

  const filteredShows = SHOWS_DATA.filter(show => {
    // 1. Genre filter
    const matchesGenre = selectedGenre === '전체' || show.genre === selectedGenre;
    
    // 2. Barrier-free tag filter
    const matchesTag = !selectedTagFilter || show.tags.includes(selectedTagFilter);

    // 3. Search query filter
    const lowerQuery = searchQuery.trim().toLowerCase();
    if (!lowerQuery) return matchesGenre && matchesTag;

    const matchesSearch = 
      show.title.toLowerCase().includes(lowerQuery) ||
      show.facility.toLowerCase().includes(lowerQuery) ||
      show.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      show.genre.toLowerCase().includes(lowerQuery);

    return matchesGenre && matchesTag && matchesSearch;
  });

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    onAnnounce(`예술 장르 필터를 [${genre}] 예술 군으로 성공적으로 재정합하였습니다.`);
  };

  const handleTagFilterClick = (tag: string) => {
    if (selectedTagFilter === tag) {
      setSelectedTagFilter(null);
      onAnnounce("무장벽 태그 필터를 해제하여 전체 목록으로 원복하였습니다.");
    } else {
      setSelectedTagFilter(tag);
      onAnnounce(`[${tag}] 지원 가능 조건으로 공연을 필터링합니다.`);
    }
  };

  const handleSupporterApply = () => {
    setIsSupporterRegistered(true);
    onAnnounce("403 바이패스 서포터즈 1기 참여 원서 접수가 완료되었습니다. 무장벽 가이드 뱃지가 마이페이지에 자동 배포됩니다.");
  };

  return (
    <div className="space-y-5">
      
      {/* 2. Modern Search bar - Styled exactly as the mockup screenshot */}
      <div className="relative pt-1">
        <div className="relative flex items-center bg-[#121214] border border-[#212124] rounded-3xl px-4 py-2 shadow-lg w-full">
          <Search className="w-5 h-5 text-[#00E5FF] mr-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="어떤 공연을 찾으시나요?"
            className="w-full text-sm bg-transparent text-white focus:outline-none placeholder-slate-500 font-semibold pr-8"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                onAnnounce('검색 필터를 초기화해 전체 공연 목록으로 환원했습니다.');
              }}
              className="absolute right-12 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button 
            onClick={() => onAnnounce("실시간 보행 음성 보이스 탐색 엔진을 로드하고 있습니다.")}
            className="p-1 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-all text-[#00E5FF] flex items-center justify-center shrink-0 cursor-pointer"
            title="음성 검색"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Genre Selection Grid - Category pills styled exactly as the mockup screenshot */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {genres.map((g) => {
          const isSelected = selectedGenre === g;
          return (
            <button
              key={g}
              onClick={() => handleGenreClick(g)}
              className={`py-2 px-6 rounded-2xl text-xs font-black tracking-tight transition-all text-center whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-lg shadow-[#00E5FF]/20'
                  : 'border-[#212124] bg-[#121214] text-slate-350 hover:bg-[#1c1c20]'
              }`}
            >
              {g}
            </button>
          );
        })}
      </div>

      {/* 2.5 Quick Accessibility filter pill row - matching mockup row perfectly */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {tagFilters.map((tf) => {
          const isSelected = selectedTagFilter === tf.tag;
          return (
            <button
              key={tf.tag}
              onClick={() => handleTagFilterClick(tf.tag)}
              className={`py-2 px-3.5 rounded-xl text-[10.5px] font-bold tracking-tight transition-all flex items-center gap-1.5 border whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-blue-950/80 text-[#00E5FF] border-[#00E5FF]'
                  : 'bg-[#121214] text-slate-300 border-[#1a1a1d] hover:bg-[#1a1a1d]'
              }`}
            >
              <span className={`text-xs ${tf.color}`}>{tf.icon}</span>
              <span>{tf.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Performance Cards Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-300 tracking-wide uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#00E5FF]" />
            맞춤 장애인 지원 완비 공연 목록
          </h3>
          <span className="text-[10px] text-slate-500 font-bold count-badge">
            {filteredShows.length}개 매칭
          </span>
        </div>

        <div className="space-y-3">
          {filteredShows.length === 0 ? (
            <div className="bg-[#121214] border border-[#212124] rounded-2xl p-8 text-center text-slate-500">
              <p className="text-xs font-bold">선택하신 조건에 부합하는 공연정보가 없습니다.</p>
              <button 
                onClick={() => {
                  setSelectedGenre('전체');
                  setSelectedTagFilter(null);
                  setSearchQuery('');
                }}
                className="text-[10px] text-[#00E5FF] mt-2 underline font-bold cursor-pointer"
              >
                전체 조건으로 필터 리셋
              </button>
            </div>
          ) : (
            filteredShows.map((show) => {
              const indexColorClass = show.score >= 90
                ? 'text-emerald-400 animate-pulse'
                : show.score >= 60
                ? 'text-[#00E5FF]'
                : 'text-amber-400';

              return (
                <div
                  key={show.id}
                  className="bg-[#121214] border border-[#212124] rounded-2xl overflow-hidden flex flex-col hover:border-[#303036] transition-all shadow-md active:scale-[0.99]"
                >
                  <div className="flex">
                    <img
                      src={show.image}
                      alt={show.title}
                      className="w-24 h-24 object-cover filter brightness-95 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="p-3 flex-1 flex flex-col justify-between text-left">
                      <div className="space-y-0.5">
                        <div className="flex justify-between items-start gap-1">
                          <span className="inline-flex items-center text-[7px] bg-[#00E5FF]/10 text-[#00E5FF] font-bold px-1.5 py-0.5 rounded-full border border-[#00E5FF]/20">
                            {show.genre}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 truncate max-w-[140px]">{show.facility}</span>
                        </div>
                        <h4
                          onClick={() => onShowSelect(show)}
                          className="text-xs font-black text-white hover:text-[#00E5FF] cursor-pointer line-clamp-1 leading-snug transition-colors"
                        >
                          {show.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-wrap gap-1">
                          {show.tags.map((t, idx) => {
                            const isCurrentTagActive = selectedTagFilter === t;
                            return (
                              <span
                                key={idx}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-tight border capitalize ${
                                  isCurrentTagActive 
                                    ? 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30' 
                                    : 'bg-[#1a1a1d] text-slate-300 border-[#222226]'
                                }`}
                              >
                                {t}
                              </span>
                            );
                          })}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[8px] text-slate-500 block uppercase font-mono tracking-widest hc-text-mute">
                            무벽안심지수
                          </span>
                          <span className={`text-xs font-black ${indexColorClass}`}>
                            {show.score}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Hero Banner - Overridden and styled precisely matching the stunning Cyan Supporter Recruitment Billboard in mockup */}
      <div className="rounded-[2rem] bg-[#00E5FF] p-6 text-black relative overflow-hidden shadow-2xl flex flex-col justify-between aspect-[1.4/1] text-left">
        
        {/* Subtle abstract background eye icon tracing */}
        <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-12 translate-y-12">
          <Eye className="w-56 h-56 text-[#009cb0]" strokeWidth={2.5} referrerPolicy="no-referrer" />
        </div>

        {/* Top tag badge */}
        <div>
          <span className="inline-block px-3 py-1 bg-black text-[#00E5FF] text-[10px] font-black rounded-lg uppercase tracking-wider mb-4">
            공식 홍보대사
          </span>
          
          {/* Main big display block */}
          <div className="space-y-1.5">
            <h2 className="text-[26px] font-black tracking-tight leading-none text-black font-sans">
              403 서포터즈
            </h2>
            <h2 className="text-[26px] font-black tracking-tight leading-none text-black font-sans">
              1기 대모집!
            </h2>
            <p className="text-xs text-black/80 font-bold leading-normal font-sans pt-1">
              접근성 리뷰하고 리워드 받자
            </p>
          </div>
        </div>

        {/* Action interactive button shape */}
        <div className="pt-4 relative z-10">
          <button
            onClick={handleSupporterApply}
            disabled={isSupporterRegistered}
            className={`px-5 py-1.5 rounded-full text-xs font-black tracking-tight transition-all border-2 border-black inline-flex items-center gap-1.5 cursor-pointer ${
              isSupporterRegistered
                ? 'bg-black text-[#00E5FF]'
                : 'bg-transparent text-black hover:bg-black/10'
            }`}
          >
            {isSupporterRegistered ? (
              <>
                <span>지원완료 ♿</span>
              </>
            ) : (
              <>
                <span>지원하기</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
