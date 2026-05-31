import React, { useState } from 'react';
import { Sparkles, Award, Megaphone, Search, X, Mic, Eye, Target } from 'lucide-react';
import { Show, UserProfile } from '../types';
import { SHOWS_DATA } from '../data';
import { useTranslation } from '../lib/translations';

interface HomeTabProps {
  currentUser?: UserProfile | null;
  onShowSelect: (show: Show) => void;
  onAnnounce: (msg: string) => void;
  highContrast: boolean;
  onSupportersSelect: () => void;
}

export default function HomeTab({ currentUser, onShowSelect, onAnnounce, highContrast, onSupportersSelect }: HomeTabProps) {
  const { t } = useTranslation();
  const [selectedGenre, setSelectedGenre] = useState('전체');
  const [isSupporterRegistered, setIsSupporterRegistered] = useState(() => {
    return localStorage.getItem('bypass_supporter_applied') === 'true';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  // Sync supporter applied status on mount
  React.useEffect(() => {
    const checkApplied = () => {
      setIsSupporterRegistered(localStorage.getItem('bypass_supporter_applied') === 'true');
    };
    checkApplied();
    window.addEventListener('storage', checkApplied);
    return () => {
      window.removeEventListener('storage', checkApplied);
    };
  }, []);

  const genres = ['전체', '뮤지컬', '연극', '콘서트'];

  const tagFilters = [
    { label: '휠체어 접근', tag: '휠체어석', icon: '♿', color: 'text-cyan-400' },
    { label: '자막 제공', tag: '자막제공', icon: '💬', color: 'text-cyan-400' },
    { label: '음성 해설', tag: '음성설명', icon: '🎙️', color: 'text-cyan-400' },
    { label: '수어 통역', tag: '수어통역', icon: '👁️', color: 'text-cyan-400' }
  ];

  // Curated personalized recommendations
  const personalizedShows = React.useMemo(() => {
    if (!currentUser) return [];
    const favGenres = currentUser.favoriteGenres || [];
    const reqSupports = currentUser.requiredSupports || [];

    if (favGenres.length === 0 && reqSupports.length === 0) return [];

    return SHOWS_DATA.map(show => {
      let score = 0;
      // Genre Match -> +50 points
      if (favGenres.includes(show.genre)) {
        score += 50;
      }
      
      // Accessibility Needs mappings -> +50 points per matching category tags
      const hasWheelMatch = reqSupports.includes("휠체어 접근 및 리프트") && 
        show.tags.some(t => ["휠체어석", "경사로통행", "휠체어동행"].includes(t));
      const hasHearingMatch = reqSupports.includes("청각 지원 자막/수어") && 
        show.tags.some(t => ["자막제공", "한국어자막", "문자안내", "스크린자막", "수어통역"].includes(t));
      const hasVisionMatch = reqSupports.includes("시각 음성해설/가이드") && 
        show.tags.some(t => ["음성해설", "음향증폭루프", "VR연동"].includes(t));

      if (hasWheelMatch) score += 50;
      if (hasHearingMatch) score += 50;
      if (hasVisionMatch) score += 50;

      return { show, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.show);
  }, [currentUser]);

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
    onAnnounce(t("예술 장르 필터를") + ` [${t(genre)}] ` + t("예술 군으로 성공적으로 재정합하였습니다."));
  };

  const handleTagFilterClick = (tag: string) => {
    if (selectedTagFilter === tag) {
      setSelectedTagFilter(null);
      onAnnounce(t("무장벽 태그 필터를 해제하여 전체 목록으로 원복하였습니다."));
    } else {
      setSelectedTagFilter(tag);
      onAnnounce(`[${t(tag)}]` + t("지원 가능 조건으로 공연을 필터링합니다."));
    }
  };

  const handleSupporterApply = () => {
    setIsSupporterRegistered(true);
    onAnnounce(t("403 바이패스 서포터즈 1기 참여 원서 접수가 완료되었습니다. 무장벽 가이드 뱃지가 마이페이지에 자동 배포됩니다."));
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
            placeholder={t("어떤 공연을 찾으시나요?")}
            className="w-full text-sm bg-transparent text-white focus:outline-none placeholder-slate-500 font-semibold pr-8"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                onAnnounce(t('검색 필터를 초기화해 전체 공연 목록으로 환원했습니다.'));
              }}
              className="absolute right-12 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button 
            onClick={() => onAnnounce(t("실시간 보행 음성 보이스 탐색 엔진을 로드하고 있습니다."))}
            className="p-1 px-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-all text-[#00E5FF] flex items-center justify-center shrink-0 cursor-pointer"
            title={t("음성 검색")}
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
              {t(g)}
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
              <span>{t(tf.label)}</span>
            </button>
          );
        })}
      </div>

      {/* 🎯 나를 위한 맞춤 추천 공연 (Only if user has favoriteGenres or requiredSupports list) */}
      {currentUser && ((currentUser.favoriteGenres && currentUser.favoriteGenres.length > 0) || (currentUser.requiredSupports && currentUser.requiredSupports.length > 0)) ? (
        <div className="space-y-3 bg-gradient-to-b from-[#131d35] to-[#0c1221] border border-cyan-500/25 rounded-2xl p-4.5 shadow-xl text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-cyan-300 tracking-wide uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-bounce-slow" />
              <span>{t("🎯 나를 위한 맞춤 공연 추천")}</span>
            </h3>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-extrabold border border-cyan-500/20">
              {t("최적 매칭 중")}
            </span>
          </div>

          {personalizedShows.length === 0 ? (
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-center">
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                {t("현재 등록하신 관심 장르와 지향 편의 수단 기준에 부합히 작동 예정된 무장벽 공연이 아직 없습니다. 선호 조건을 다른 조합으로 넓혀보세요!")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {personalizedShows.slice(0, 3).map((show) => {
                return (
                  <div
                    key={`curated-${show.id}`}
                    onClick={() => onShowSelect(show)}
                    className="flex bg-slate-950/60 hover:bg-slate-950 border border-cyan-500/10 hover:border-cyan-400/40 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer group active:scale-[0.99]"
                  >
                    <img
                      src={show.image}
                      alt={show.title}
                      className="w-14 h-14 object-cover filter brightness-95 shrink-0"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23131d35"/><text x="50%" y="54%" font-family="sans-serif" font-size="9" fill="%2300E5FF" font-weight="bold" text-anchor="middle" dominant-baseline="middle">THEATER</text></svg>`;
                      }}
                    />
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <div className="space-y-0.5 flex flex-col">
                        <div className="flex justify-between items-center text-[8px] font-bold text-slate-400">
                          <span className="bg-cyan-950/40 text-cyan-400 px-1.5 py-0.2 rounded border border-cyan-900/40">
                            {t(show.genre)}
                          </span>
                          <span className="truncate max-w-[180px] font-mono text-slate-500">{show.facility}</span>
                        </div>
                        <h4 className="text-[11px] font-black text-white group-hover:text-[#00E5FF] line-clamp-1 leading-snug transition-colors">
                          {show.title}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between text-[8px] pt-1 border-t border-slate-900/80">
                        <span className="text-emerald-400 font-bold truncate max-w-[160px]">
                          💡 Match: {show.tags.filter(t_tag => 
                            (currentUser.requiredSupports || []).some(req => 
                              (req === "휠체어 접근 및 리프트" && ["휠체어석", "경사로통행", "휠체어동행"].includes(t_tag)) ||
                              (req === "청각 지원 자막/수어" && ["자막제공", "한국어자막", "문자안내", "스크린자막", "수어통역"].includes(t_tag)) ||
                              (req === "시각 음성해설/가이드" && ["음성해설", "음향증폭루프", "VR연동"].includes(t_tag))
                            )
                          ).map(x => t(x)).join(', ') || t('전체 배리어프리 최적')}
                        </span>
                        <span className="font-extrabold text-[#00E5FF] shrink-0">{t("무벽지수")} {show.score}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* Active Performance Cards Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-300 tracking-wide uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#00E5FF]" />
            {t("맞춤 장애인 지원 완비 공연 목록")}
          </h3>
          <span className="text-[10px] text-slate-500 font-bold count-badge">
            {filteredShows.length} {t("개 매칭")}
          </span>
        </div>

        <div className="space-y-3">
          {filteredShows.length === 0 ? (
            <div className="bg-[#121214] border border-[#212124] rounded-2xl p-8 text-center text-slate-500">
              <p className="text-xs font-bold">{t("선택하신 조건에 부합하는 공연정보가 없습니다.")}</p>
              <button 
                onClick={() => {
                  setSelectedGenre('전체');
                  setSelectedTagFilter(null);
                  setSearchQuery('');
                }}
                className="text-[10px] text-[#00E5FF] mt-2 underline font-bold cursor-pointer"
              >
                {t("전체 조건으로 필터 리셋")}
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
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23131d35"/><text x="50%" y="54%" font-family="sans-serif" font-size="8" fill="%2300E5FF" font-weight="bold" text-anchor="middle" dominant-baseline="middle">THEATER</text></svg>`;
                      }}
                    />
                    <div className="p-3 flex-1 flex flex-col justify-between text-left">
                      <div className="space-y-0.5">
                        <div className="flex justify-between items-start gap-1">
                          <span className="inline-flex items-center text-[7px] bg-[#00E5FF]/10 text-[#00E5FF] font-bold px-1.5 py-0.5 rounded-full border border-[#00E5FF]/20">
                            {t(show.genre)}
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
                          {show.tags.map((tag_item, idx) => {
                            const isCurrentTagActive = selectedTagFilter === tag_item;
                            return (
                              <span
                                key={idx}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-tight border capitalize ${
                                  isCurrentTagActive 
                                    ? 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30' 
                                    : 'bg-slate-800 text-slate-300 border-slate-700/50'
                                }`}
                              >
                                {t(tag_item)}
                              </span>
                            );
                          })}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[8px] text-slate-500 block uppercase font-mono tracking-widest hc-text-mute">
                            {t("무벽안심지수")}
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
      <div 
        onClick={onSupportersSelect}
        className="rounded-[2rem] bg-[#00E5FF] p-6 text-black relative overflow-hidden shadow-2xl flex flex-col justify-between aspect-[1.4/1] text-left cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all"
      >
        
        {/* Subtle abstract background eye icon tracing */}
        <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-12 translate-y-12">
          <Eye className="w-56 h-56 text-[#009cb0]" strokeWidth={2.5} referrerPolicy="no-referrer" />
        </div>

        {/* Top tag badge */}
        <div>
          <span className="inline-block px-3 py-1 bg-black text-[#00E5FF] text-[10px] font-black rounded-lg uppercase tracking-wider mb-4">
            {t("공식 홍보대사")}
          </span>
          
          {/* Main big display block */}
          <div className="space-y-1.5">
            <h2 className="text-[26px] font-black tracking-tight leading-none text-black font-sans">
              {t("403 서포터즈")}
            </h2>
            <h2 className="text-[26px] font-black tracking-tight leading-none text-black font-sans">
              {t("1기 대모집!")}
            </h2>
            <p className="text-xs text-black/80 font-bold leading-normal font-sans pt-1">
              {t("배리어 프리를 넘어 유니버설 디자인으로. 장벽 없는 공연 문화를 함께 만들 활동가를 찾습니다.")}
            </p>
          </div>
        </div>

        {/* Action interactive button shape */}
        <div className="pt-4 relative z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSupportersSelect();
            }}
            className={`px-5 py-1.5 rounded-full text-xs font-black tracking-tight transition-all border-2 border-black inline-flex items-center gap-1.5 cursor-pointer ${
              isSupporterRegistered
                ? 'bg-black text-[#00E5FF]'
                : 'bg-transparent text-black hover:bg-black/10'
            }`}
          >
            {isSupporterRegistered ? (
              <>
                <span>{t("지원서 확인 / 수정 ♿")}</span>
              </>
            ) : (
              <>
                <span>{t("지원하기")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
