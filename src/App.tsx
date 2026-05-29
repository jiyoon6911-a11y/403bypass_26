import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Home, Map, Calendar, Ticket, User, Settings, Accessibility, Compass, Phone, MessageSquare, Sun } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';

import { Show, Booking, Ticket as TicketType, ReviewLog, UserProfile } from './types';
import { SHOWS_DATA, INITIAL_GLOBAL_REVIEWS } from './data';
import { LanguageProvider, useTranslation } from './lib/translations';
import appLogo from './assets/images/bypass_icon_final_1779876138815.png';

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
import ShowDetailView from './components/ShowDetailView';

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const { t } = useTranslation();
  // Session states
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Layout states
  const [activeTab, setActiveTab] = useState<'home' | 'mobility' | 'visibility' | 'tickets' | 'profile'>('home');
  const [selectedShowDetail, setSelectedShowDetail] = useState<Show | null>(null);
  const [activeVoiceText, setActiveVoiceText] = useState('403 BYPASS 유니버설 안내 및 탐색 센터에 오신 것을 환영합니다.');

  // Settings states
  const [fontScale, setFontScale] = useState(1.2);
  const [highContrast, setHighContrast] = useState(false);
  const [themeMode, setThemeMode] = useState<'system' | 'dark' | 'light'>('system');
  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
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

  // Phone launcher simulation states
  const [isAppLaunched, setIsAppLaunched] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [phoneTime, setPhoneTime] = useState('오후 12:00');
  const [phoneDate, setPhoneDate] = useState('5월 27일');
  const [phoneDayOfWeek, setPhoneDayOfWeek] = useState('(수)');
  const [homeNotification, setHomeNotification] = useState<string | null>(null);

  // Live time ticker for simulated phone
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? '오후' : '오전';
      hours = hours % 12 || 12;
      setPhoneTime(`${ampm} ${hours}:${minutes}`);
      
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      setPhoneDate(`${now.getMonth() + 1}월 ${now.getDate()}일`);
      setPhoneDayOfWeek(`(${days[now.getDay()]})`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerHomeNotification = (msg: string) => {
    setHomeNotification(msg);
    handleAnnounce(`${t("안내:")} ${msg}`);
    setTimeout(() => {
      setHomeNotification((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleLaunchApp = () => {
    setIsLaunching(true);
    handleAnnounce(t("403 BYPASS 앱을 구동합니다. 전산 인프라 및 단말 보안 상태를 점검 중입니다."));
    setTimeout(() => {
      setIsAppLaunched(true);
      setIsLaunching(false);
      handleAnnounce(currentUser 
        ? t("403 BYPASS 홈 화면 맞춤 추천 공연과 보도 안내맵 환경을 시작합니다.") 
        : t("403 BYPASS 앱 구동 완료. 안전 식별 및 우회 통행 로그인 시스템을 기동합니다.")
      );
    }, 1200);
  };

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

  // Synchronize dynamic dark/light mode according to user selection or system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applySelectedTheme = () => {
      let shouldBeDark = true;
      if (themeMode === 'system') {
        shouldBeDark = mediaQuery.matches;
      } else {
        shouldBeDark = (themeMode === 'dark');
      }
      
      setIsSystemDark(shouldBeDark);
      
      if (shouldBeDark) {
        document.body.classList.remove('light-mode');
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.body.classList.add('light-mode');
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    };

    applySelectedTheme();

    const handler = () => {
      if (themeMode === 'system') {
        applySelectedTheme();
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [themeMode]);

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
    setSelectedShowDetail(null);
    let bannerMsg = '';
    if (tabId === 'home') bannerMsg = '홈 화면. 선호 장르별 보편적 맞춤 추천 공연과 서포터즈 정보를 전달합니다.';
    else if (tabId === 'mobility') bannerMsg = '안내맵 화면. 실시간 층별 혼잡도 상황과 스마트 수어 카메라, S-MAP 3D 공간 도면을 탐색합니다.';
    else if (tabId === 'visibility') bannerMsg = '매칭예약 화면. 1대1 현장 안심 보조 헬퍼 배정 및 스마트 다자막 글래스 특수 대기열 예약을 신청합니다.';
    else if (tabId === 'tickets') bannerMsg = '나의 티켓 화면. 나의 다가올 관람권 바코드와 지체 장애인 관람 환불 보증서, 교통 가이드를 담았습니다.';
    else if (tabId === 'profile') bannerMsg = '마이페이지 화면. 내 고유 무벽 뱃지 정보와 다녀온 극장들의 시설 실사용 점검 후기 로그를 관리합니다.';
    
    handleAnnounce(bannerMsg);
  };

  // Data operations
  const handleLoginSuccess = (userObj: UserProfile) => {
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
    <div className="min-h-screen w-full bg-[#05070c] flex flex-col md:flex-row items-center justify-center p-3 sm:p-6 lg:p-8 font-sans antialiased text-slate-100 select-none relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute w-[450px] h-[450px] rounded-full bg-blue-900/10 blur-[100px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-900/5 blur-[120px] -bottom-30 -right-30 pointer-events-none" />

      {/* Side Content Panel (Visible on Desktop Screen devices) */}
      <div className="hidden lg:flex flex-col max-w-[340px] mr-10 text-left space-y-5 z-10 select-text">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-wider uppercase w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span>UNIVERSAL SANDBOX SIMULATOR</span>
        </div>
        
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight leading-none mb-1.5">
            403 BYPASS<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 text-xl font-extrabold">{t("무장벽 모빌리티")}</span>
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed">
            {t("모두가 불편함 없이 공연을 즐길 수 있도록 돕는 배리어프리 공연 관람 서비스입니다.")}
          </p>
        </div>

        {/* Major Features list */}
        <div className="space-y-1.5 border-t border-slate-800/40 pt-4">
          <h4 className="text-[10.5px] font-black text-slate-355 tracking-wider uppercase text-blue-400">{t("주요 기능")}</h4>
          <ul className="space-y-1.5 text-[11.5px] text-slate-400">
            <li className="flex items-center gap-1.5">
              <span className="text-blue-400/80">•</span>
              <span>{t("3D 공연장 안내지도")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-blue-400/80">•</span>
              <span>{t("AR 길 안내")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-blue-400/80">•</span>
              <span>{t("실시간 혼잡 정보 확인")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-blue-400/80">•</span>
              <span>{t("동행 지원 기능")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-blue-400/80">•</span>
              <span>{t("360도 공연장 미리보기")}</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-blue-400/80">•</span>
              <span>{t("AR 자막안경 기능")}</span>
            </li>
          </ul>
          <p className="text-[11px] text-slate-500 pt-1 font-medium italic">
            {t("다양한 기능을 직접 체험해 보세요.")}
          </p>
        </div>
        
        <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-2.5">
          <h4 className="text-[11px] font-black text-slate-300 tracking-wider uppercase">{t("사용법 안내")}</h4>
          <ul className="space-y-2 text-[11px] sm:text-[11.5px] text-slate-400 leading-normal pl-0">
            <li className="flex items-start gap-1 pb-1.5 border-b border-slate-850/30">
              <span className="text-blue-400 shrink-0 font-extrabold pr-0.5">①</span>
              <span>{t("스마트폰 화면 중앙의 403 BYPASS 아이콘을 눌러 체험을 시작합니다.")}</span>
            </li>
            <li className="flex items-start gap-1 pb-1.5 border-b border-slate-850/30">
              <span className="text-blue-400 shrink-0 font-extrabold pr-0.5">②</span>
              <span>{t("원하는 기능을 선택하여 자유롭게 체험해 보세요.")}</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-blue-400 shrink-0 font-extrabold pr-0.5">③</span>
              <span>{t("오른쪽의 접근성 센터에서 글자 크기와 화면 설정을 조절할 수 있습니다.")}</span>
            </li>
          </ul>
        </div>

        <div className="flex items-center space-x-1.5 text-zinc-500 text-[10px] font-mono select-none pt-1">
          <span>SECURE APP NODE v3.5.0</span>
          <span>•</span>
          <span>SYSTEM CALM</span>
        </div>
      </div>

      {/* 2. Interactive Mobile Device Frame wrapper */}
      <div className="relative w-full max-w-[400px] h-[820px] max-h-[94vh] sm:rounded-[52px] sm:border-[12px] sm:border-slate-900 sm:shadow-[0_24px_55px_-12px_rgba(0,0,0,0.85)] bg-slate-950 flex flex-col overflow-hidden">
        
        {/* Status Bar */}
        <div 
          onClick={() => {
            if (isAppLaunched) {
              setIsAppLaunched(false);
              handleAnnounce("403 BYPASS 앱을 잠시 닫고 멀티태스킹 단말 홈 화면으로 복귀하였습니다.");
            }
          }}
          className={`h-8 px-5 flex items-center justify-between text-[11px] font-sans font-bold z-50 text-slate-300 select-none bg-black/10 relative shrink-0 ${isAppLaunched ? 'cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors' : ''}`}
          title={isAppLaunched ? "클릭 시 스마트폰 홈 화면으로 나갑니다" : ""}
        >
          <span>{phoneTime.replace(/오전 |오후 /, '')}</span>
          {/* Dynamic Island style Notch */}
          <div className="w-24 h-[18px] bg-black rounded-full absolute left-1/2 -to-1.5 -translate-x-1/2 top-1.5 flex items-center justify-center overflow-hidden border border-slate-900/50 z-50">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900/90 border border-zinc-800 absolute right-4" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px]">5G</span>
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px]">98%</span>
              <div className="w-5 h-2.5 rounded-sm border border-current p-0.5 flex items-center opacity-80">
                <div className="h-full w-[85%] bg-current rounded-2xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Home Screen (isAppLaunched = false) */}
        {!isAppLaunched && (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-indigo-950 to-blue-950 select-none overflow-hidden flex flex-col justify-between pt-8">
            {/* Ambient Background Glows */}
            <div className="absolute w-52 h-52 rounded-full bg-blue-500/10 blur-3xl -top-10 -left-10 animate-pulse pointer-events-none" />
            <div className="absolute w-56 h-56 rounded-full bg-cyan-400/5 blur-3xl bottom-10 right-10 pointer-events-none" />

            {/* Custom Sliding Home Notification Banner (simulated toast) */}
            {homeNotification && (
              <motion.div 
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                className="absolute top-10 left-3 right-3 p-3 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-xl z-50 flex items-start gap-2.5 text-left"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-1.5 shrink-0 animate-ping" />
                <div className="space-y-0.5 flex-1">
                  <h5 className="text-[10px] uppercase font-black text-blue-400 tracking-wider">{t("알림 센터 수신")}</h5>
                  <p className="text-[11px] font-medium text-slate-200 leading-normal">{t(homeNotification)}</p>
                </div>
              </motion.div>
            )}

            {/* Clock & Date Widget */}
            <div className="px-6 mt-10 text-center z-10">
              <h2 className="text-4xl font-extrabold tracking-tight text-white/95 font-sans drop-shadow-sm">
                {phoneTime.replace(/오전 |오후 /, '')}
              </h2>
              <p className="text-xs font-bold text-slate-300 mt-1.5 filter drop-shadow">
                {phoneDate} {phoneDayOfWeek}
              </p>
              
              {/* Event Widget */}
              <div className="mt-8 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between text-left">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                     <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-305">{t("오늘의 관람 날씨")}</span>
                  </div>
                  <p className="text-[14px] font-black font-sans text-white">{t("수원시 22°C")}</p>
                  <p className="text-[9px] text-cyan-400 font-bold">{t("배리어프리 지수 양호 🟢")}</p>
                </div>
                <div className="text-right leading-tight">
                  <span className="text-[9px] bg-cyan-500/25 text-cyan-300 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">
                    D-Day
                  </span>
                  <span className="text-[11px] font-black block mt-2 text-white">{t("무장벽제 투어")}</span>
                </div>
              </div>
            </div>

            {/* Launcher Apps Grid */}
            <div className="px-6 py-6 z-10">
              <div className="grid grid-cols-4 gap-x-3 gap-y-5">
                
                {/* Custom app icon for 403 BYPASS */}
                <button 
                  onClick={handleLaunchApp} 
                  className="flex flex-col items-center justify-center gap-1.5 col-span-1 focus:outline-none focus:ring-0 active:scale-90 transition-transform group"
                >
                  <div className="w-12 h-12 rounded-[14px] bg-black flex items-center justify-center shadow-[0_5px_15px_rgba(6,182,212,0.4)] relative border border-cyan-400/20 group-hover:scale-105 active:scale-95 transition-all overflow-hidden">
                    <img 
                      src={appLogo} 
                      alt="403 BYPASS App Icon" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute inset-0 rounded-[14px] border border-white/20 animate-pulse pointer-events-none z-10" />
                  </div>
                  <span className="text-[10px] font-black text-white text-center tracking-tight truncate w-full filter drop-shadow">
                    403 BYPASS
                  </span>
                </button>

                {/* S-MAP app icon */}
                <button 
                  onClick={() => triggerHomeNotification('S-MAP 실시간 3D 도면 기능은 403 BYPASS 앱 실행 후 [안내맵] 탭에서 구동할 수 있습니다.')} 
                  className="flex flex-col items-center justify-center gap-1.5 col-span-1 focus:outline-none focus:ring-0 active:scale-90 transition-transform group"
                >
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition-all">
                    <Map className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 text-center tracking-tight truncate w-full filter drop-shadow">
                    {t("보행 안내맵")}
                  </span>
                </button>

                {/* Matching Helper App */}
                <button 
                  onClick={() => triggerHomeNotification('1대1 매니저 동행 및 수어 상담 안심 예약은 403 BYPASS 앱을 먼저 실행하고 신청해 주십시오.')} 
                  className="flex flex-col items-center justify-center gap-1.5 col-span-1 focus:outline-none focus:ring-0 active:scale-90 transition-transform group"
                >
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition-all">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 text-center tracking-tight truncate w-full filter drop-shadow">
                    {t("예약 매칭")}
                  </span>
                </button>

                {/* AR Cam App Icon */}
                <button 
                  onClick={() => triggerHomeNotification('실시간 카메라 장애물 탐소 센싱 장치는 403 BYPASS 앱 내 전용 카메라 스코프에서 즉치 구동 전송됩니다.')} 
                  className="flex flex-col items-center justify-center gap-1.5 col-span-1 focus:outline-none focus:ring-0 active:scale-90 transition-transform group"
                >
                  <div className="w-12 h-12 rounded-[14px] bg-gradient-to-tr from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 active:scale-95 transition-all">
                    <Accessibility className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 text-center tracking-tight truncate w-full filter drop-shadow">
                    {t("안심 렌즈")}
                  </span>
                </button>

              </div>
            </div>

            {/* Bottom Dock */}
            <div className="mx-4 mb-6 p-3 rounded-[28px] bg-white/10 border border-white/5 backdrop-blur-xl flex items-center justify-around z-10 shadow-lg">
              <button 
                onClick={() => triggerHomeNotification('비상 전산 상담국 연결 준비 완료 상태입니다.')} 
                className="focus:outline-none focus:ring-0 active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#34C759] flex items-center justify-center shadow">
                  <Phone className="w-5 h-5 text-white" />
                </div>
              </button>
              <button 
                onClick={() => triggerHomeNotification('실시간 무장벽 예술 포럼 채널은 현재 점검 동화 중입니다.')} 
                className="focus:outline-none focus:ring-0 active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#00E5FF] flex items-center justify-center shadow">
                  <Compass className="w-5 h-5 text-slate-950" />
                </div>
              </button>
              <button 
                onClick={() => triggerHomeNotification('서포터 1대1 무벽 안심 메신저 보드가 승인 준비 중입니다.')} 
                className="focus:outline-none focus:ring-0 active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 rounded-2xl bg-amber-400 flex items-center justify-center shadow">
                  <MessageSquare className="w-5 h-5 text-slate-800" />
                </div>
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)} 
                className="focus:outline-none focus:ring-0 active:scale-95 transition-transform"
              >
                <div className="w-11 h-11 rounded-2xl bg-zinc-700/80 border border-zinc-650 flex items-center justify-center shadow">
                  <Settings className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Launch screen loading splash */}
        {isLaunching && (
          <div className="absolute inset-0 bg-[#0B0F19] z-50 flex flex-col items-center justify-center select-none text-center">
            <div className="space-y-6">
              <div className="relative flex items-center justify-center mx-auto">
                <div className="absolute w-20 h-20 rounded-full bg-cyan-500/20 animate-ping pointer-events-none" />
                <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                  <span className="text-white font-black text-xl tracking-wide">403</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-white tracking-widest">403 BYPASS</h3>
                <p className="text-[10px] text-cyan-400 font-bold tracking-wider uppercase flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  CONNECTING SYSTEM NODE...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. The Main App Inner Container (isAppLaunched = true) */}
        {isAppLaunched && (
          <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-colors duration-300 ${highContrast ? 'high-contrast-mode bg-black' : 'bg-[#0B0F19]'}`}>
            
            {/* Scrollable Main Area representing the original page */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 relative select-text scrollbar-none h-[calc(100%-32px)]">
              {/* 1. Login session barrier */}
              {!currentUser ? (
                <LoginPortal
                  onLoginSuccess={handleLoginSuccess}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  highContrast={highContrast}
                />
              ) : (
                /* Tab content inside custom main */
                <main className="w-full px-4 py-4 space-y-4">
                  {selectedShowDetail ? (
                    <ShowDetailView
                      show={selectedShowDetail}
                      onBack={() => setSelectedShowDetail(null)}
                      highContrast={highContrast}
                      onAnnounce={handleAnnounce}
                    />
                  ) : (
                    <>
                      {activeTab === 'home' && (
                        <HomeTab
                          currentUser={currentUser}
                          onShowSelect={(show) => {
                            setSelectedShowDetail(show);
                            handleAnnounce(`선택하신 추천 공연 [${show.title}]의 무장벽 통합 시야 검측 상세 뷰포트를 활성화하였습니다.`);
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
                    </>
                  )}
                </main>
              )}
            </div>

            {/* Simulated Bottom App Navigation Bar */}
            {currentUser && !selectedShowDetail && (
              <nav className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-900/90 backdrop-blur transition-colors duration-200">
                <div className="py-2.5 px-1 flex items-center justify-around">
                  <button
                    onClick={() => handleTabChange('home')}
                    className={`nav-tab-btn flex flex-col items-center justify-center py-1 px-2 text-[10px] font-bold transition-all cursor-pointer ${
                      activeTab === 'home' ? 'text-blue-500' : 'text-slate-400'
                    }`}
                  >
                    <Home className="w-5 h-5 mb-0.5" />
                    <span>{t("홈")}</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('mobility')}
                    className={`nav-tab-btn flex flex-col items-center justify-center py-1 px-2 text-[10px] font-bold transition-all cursor-pointer ${
                      activeTab === 'mobility' ? 'text-blue-500' : 'text-slate-400'
                    }`}
                  >
                    <Map className="w-5 h-5 mb-0.5" />
                    <span>{t("안내맵")}</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('visibility')}
                    className={`nav-tab-btn flex flex-col items-center justify-center py-1 px-2 text-[10px] font-bold transition-all cursor-pointer ${
                      activeTab === 'visibility' ? 'text-blue-500' : 'text-slate-400'
                    }`}
                  >
                    <Calendar className="w-5 h-5 mb-0.5" />
                    <span>{t("매칭예약")}</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('tickets')}
                    className={`nav-tab-btn flex flex-col items-center justify-center py-1 px-2 text-[10px] font-bold transition-all cursor-pointer ${
                      activeTab === 'tickets' ? 'text-blue-500' : 'text-slate-400'
                    }`}
                  >
                    <Ticket className="w-5 h-5 mb-0.5" />
                    <span>{t("나의티켓")}</span>
                  </button>

                  <button
                    onClick={() => handleTabChange('profile')}
                    className={`nav-tab-btn flex flex-col items-center justify-center py-1 px-2 text-[10px] font-bold transition-all cursor-pointer ${
                      activeTab === 'profile' ? 'text-blue-500' : 'text-slate-400'
                    }`}
                  >
                    <User className="w-5 h-5 mb-0.5" />
                    <span>{t("마이")}</span>
                  </button>
                </div>
              </nav>
            )}

            {/* Accessibility Floating Button */}
            {currentUser && (
               <div className="absolute bottom-18 right-4 z-40">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] rounded-full shadow-lg border border-blue-500/20 active:scale-95 transition-all cursor-pointer relative"
                  aria-label={t("접근성 센터 설정")}
                >
                  <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                  <span className="font-sans font-bold">{t("접근성센터")}</span>
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                </button>
              </div>
            )}

          </div>
        )}



      </div>

      {/* 5. Real Overlay Modals */}
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
        themeMode={themeMode}
        onThemeModeChange={(mode) => {
          setThemeMode(mode);
          if (mode === 'system') {
            handleAnnounce("화면 모드가 기기 설정에 맞춤으로 자동 전환됩니다.");
          } else if (mode === 'dark') {
            handleAnnounce("다크 모드로 화면 테마가 수동 지정되어 고정되었습니다.");
          } else {
            handleAnnounce("라이트 모드로 화면 테마가 수동 지정되어 고정되었습니다.");
          }
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
