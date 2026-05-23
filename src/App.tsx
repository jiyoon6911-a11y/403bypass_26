import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Home, Map, Calendar, Ticket, User, Settings, Accessibility } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';

import { Show, Booking, Ticket as TicketType, ReviewLog } from './types';
import { SHOWS_DATA, INITIAL_GLOBAL_REVIEWS } from './data';

// Subcomponents
import AlertModal from './components/AlertModal';
import SettingsModal from './components/SettingsModal';
import SyncModal from './components/SyncModal';
import VoiceConsole from './components/VoiceConsole';
import LoginPortal from './components/LoginPortal';

// Tabs
import HomeTab from './components/HomeTab';
import MobilityTab from './components/MobilityTab';
import VisibilityTab from './components/VisibilityTab';
import TicketsTab from './components/TicketsTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  // Session states
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; userId: string; role: string } | null>(null);

  // Layout states
  const [activeTab, setActiveTab] = useState<'home' | 'mobility' | 'visibility' | 'tickets' | 'profile'>('home');
  const [activeVoiceText, setActiveVoiceText] = useState('403 BYPASS 유니버설 안내 및 탐색 센터에 오신 것을 환영합니다.');

  // Settings states
  const [fontScale, setFontScale] = useState(1.2);
  const [highContrast, setHighContrast] = useState(false);
  const [showVoiceConsole, setShowVoiceConsole] = useState(true);

  // Modals Visibility
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  // Data registries
  const [personalReviews, setPersonalReviews] = useState<any[]>([]);
  const [globalReviews, setGlobalReviews] = useState<ReviewLog[]>([]);
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [syncedTickets, setSyncedTickets] = useState<TicketType[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  // 1. Initial State Hooks
  useEffect(() => {
    // Check logged in user locally first for zero-latency initial paint
    const loggedUser = localStorage.getItem('bypass_logged_in_user');
    if (loggedUser) {
      setCurrentUser(JSON.parse(loggedUser));
    }

    // Subscribe to real-time Firebase Auth session state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const emailStr = firebaseUser.email;
        const docRef = doc(db, 'users', emailStr);
        try {
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const userObj = snap.data();
            setCurrentUser(userObj as any);
            localStorage.setItem('bypass_logged_in_user', JSON.stringify(userObj));
          } else {
            // Profile fallback
            const savedProfile = localStorage.getItem(`user_profile_${emailStr}`);
            if (savedProfile) {
              const userObj = JSON.parse(savedProfile);
              setCurrentUser(userObj);
              localStorage.setItem('bypass_logged_in_user', JSON.stringify(userObj));
            }
          }
        } catch (error) {
          console.error("Error loaded firebase user document:", error);
        }
      }
    });

    // Load active bookings
    const bookings = localStorage.getItem('bypass_active_bookings');
    if (bookings) {
      setActiveBookings(JSON.parse(bookings));
    } else {
      const defaultB: Booking[] = [
        {
          id: 'demo_101',
          type: 'manager',
          date: '5월 24일',
          time: '13:00',
          detail: '♿ 1:1 휠체어 전용 하차 동행 및 입석 매칭',
          note: '공사 보존 파손 통행로 고장 상태에 부합하여 가이드 소원'
        }
      ];
      setActiveBookings(defaultB);
      localStorage.setItem('bypass_active_bookings', JSON.stringify(defaultB));
    }

    // Load following contacts
    const following = localStorage.getItem('bypass_following_ids');
    if (following) {
      setFollowingIds(JSON.parse(following));
    } else {
      const defaultF = ['art_pioneer', 'culture_helper'];
      setFollowingIds(defaultF);
      localStorage.setItem('bypass_following_ids', JSON.stringify(defaultF));
    }

    // Load personal quality evaluations
    const pReviews = localStorage.getItem('bypass_user_reviews');
    if (pReviews) {
      setPersonalReviews(JSON.parse(pReviews));
    }

    // Load global Reviews
    const gReviews = localStorage.getItem('bypass_global_reviews');
    if (gReviews) {
      setGlobalReviews(JSON.parse(gReviews));
    } else {
      setGlobalReviews(INITIAL_GLOBAL_REVIEWS);
      localStorage.setItem('bypass_global_reviews', JSON.stringify(INITIAL_GLOBAL_REVIEWS));
    }

    // Load external synced tickets
    const sTickets = localStorage.getItem('bypass_external_tickets');
    if (sTickets) {
      setSyncedTickets(JSON.parse(sTickets));
    }

    return () => unsubscribe();
  }, []);

  // Update root classes for font scale
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      'scale-100-percent',
      'scale-120-percent',
      'scale-140-percent',
      'scale-160-percent',
      'scale-180-percent'
    );

    if (fontScale === 1.0) root.classList.add('scale-100-percent');
    else if (fontScale === 1.2) root.classList.add('scale-120-percent');
    else if (fontScale === 1.4) root.classList.add('scale-140-percent');
    else if (fontScale === 1.6) root.classList.add('scale-160-percent');
    else if (fontScale === 1.8) root.classList.add('scale-180-percent');
  }, [fontScale]);

  // Utility custom alert
  const showCustomAlert = (msg: string) => {
    setAlertMessage(msg);
    setIsAlertOpen(true);
  };

  const handleAnnounce = (msg: string) => {
    setActiveVoiceText(msg);
  };

  // Navigations handler
  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    let bannerMsg = '';
    if (tabId === 'home') bannerMsg = '홈 화면. 선호 장르별 보편적 맞춤 추천 공연과 서포터즈 정보를 전달합니다.';
    else if (tabId === 'mobility') bannerMsg = '안내맵 화면. 실시간 층별 혼잡도 상황과 스마트 수어 카메라, S-MAP 3D 공간 도면을 탐색합니다.';
    else if (tabId === 'visibility') bannerMsg = '매칭예약 화면. 1대1 현장 안심 보조 헬퍼 배정 및 스마트 다자막 글래스 특수 대기열 예약을 신청합니다.';
    else if (tabId === 'tickets') bannerMsg = '나의 티켓 화면. 나의 다가올 관람권 바코드와 지체 장애인 관람 환불 보증서, 교통 가이드를 담았습니다.';
    else if (tabId === 'profile') bannerMsg = '마이페이지 화면. 내 고유 무벽 뱃지 정보와 다녀온 극장들의 시설 실사용 점검 후기 로그를 관리합니다.';
    
    handleAnnounce(bannerMsg);
  };

  // Data operations
  const handleLoginSuccess = (userObj: { email: string; name: string; userId: string; role: string }) => {
    setCurrentUser(userObj);
    handleAnnounce(`${userObj.name} 님이 안전하게 검증 패싱 로그인 성공 완료되었습니다.`);
  };

  const handleLogout = async () => {
    if (confirm("정말로 로그아웃하여 세션을 안전하게 반환 하시겠습니까?")) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Firebase Signout Error:", error);
      }
      localStorage.removeItem('bypass_logged_in_user');
      setCurrentUser(null);
      setActiveTab('home');
      handleAnnounce("사용자 세션 통행 패스가 안전하게 회수 처리 및 로그아웃 되었습니다.");
    }
  };

  const handleAddReview = (newReview: { show: string; rating: number; text: string }) => {
    const creator = currentUser || { name: '익명', userId: 'anonymous', role: '일반 관람객' };
    const rId = Date.now();

    const reviewObj = {
      id: rId,
      show: newReview.show,
      rating: newReview.rating,
      text: newReview.text,
    };

    // 1. Personal list
    const updatedPersonal = [reviewObj, ...personalReviews];
    setPersonalReviews(updatedPersonal);
    localStorage.setItem('bypass_user_reviews', JSON.stringify(updatedPersonal));

    // 2. Global registry
    const globalObj: ReviewLog = {
      id: rId,
      userId: creator.userId,
      userName: creator.name,
      userRole: creator.role,
      show: newReview.show,
      rating: newReview.rating,
      text: newReview.text,
      comments: [],
    };
    const updatedGlobal = [globalObj, ...globalReviews];
    setGlobalReviews(updatedGlobal);
    localStorage.setItem('bypass_global_reviews', JSON.stringify(updatedGlobal));

    handleAnnounce(`새로운 배리어프리 품질 탐방 리뷰 [${newReview.show}]가 기여 DB에 완벽 보존되었습니다.`);
  };

  const handleClearPersonalReviews = () => {
    if (confirm("정말로 모든 기록 로그들을 완전 소산 소거하시겠습니까?")) {
      setPersonalReviews([]);
      localStorage.removeItem('bypass_user_reviews');

      // Clear own in global too
      if (currentUser) {
        const remainingGlobal = globalReviews.filter(r => r.userId !== currentUser.userId);
        setGlobalReviews(remainingGlobal);
        localStorage.setItem('bypass_global_reviews', JSON.stringify(remainingGlobal));
      }
      handleAnnounce("관람 평가 및 수기 탐사 기록 데이터베이스를 깨끗이 초기화 완료 소화 수행했습니다.");
    }
  };

  const handleDeleteReview = (id: number) => {
    const pList = personalReviews.filter(r => r.id !== id);
    setPersonalReviews(pList);
    localStorage.setItem('bypass_user_reviews', JSON.stringify(pList));

    const gList = globalReviews.filter(r => r.id !== id);
    setGlobalReviews(gList);
    localStorage.setItem('bypass_global_reviews', JSON.stringify(gList));

    handleAnnounce("선택된 개별 배리어프리 후기 행렬 인스턴스를 즉각 영구 파기했습니다.");
  };

  const handleAddComment = (reviewId: number, text: string) => {
    const creator = currentUser || { name: '익명', userId: 'anonymous' };
    const updated = globalReviews.map((gr) => {
      if (gr.id === reviewId) {
        const comments = gr.comments || [];
        return {
          ...gr,
          comments: [
            ...comments,
            {
              id: Date.now(),
              authorId: creator.userId,
              authorName: creator.name,
              text,
              timestamp: '방금 전',
            },
          ],
        };
      }
      return gr;
    });

    setGlobalReviews(updated);
    localStorage.setItem('bypass_global_reviews', JSON.stringify(updated));
    handleAnnounce("소셜 대화 보드에 실시간 대화글 전송 참여 처리가 완료되었습니다.");
  };

  const handleToggleFollow = (userId: string, userName: string) => {
    let nextFollowing: string[];
    if (followingIds.includes(userId)) {
      nextFollowing = followingIds.filter(id => id !== userId);
      handleAnnounce(`[${userName}] 회원과의 팔로잉 인맥 끊기를 완료했습니다.`);
    } else {
      nextFollowing = [...followingIds, userId];
      handleAnnounce(`[${userName} (@${userId})] 님과 팔로잉 맺기가 완료되었습니다! 그들의 체험글을 먼저 구독 전송받습니다.`);
    }
    setFollowingIds(nextFollowing);
    localStorage.setItem('bypass_following_ids', JSON.stringify(nextFollowing));
  };

  const handleUpdateUserId = (newId: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, userId: newId };
    setCurrentUser(updatedUser);
    localStorage.setItem('bypass_logged_in_user', JSON.stringify(updatedUser));

    // Also update profile index
    localStorage.setItem(`user_profile_${currentUser.email}`, JSON.stringify(updatedUser));
    handleAnnounce(`당신의 유니버설 고유 핸들이 @${newId}로 완전 개정 수치 반영되었습니다.`);
  };

  const handleAddBooking = (newB: Booking) => {
    const updated = [newB, ...activeBookings];
    setActiveBookings(updated);
    localStorage.setItem('bypass_active_bookings', JSON.stringify(updated));
  };

  const handleCancelBooking = (id: string) => {
    const updated = activeBookings.filter(b => b.id !== id);
    setActiveBookings(updated);
    localStorage.setItem('bypass_active_bookings', JSON.stringify(updated));
    showCustomAlert("선택하신 배리어프리 대기 및 사전 예약 스케줄을 정상적으로 안전 취소 반환 처리 완료했습니다.");
    handleAnnounce("고객님의 사전 예약을 회수하고 전산을 안전 원복 조치했습니다.");
  };

  const handleSyncTicketComplete = (newTicket: TicketType) => {
    const updated = [newTicket, ...syncedTickets];
    setSyncedTickets(updated);
    localStorage.setItem('bypass_external_tickets', JSON.stringify(updated));
  };

  const handleDeleteTicket = (id: string) => {
    if (confirm("정말로 이 외부 연동 선상 예매권의 무장벽 통합 서비스를 해제하시겠습니까?")) {
      const updated = syncedTickets.filter(t => t.id !== id);
      setSyncedTickets(updated);
      localStorage.setItem('bypass_external_tickets', JSON.stringify(updated));
      handleAnnounce("타사 연동 예매권의 배리어프리 가이드 동화 서비스를 정상 해지 조치했습니다.");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col overflow-x-hidden pb-28 text-center transition-colors duration-300 ${highContrast ? 'high-contrast-mode bg-black' : 'bg-[#0B0F19]'}`}>
      
      {/* 1. Login session barrier */}
      {!currentUser && (
        <LoginPortal
          onLoginSuccess={handleLoginSuccess}
          onOpenSettings={() => setIsSettingsOpen(true)}
          highContrast={highContrast}
        />
      )}

      {/* 2. Main Top Header layout */}
      {currentUser && (
        <header className="hc-card border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 transition-colors duration-200">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-left">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-black text-sm tracking-widest">403</span>
              </div>
              <div className="leading-tight">
                <h1 className="hc-accent text-sm font-black tracking-wider text-blue-500 flex items-center gap-1">
                  BYPASS 
                  <span className="hc-badge px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30">UNIVERSAL</span>
                </h1>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest hc-text-mute font-mono">Barrier-Free Platform</p>
              </div>
            </div>

            {/* Quick settings gear */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hc-button-secondary p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 border border-slate-700/50 cursor-pointer"
              aria-label="접근성 센터 설정"
            >
              <Settings className="w-4 h-4 animate-spin-slow" />
              <span className="text-[10px] font-bold">접근성센터</span>
            </button>
          </div>
        </header>
      )}

      {/* 3. Tab Body Container */}
      {currentUser && (
        <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 space-y-4">
          {activeTab === 'home' && (
            <HomeTab
              onShowSelect={(show) => {
                setActiveTab('tickets');
                handleAnnounce(`선택하신 추천 공연 [${show.title}]의 모바일 배리어프리 티켓 상세권으로 슬라이딩 전환했습니다.`);
              }}
              onAnnounce={handleAnnounce}
              highContrast={highContrast}
            />
          )}

          {activeTab === 'mobility' && (
            <MobilityTab
              onAnnounce={handleAnnounce}
              highContrast={highContrast}
            />
          )}

          {activeTab === 'visibility' && (
            <VisibilityTab
              bookings={activeBookings}
              onAddBooking={handleAddBooking}
              onCancelBooking={handleCancelBooking}
              onAnnounce={handleAnnounce}
              highContrast={highContrast}
            />
          )}

          {activeTab === 'tickets' && (
            <TicketsTab
              syncedTickets={syncedTickets}
              onDeleteTicket={handleDeleteTicket}
              onOpenSync={() => setIsSyncOpen(true)}
              highContrast={highContrast}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              currentUser={currentUser}
              onLogout={handleLogout}
              personalReviews={personalReviews}
              onAddReview={handleAddReview}
              onClearPersonalReviews={handleClearPersonalReviews}
              onDeleteReview={handleDeleteReview}
              globalReviews={globalReviews}
              onAddComment={handleAddComment}
              followingIds={followingIds}
              onToggleFollow={handleToggleFollow}
              onUpdateUserId={handleUpdateUserId}
              onAnnounce={handleAnnounce}
              highContrast={highContrast}
            />
          )}
        </main>
      )}

      {/* 4. Voice Console overlay removed as requested */}

      {/* 5. Bottom Navigation Menu */}
      {currentUser && (
        <nav className="hc-card border-t border-slate-800 bg-slate-900/90 backdrop-blur fixed bottom-0 left-0 right-0 z-40 transition-colors duration-200">
          <div className="max-w-md mx-auto py-2 px-1 flex items-center justify-evenly">
            <button
              onClick={() => handleTabChange('home')}
              className={`nav-tab-btn flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'home' ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">홈</span>
            </button>

            <button
              onClick={() => handleTabChange('mobility')}
              className={`nav-tab-btn flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'mobility' ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <Map className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">안내맵</span>
            </button>

            <button
              onClick={() => handleTabChange('visibility')}
              className={`nav-tab-btn flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'visibility' ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">매칭예약</span>
            </button>

            <button
              onClick={() => handleTabChange('tickets')}
              className={`nav-tab-btn flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'tickets' ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <Ticket className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">나의티켓</span>
            </button>

            <button
              onClick={() => handleTabChange('profile')}
              className={`nav-tab-btn flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'profile' ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">마이</span>
            </button>
          </div>
        </nav>
      )}

      {/* 6. Modals */}
      <AlertModal
        isOpen={isAlertOpen}
        message={alertMessage}
        onClose={() => setIsAlertOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fontScale={fontScale}
        onFontScaleChange={(val) => {
          setFontScale(val);
          handleAnnounce(`텍스트 화면 크기가 ${val}배 가변 스케일로 크게 확대 반영되었습니다.`);
        }}
        highContrast={highContrast}
        onHighContrastToggle={() => {
          const nextHC = !highContrast;
          setHighContrast(nextHC);
          handleAnnounce(nextHC ? "고대비 흑백 안전 보정 뷰가 시작되었습니다." : "일반 컬러 우주 다크 인터페이스로 복구했습니다.");
        }}
      />

      <SyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        onSyncComplete={handleSyncTicketComplete}
        highContrast={highContrast}
      />
    </div>
  );
}
