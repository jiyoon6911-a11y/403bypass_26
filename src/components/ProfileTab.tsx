import React, { useState } from 'react';
import { LogOut, Tag, Search, Users, MessageSquare } from 'lucide-react';
import { ReviewLog, Comment } from '../types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ProfileTabProps {
  currentUser: { email: string; name: string; userId: string; role: string; avatarUrl?: string };
  onLogout: () => void;
  personalReviews: any[];
  onAddReview: (review: { show: string; rating: number; text: string }) => void;
  onClearPersonalReviews: () => void;
  onDeleteReview: (id: number) => void;
  globalReviews: ReviewLog[];
  onAddComment: (reviewId: number, text: string) => void;
  followingIds: string[];
  onToggleFollow: (userId: string, userName: string) => void;
  onUpdateUserId: (newId: string) => void;
  onAnnounce: (msg: string) => void;
  highContrast: boolean;
}

export default function ProfileTab({
  currentUser,
  onLogout,
  personalReviews,
  onAddReview,
  onClearPersonalReviews,
  onDeleteReview,
  globalReviews,
  onAddComment,
  followingIds,
  onToggleFollow,
  onUpdateUserId,
  onAnnounce,
  highContrast,
}: ProfileTabProps) {
  const [subview, setSubview] = useState<'personal' | 'social'>('personal');

  // Review Form state
  const [showInput, setShowInput] = useState('새로운 연극적 기쁨');
  const [ratingInput, setRatingInput] = useState(5);
  const [textInput, setTextInput] = useState('');

  // ID setting state
  const [newUserId, setNewUserId] = useState(currentUser.userId);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);

  // Comment local states
  const [localComments, setLocalComments] = useState<Record<number, string>>({});

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) {
      alert("체험 평가 내용을 입력해주시기 바랍니다.");
      return;
    }
    onAddReview({
      show: showInput,
      rating: ratingInput,
      text: textInput.trim(),
    });
    setTextInput('');
  };

  const handleUpdateId = () => {
    const formatted = newUserId.trim().toLowerCase().replace(/[^a-z0-0_]/g, '');
    if (!formatted) {
      alert("올바른 ID 규격을 입력해 주십시오.");
      return;
    }
    onUpdateUserId(formatted);
    alert(`성공적으로 고유 아이디가 @${formatted}(으)로 셋업되었습니다!`);
  };

  const [isSearchingDb, setIsSearchingDb] = useState(false);

  const handleSearchNetwork = async () => {
    const qStr = searchQuery.trim().toLowerCase();
    if (!qStr) {
      setSearchResult(null);
      return;
    }

    setIsSearchingDb(true);
    try {
      // First try to match by exact userId
      const qUser = query(collection(db, 'users'), where('userId', '==', qStr));
      let snap = await getDocs(qUser);

      // If not found, try to match by name
      if (snap.empty) {
        const qName = query(collection(db, 'users'), where('name', '==', searchQuery.trim()));
        snap = await getDocs(qName);
      }

      if (!snap.empty) {
        const docData = snap.docs[0].data();
        setSearchResult({
          userId: docData.userId,
          name: docData.name,
          role: docData.role,
          type: docData.role === '장애인 당사자' ? '♿ 동행 희망' : docData.role === '서포터즈' ? '🤝 보조 헬퍼' : '🎭 일반 관람',
          avatarUrl: docData.avatarUrl
        });
      } else {
        // Fallback search to find static ones if any
        let found: any = null;
        if (qStr === 'art_pioneer' || qStr === '백예람') {
          found = { userId: 'art_pioneer', name: '백예람', role: '장애인 당사자', type: '♿ 동행 희망' };
        } else if (qStr === 'culture_helper' || qStr === '김지민') {
          found = { userId: 'culture_helper', name: '김지민', role: '서포터즈', type: '🤝 보조 헬퍼' };
        } else if (qStr === 'wheel_champion' || qStr === '박정우') {
          found = { userId: 'wheel_champion', name: '박정우', role: '장애인 당사자', type: '♿ 동행 희망' };
        }

        if (found) {
          setSearchResult(found);
        } else {
          setSearchResult({ notFound: true, query: searchQuery });
        }
      }
    } catch (err) {
      console.error("Search network error:", err);
      alert("네트워크 조회에 실패했습니다.");
    } finally {
      setIsSearchingDb(false);
    }
  };

  const submitComment = (reviewId: number) => {
    const comContent = localComments[reviewId] || '';
    if (!comContent.trim()) {
      alert("대화 의견을 입력해 주세요.");
      return;
    }
    onAddComment(reviewId, comContent.trim());
    setLocalComments({ ...localComments, [reviewId]: '' });
  };

  return (
    <div className="space-y-4">
      {/* User Basic Info Card */}
      <div className="hc-card rounded-2xl p-4 bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          {currentUser.avatarUrl ? (
            currentUser.avatarUrl.startsWith('http') ? (
              <img
                src={currentUser.avatarUrl}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-slate-700 shrink-0"
                alt="Profile"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 font-extrabold text-2xl flex items-center justify-center shrink-0">
                {currentUser.avatarUrl}
              </div>
            )
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-650 to-cyan-500 flex items-center justify-center text-white text-base font-black shadow-lg shadow-blue-500/20 shrink-0">
              {currentUser.name.substring(0, 2)}
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-extrabold text-white">{currentUser.name} 님</h3>
              <span className="hc-badge px-1.5 py-0.5 rounded text-[8px] bg-blue-500/10 text-blue-400 font-bold tracking-wider border border-blue-500/20 uppercase">
                {currentUser.role || '보안 관람객'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-cyan-400 font-extrabold font-mono">@{currentUser.userId}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 font-mono">{currentUser.email}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="hc-button-secondary p-2 rounded-xl bg-slate-950 text-red-400 hover:text-red-350 hover:bg-red-500/10 transition-all flex items-center gap-1.5 border border-slate-800 shrink-0"
          aria-label="로그아웃"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">로그아웃</span>
        </button>
      </div>

      {/* Sub tabs Navigation */}
      <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
        <button
          onClick={() => {
            setSubview('personal');
            onAnnounce("나의 배리어프리 품질 검독 및 기록 관리 인터페이스로 복귀합니다.");
          }}
          className={`flex-1 py-1.5 px-2.5 text-center text-xs font-black rounded-lg transition-all ${
            subview === 'personal'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📂 나의 점검기록 작성
        </button>
        <button
          onClick={() => {
            setSubview('social');
            onAnnounce("유니버설 커넥트 소셜 대광장. 다른 연극 동지들을 찾고 그들의 검사 후기에 덧댓글로 대화할 수 있습니다.");
          }}
          className={`flex-1 py-1.5 px-2.5 text-center text-xs font-black rounded-lg transition-all ${
            subview === 'social'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ♿ 유니버설 커넥트 (소셜)
        </button>
      </div>

      {subview === 'personal' ? (
        <div className="space-y-4">
          {/* Review creation form */}
          <div className="hc-card rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-3 text-left">
            <h3 className="text-xs font-black text-slate-300 uppercase flex items-center gap-1.5">
              지난 관람 공연 배리어프리 품질 평가 수기 작성
            </h3>

            <form onSubmit={handleCreateReview} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block hc-text-mute">공연 품목</span>
                  <select
                    value={showInput}
                    onChange={(e) => setShowInput(e.target.value)}
                    className="w-full text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded p-1.5 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="새로운 연극적 기쁨">연극 '새로운 연극적 기쁨'</option>
                    <option value="한여름밤의 꿈 배리어프리">뮤지컬 '한여름밤의 꿈'</option>
                    <option value="배구장 휠체어 음악 앙상블">클래식 '음악 앙상블'</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block hc-text-mute">접근 편의 점수</span>
                  <select
                    value={ratingInput}
                    onChange={(e) => setRatingInput(parseInt(e.target.value))}
                    className="w-full text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded p-1.5 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="5">★★★★★ (아주 훌륭함)</option>
                    <option value="4">★★★★☆ (원활함)</option>
                    <option value="3">★★★☆☆ (기존수준)</option>
                    <option value="2">★★☆☆☆ (장벽있음)</option>
                    <option value="1">★☆☆☆☆ (통행장치 고장)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block hc-text-mute">체험 평가 내용</span>
                <textarea
                  rows={2}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="예: 403호 좌석에 경사로가 설치되어 전동휠체어도 지연없이 입장하여 극을 편안히 관람했습니다."
                  className="w-full text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="hc-button-primary w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                기록 저장 및 종합 플랫폼 DB 업데이트
              </button>
            </form>
          </div>

          {/* Historical Reviews from current person */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <h3 className="hc-accent text-xs font-black text-slate-300 tracking-wide uppercase">내가 기록한 배리어프리 후기 로그</h3>
              <button onClick={onClearPersonalReviews} className="text-[10px] font-bold text-red-400 hover:text-red-300 transition-all">
                로그 초기화
              </button>
            </div>

            <div className="space-y-2">
              {personalReviews.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-slate-500 text-center space-y-1.5 border border-dashed border-slate-800 rounded-2xl w-full">
                  <p className="text-[11px] font-bold">아직 작성한 보편 점검 후기 로그가 없습니다.</p>
                  <p className="text-[9px] text-slate-500">관람 마친 극장들의 배리어프리 수기를 등재해보세요.</p>
                </div>
              ) : (
                personalReviews.map((log) => {
                  const stars = '★'.repeat(log.rating) + '☆'.repeat(5 - log.rating);
                  return (
                    <div
                      key={log.id}
                      className="hc-card bg-slate-900 border border-slate-800 py-3 px-4 rounded-xl space-y-1.5 relative"
                    >
                      <div className="flex justify-between items-start">
                        <span className="hc-badge inline-flex items-center text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 font-bold px-1.5 py-0.5 rounded font-mono">
                          {stars}
                        </span>
                        <span className="text-[10px] font-black text-slate-100 uppercase">
                          {log.show}
                        </span>
                        <button
                          onClick={() => onDeleteReview(log.id)}
                          className="text-[9px] text-red-400/80 hover:text-red-400 font-bold transition-all ml-1"
                        >
                          삭제
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed pl-1">{log.text}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {/* Change ID Handle */}
          <div className="hc-card rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-300 uppercase flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-400" />
                나의 고유 아벨라 ID 설정
              </h4>
              <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/25 px-1.5 py-0.5 rounded font-black font-mono">
                @{currentUser.userId}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex items-center flex-1">
                <span className="absolute left-3 text-xs text-slate-500 font-bold">@</span>
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="아이디를 정해주세요 (영문/숫자)"
                  className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 pl-7 pr-3 py-2.5 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleUpdateId}
                className="hc-button-primary bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-black px-4 py-2.5 rounded-xl transition-all shrink-0"
              >
                변경 저장
              </button>
            </div>
          </div>

          {/* Social Network Search */}
          <div className="hc-card rounded-2xl p-4 bg-slate-900 border border-slate-805 space-y-3">
            <h4 className="text-xs font-black text-slate-300 uppercase flex items-center gap-1.5">
              <Search className="w-4 h-4 text-cyan-400" />
              무장벽 인맥 네트워크 검색 (ID 매칭)
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="예: art_pioneer, culture_helper 등 검색"
                className="flex-1 text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleSearchNetwork}
                className="hc-button-primary bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all"
              >
                찾기
              </button>
            </div>

            {searchResult && (
              <div className="border border-slate-800 bg-slate-950/40 p-3 rounded-xl">
                {searchResult.notFound ? (
                  <p className="text-[10px] text-slate-500 font-bold">일치하는 고유 아이디(@{searchResult.query})가 없습니다.</p>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {searchResult.avatarUrl ? (
                        searchResult.avatarUrl.startsWith('http') ? (
                          <img
                            src={searchResult.avatarUrl}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                            alt="Profile"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-base font-extrabold">
                            {searchResult.avatarUrl}
                          </div>
                        )
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs truncate">
                          {searchResult.name.substring(0, 2)}
                        </div>
                      )}
                      <div className="text-left leading-normal text-[11px]">
                        <p className="font-extrabold text-white">
                          {searchResult.name} <span className="text-[8px] text-cyan-405">{searchResult.type}</span>
                        </p>
                        <span className="text-slate-500 font-mono">@{searchResult.userId}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleFollow(searchResult.userId, searchResult.name)}
                      className={`text-[9px] font-black px-2.5 py-1 rounded ${
                        followingIds.includes(searchResult.userId)
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {followingIds.includes(searchResult.userId) ? '팔로잉 취소' : '팔로우'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Social Recommendations */}
          <div className="hc-card rounded-2xl p-4 bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-black text-slate-300 uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400 animate-pulse" />
              추천 네트워크 협력 동승자 목록
            </h4>

            <div className="divide-y divide-slate-805 space-y-2.5">
              {[
                { id: 'art_pioneer', name: '백예람', label: '♿ 지체' },
                { id: 'culture_helper', name: '김지민', label: '🤝 서포터' },
                { id: 'wheel_champion', name: '박정우', label: '♿ 지체' },
              ].map((person, idx) => {
                const isFl = followingIds.includes(person.id);
                return (
                  <div key={person.id} className="flex items-center justify-between pt-2.5 first:pt-0">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-cyan-600/20 text-cyan-400 font-bold border border-cyan-500/30 flex items-center justify-center text-xs">
                        {person.name.substring(0, 2)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-white">{person.name}</span>
                          <span className="text-[9px] text-cyan-400 font-bold bg-cyan-500/10 px-1 rounded">{person.label}</span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 block">@{person.id}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onToggleFollow(person.id, person.name)}
                      className={`text-[10px] font-black px-3 py-1 rounded-lg border transition-all ${
                        isFl
                          ? 'border-slate-700 bg-slate-800 text-slate-300'
                          : 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                      }`}
                    >
                      {isFl ? '팔로잉 취소' : '팔로우'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Communities Feed */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-300 tracking-wide uppercase flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              동지 회원의 배리어프리 후기 & 대화 광장
            </h3>

            <div className="space-y-3">
              {globalReviews.map((gr) => {
                const isFl = followingIds.includes(gr.userId);
                const isOwn = (gr.userId === currentUser.userId);
                const stars = '★'.repeat(gr.rating) + '☆'.repeat(5 - gr.rating);

                return (
                  <div key={gr.id} className="hc-card bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-left">
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white text-xs font-black shadow shadow-indigo-500/20">
                          {gr.userName.substring(0, 2)}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black text-white">{gr.userName} 님</span>
                            <span className="px-1.5 py-0.2 rounded text-[7px] font-black tracking-wider uppercase bg-blue-500/10 text-cyan-404">
                              {gr.userRole}
                            </span>
                            {isOwn ? (
                              <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded px-1">나</span>
                            ) : isFl ? (
                              <span className="text-[8px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded px-1">팔로잉</span>
                            ) : null}
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 block">@{gr.userId}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-yellow-400 font-extrabold font-mono block">{stars}</span>
                        <span className="text-[8px] font-semibold text-slate-450 uppercase tracking-widest block">{gr.show}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-semibold pl-1">
                      "{gr.text}"
                    </p>

                    {/* Comments section */}
                    <div className="space-y-2 pt-2 border-t border-slate-850">
                      <p className="text-[9px] text-slate-500 tracking-widest font-black uppercase">
                        의견 대화란 ({gr.comments?.length || 0})
                      </p>

                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {gr.comments?.length === 0 ? (
                          <p className="text-[9px] text-slate-650 text-center font-bold">의견이 비어있습니다.</p>
                        ) : (
                          gr.comments?.map((com) => {
                            const isCFl = followingIds.includes(com.authorId);
                            const isCOwn = com.authorId === currentUser.userId;

                            return (
                              <div key={com.id} className="bg-slate-950/40 p-2 rounded-xl border border-slate-905 text-[11px] leading-relaxed space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-blue-300">{com.authorName}</span>
                                    <span className="text-[9px] text-slate-500 font-mono">@{com.authorId}</span>
                                    {isCOwn ? (
                                      <span className="text-[7px] text-cyan-400 bg-cyan-900/30 px-1 rounded">나</span>
                                    ) : isCFl ? (
                                      <span className="text-[7px] text-yellow-405 bg-yellow-900/10 px-1 rounded">친구</span>
                                    ) : null}
                                  </div>
                                  <span className="text-[8px] text-slate-600 font-mono shrink-0">{com.timestamp}</span>
                                </div>
                                <p className="text-slate-300 text-left">{com.text}</p>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Comment Input Form */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={localComments[gr.id] || ''}
                          onChange={(e) => setLocalComments({ ...localComments, [gr.id]: e.target.value })}
                          placeholder="의견을 나누어 보세요..."
                          className="flex-1 text-[11px] bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 focus:border-cyan-500 focus:outline-none"
                        />
                        <button
                          onClick={() => submitComment(gr.id)}
                          className="text-[10px] font-black bg-slate-955 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-400/10 px-3.5 py-2 rounded-xl transition-all shrink-0"
                        >
                          대화참여
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
