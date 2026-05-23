import React, { useState } from 'react';
import { Sparkles, Award, Megaphone, Search, X } from 'lucide-react';
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

  const genres = ['전체', '연극', '뮤지컬', '콘서트'];

  const filteredShows = SHOWS_DATA.filter(show => {
    // 1. Genre filter
    const matchesGenre = selectedGenre === '전체' || show.genre === selectedGenre;
    // 2. Search query filter
    const lowerQuery = searchQuery.trim().toLowerCase();
    if (!lowerQuery) return matchesGenre;

    const matchesSearch = 
      show.title.toLowerCase().includes(lowerQuery) ||
      show.facility.toLowerCase().includes(lowerQuery) ||
      show.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
      show.genre.toLowerCase().includes(lowerQuery);

    return matchesGenre && matchesSearch;
  });

  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre);
    onAnnounce(`예술 장르 필터를 [${genre}] 예술 군으로 성공적으로 재정합하였습니다.`);
  };

  const handleSupporterApply = () => {
    setIsSupporterRegistered(true);
    onAnnounce("403 바이패스 서포터즈 1기 참여 원서 접수가 완료되었습니다. 무장벽 가이드 뱃지가 마이페이지에 자동 배포됩니다.");
  };

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="hc-card rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 p-4 border border-slate-800 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <Sparkles className="w-48 h-48 text-blue-400" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="hc-badge inline-flex items-center gap-1.5 text-[9px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/30 rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            오늘의 보인(BOIN) 추천작
          </span>
          <h2 className="text-lg font-black tracking-tight leading-snug">공연장 403호 매끄러운 진입로 안내 가이드 탑재</h2>
          <p className="text-xs text-slate-300 leading-relaxed hc-text-mute">
            계단 없는 좌석 진입 경로, 배리어프리 해설, 그리고 실시간 동행 자막 수신기 혜택을 즉시 받아보세요.
          </p>
        </div>
      </div>

      {/* Modern Search bar */}
      <div className="space-y-2 text-left bg-slate-900 border border-slate-800 p-3 rounded-2xl">
        <label className="hc-accent text-[11px] font-black tracking-wide text-blue-400 uppercase block flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-blue-400" />
          무장벽 맞춤형 공연 통합 검색
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="공연 제목, 극장명, 또는 배리어프리 키워드 입력..."
            className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800/80 pl-3 pr-10 py-2.5 focus:border-blue-500 focus:outline-none hc-card font-semibold placeholder-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                onAnnounce('검색 필터를 초기화해 전체 공연 목록으로 환원했습니다.');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Genre Selection Grid */}
      <div className="space-y-2 text-left">
        <label className="hc-accent text-xs font-black tracking-wide text-blue-400 uppercase block">
          🎭 선호 예술 장르 선택
        </label>
        <div className="grid grid-cols-4 gap-2">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => handleGenreClick(g)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all text-center border ${
                selectedGenre === g
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Active Performance Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="hc-accent text-xs font-black text-slate-305 tracking-wide uppercase flex items-center gap-1.5">
            <Award className="w-4 h-4 text-cyan-400" />
            맞춤 장애인 지원 완비 공연 목록
          </h3>
          <span className="text-[10px] text-slate-500 font-bold count-badge">
            {filteredShows.length}개 매칭
          </span>
        </div>

        <div className="space-y-3">
          {filteredShows.map((show) => {
            const indexColorClass = show.score >= 90
              ? 'text-green-400'
              : show.score >= 60
              ? 'text-cyan-400'
              : 'text-yellow-405';

            return (
              <div
                key={show.id}
                className="hc-card bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 transition-all shadow-md"
              >
                <div className="flex">
                  <img
                    src={show.image}
                    alt={show.title}
                    className="w-24 h-24 object-cover filter brightness-90 shrink-0"
                  />
                  <div className="p-3 flex-1 flex flex-col justify-between text-left">
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-start gap-1">
                        <span className="hc-badge inline-flex items-center text-[7px] bg-blue-500/10 text-cyan-400 font-bold px-1.5 py-0.5 rounded-full border border-cyan-500/20">
                          {show.genre}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 truncate max-w-[140px]">{show.facility}</span>
                      </div>
                      <h4
                        onClick={() => onShowSelect(show)}
                        className="text-xs font-black text-white hover:text-blue-400 cursor-pointer line-clamp-1 leading-snug"
                      >
                        {show.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1">
                        {show.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="hc-badge px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-slate-300 border border-slate-705 font-bold tracking-tight"
                          >
                            {t}
                          </span>
                        ))}
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
          })}
        </div>
      </div>

      {/* Supporters Campaign Banner */}
      <div className="hc-card rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 text-left">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span className="p-1 px-1.5 text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded font-bold uppercase hc-badge">
                지원
              </span>
              403 바이패스 서포터즈 1기
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed hc-text-mute">
              휠체어 좌석 진입로 경사로 체크 및 이동 취약 관객을 위한 길잡이 요원이 되어주세요.
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSupporterApply}
          disabled={isSupporterRegistered}
          className={`hc-button-primary w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
            isSupporterRegistered
              ? 'bg-slate-950 border border-green-500/40 text-green-300 cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>
            {isSupporterRegistered
              ? '서포터즈 접수 완료 (근접 뱃지 획득!)'
              : '서포터즈 활동 지원하기 (리워드 시상)'}
          </span>
        </button>
      </div>
    </div>
  );
}
