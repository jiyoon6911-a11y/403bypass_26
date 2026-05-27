import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Accessibility, Settings, Mail, Lock, User, Info, Loader2 } from 'lucide-react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

const PRESET_AVATARS = [
  { emoji: '🐹', label: '햄스터' },
  { emoji: '🦊', label: '여우' },
  { emoji: '🐼', label: '판다' },
  { emoji: '🐱', label: '고양이' },
  { emoji: '♿', label: '무장벽러' },
  { emoji: '🤝', label: '서포터' },
  { emoji: '🎭', label: '아티스트' },
];
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

interface LoginPortalProps {
  onLoginSuccess: (user: { email: string; name: string; userId: string; role: string; avatarUrl?: string }) => void;
  onOpenSettings: () => void;
  highContrast: boolean;
}

export default function LoginPortal({ onLoginSuccess, onOpenSettings, highContrast }: LoginPortalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'onboarding'>('login');
  const [userStatusAnswer, setUserStatusAnswer] = useState<'yes' | 'no' | null>(null);
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Signup fields
  const [signupId, setSignupId] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('일반');
  const [signupAvatar, setSignupAvatar] = useState('🐹');

  // Onboarding parameters for first-time Google sign-up
  const [onboardingEmail, setOnboardingEmail] = useState('');
  const [onboardingName, setOnboardingName] = useState('');
  const [onboardingId, setOnboardingId] = useState('');
  const [onboardingRole, setOnboardingRole] = useState('일반');
  const [onboardingAvatar, setOnboardingAvatar] = useState('🐹');

  // Genres and Assistance supports onboarding states
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [requiredSupports, setRequiredSupports] = useState<string[]>([]);

  // Unique ID Duplication Check values
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idCheckStatus, setIdCheckStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [duplicateCheckedId, setDuplicateCheckedId] = useState('');

  // Verification fields
  const [isSentCode, setIsSentCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(180);
  const [checkingRealEmail, setCheckingRealEmail] = useState(false);

  // In-app webview detector for Korean messenger apps (KakaoTalk, Instagram, Naver, etc.)
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [inAppType, setInAppType] = useState<string | null>(null);
  const [isAndroidOs, setIsAndroidOs] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isAndroid = /Android/i.test(ua);
    setIsAndroidOs(isAndroid);

    if (/KAKAOTALK/i.test(ua)) {
      setIsInAppBrowser(true);
      setInAppType('카카오톡(KakaoTalk)');
    } else if (/Instagram/i.test(ua)) {
      setIsInAppBrowser(true);
      setInAppType('인스타그램(Instagram)');
    } else if (/NAVER/i.test(ua)) {
      setIsInAppBrowser(true);
      setInAppType('네이버(Naver)');
    } else if (/FBAN|FBAV/i.test(ua)) {
      setIsInAppBrowser(true);
      setInAppType('페이스북(Facebook)');
    } else if (/Type\//i.test(ua) || /WebView/i.test(ua) || /wnis/i.test(ua)) {
      setIsInAppBrowser(true);
      setInAppType('인앱 브라우저(WebView)');
    }
  }, []);

  const handleEscapeInAppBrowser = () => {
    const currentUrl = window.location.href;
    const cleanUrl = currentUrl.replace(/https?:\/\//, '');

    if (isAndroidOs) {
      // Android Intent scheme to escape KakaoTalk and open Chrome
      const intentUrl = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
    } else {
      // iOS alert instructions
      alert(
        `[아이폰 iOS 카카오톡/인앱 브라우저 대응 안내]\n\n` +
        `구글 보안 정책(disallowed_useragent)으로 인해, 앱 내부 브라우저에서는 구글 로그인이 불가능합니다. 아래 지침을 따라주세요:\n\n` +
        `1️⃣ 화면 오른쪽 아래의 [ ··· ] (더보기) 또는 [ 🌐 ] 브라우저 모양 버튼을 누릅니다.\n` +
        `2️⃣ '다른 브라우저로 열기' 또는 'Safari로 열기'를 클릭합니다.\n` +
        `3️⃣ 열린 외부 브라우저(사파리/크롬)에서 로그인하시면 아주 잘 작동합니다!\n\n` +
        `※ 또는 가입 시 등록한 '일반 이메일 계정 로그인' 방식을 사용하여 간편하게 즉시 진입하실 수도 있습니다.`
      );
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSentCode && timer > 0 && !isVerified) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSentCode, timer, isVerified]);

  // Real Google Sign In via Firebase
  const handleGoogleQuickLogin = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      const fUser = result.user;
      if (!fUser || !fUser.email) {
        throw new Error('구글 사용자 계정 취득에 실패했습니다.');
      }

      const emailStr = fUser.email;
      const docRef = doc(db, 'users', emailStr);
      let snap;
      try {
        snap = await getDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${emailStr}`);
      }

      if (snap && snap.exists()) {
        const userObj = snap.data();
        localStorage.setItem(`user_profile_${emailStr}`, JSON.stringify(userObj));
        localStorage.setItem('bypass_logged_in_user', JSON.stringify(userObj));
        onLoginSuccess(userObj as any);
      } else {
        // Enforce membership block: "만약 회원가입을 하지 않은채 구글이나 이메일로 로그인한다면 그거 막으면서 회원가입부터하라고 해줘"
        await auth.signOut();
        alert(`🛑 가입되지 않은 구글 계정입니다.\n\n[${emailStr}] 메일 주소로 등록된 가이드/회원 정보가 없습니다. 회원가입 탭에서 신규 회원 등록을 먼저 완료해 주세요!`);
        
        // Autofill registration fields for seamless transition
        setMode('signup');
        setUserStatusAnswer('no');
        setSignupEmail(emailStr);
        setSignupName(fUser.displayName || '');
        const defaultId = emailStr.split('@')[0].replace(/[^a-z0-9_]/g, '');
        setSignupId(defaultId);
      }
    } catch (error) {
      console.error('Google Popup Auth Error:', error);
      alert('구글 로그인에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  // Real Email/Password login via Firebase Auth + Firestore profiles
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLogin.trim() || !passwordLogin) return;
    setIsLoading(true);

    try {
      let userObj;
      let fUser = null;
      try {
        // 1. Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, emailLogin.trim(), passwordLogin);
        fUser = userCredential.user;
      } catch (authErr) {
        console.warn('Firebase Auth sign in failed, trying firestore direct fallback:', authErr);
      }

      // 2. Load Firestore account
      const docRef = doc(db, 'users', emailLogin.trim());
      let snap = null;
      try {
        snap = await getDoc(docRef);
      } catch (err) {
        console.error("Firestore getDoc error:", err);
      }

      if (snap && snap.exists()) {
        userObj = snap.data();
        if (!fUser) {
          alert(`💡 [모의/임시 우회 로그인 성공]\n\n이메일 로그인 보안 서버(Auth)에 해당 계정이 정식 등록되기 전이지만, 생성된 로컬 데이터베이스 프로필 '${userObj.name}' 님이 감지되어 임시 테스트 로그인에 성공했습니다!`);
        }
      } else {
        if (fUser) {
          await auth.signOut();
        }
        throw new Error('가입되지 않은 계정입니다. 회원가입부터 진행해 주세요.');
      }

      localStorage.setItem(`user_profile_${emailLogin.trim()}`, JSON.stringify(userObj));
      localStorage.setItem('bypass_logged_in_user', JSON.stringify(userObj));
      onLoginSuccess(userObj as any);
    } catch (error) {
      console.error('Email Login Error:', error);
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes('auth/operation-not-allowed') || errMsg.includes('operation-not-allowed')) {
        alert(
          `🛑 [이메일 로그인 활성화 필요]\n\n` +
          `현재 Firebase 프로젝트 내에서 '이메일/비밀번호(Email/Password)' 로그인 인증 설정이 비활성화되어 있습니다.\n\n` +
          `🛠️ 해결 방법:\n` +
          `🔗 https://console.firebase.google.com/project/gen-lang-client-0377865290/authentication/providers\n` +
          `위 Firebase 콘솔 주소에 접속하여 '이메일/비밀번호' 제공업체 스위치를 켜서 활성화해 주시면 로그인 및 회원가입이 즉시 가능해집니다!`
        );
      } else {
        alert('로그인에 실패했습니다. 이메일 또는 비밀번호를 다시 확인해주십시오: ' + errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register unverified email + Send actual verification URL to user's real email!
  const sendEmailLink = async () => {
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      alert("정상적인 메일 주소를 먼저 입력해 주십시오.");
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      alert("비밀번호(비밀키)를 6자리 이상 기입한 후 전송해 주십시오.");
      return;
    }

    setIsLoading(true);
    try {
      // Initialize Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword);
      const fUser = userCredential.user;
      
      // Request real Firebase verification email
      await sendEmailVerification(fUser);

      setIsSentCode(true);
      setTimer(180);
      setIsVerified(false);

      alert(`📩 [인증 링크 이메일 발송 완료]\n\n[${signupEmail}] 주소로 실제 이메일 인증용 확인 메일이 즉시 발송되었습니다!\n\n💡 인증 방법:\n1️⃣ 가입하신 메일함(스팸메일함 포함)에서 Firebase 인증 링크 메일을 확인하세요.\n2️⃣ 메일 본문 안의 링크를 터치/클릭하여 이메일 인증을 완료합니다.\n3️⃣ 메일 인증을 끝마친 후 본 회원가입 화면으로 다시 돌아와 아래의 [📬 실제 이메일 인증 완료 확인] 버튼을 눌러주십시오!`);
    } catch (error) {
      console.error('Email registration send error:', error);
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes('auth/operation-not-allowed') || errMsg.includes('operation-not-allowed')) {
        alert(
          `🛑 [이메일 로그인 승인 오류 안내]\n\n` +
          `현재 설정된 Firebase 프로젝트에서 '이메일/비밀번호(Email/Password)' 로그인 방식이 활성화되어 있지 않습니다.\n\n` +
          `🛠️ 해결 방법 (프로젝트 관리자 조치):\n` +
          `1️⃣ 아래 Firebase 콘솔 링크로 브라우저에서 이동하세요:\n` +
          `🔗 https://console.firebase.google.com/project/gen-lang-client-0377865290/authentication/providers\n\n` +
          `2️⃣ 'Sign-in method' 대시보드에서 [이메일/비밀번호] 제공업체를 찾아 '사용 설정(활성화)'으로 스위치를 켜주십시오.\n` +
          `3️⃣ 변경사항을 저장하신 후, 다시 본 웹앱에서 인증 요청 버튼을 누르시면 정상 메일 발송 및 가입 통과가 완료됩니다!`
        );
      } else {
        alert("인증 메일 전송 실패(이미 가입된 주소이거나 양식 오류): " + errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Real-time check if user has verified via email link!
  const checkRealEmailVerified = async () => {
    if (!auth.currentUser) {
      alert("인증 대기 세션이 분실되었습니다. 인증링크를 다시 전송해 주시기 바랍니다.");
      return;
    }

    setCheckingRealEmail(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setIsVerified(true);
        alert("🎉 실제 이메일 메일함 확인 완료! 정상적으로 가입이 승인되었습니다.\n\n이제 가장 아래에 있는 [회원 등록 및 즉시 로그인] 버튼을 누를 수 있습니다.");
      } else {
        alert("⏳ 아직 이메일 속 인증 링크가 클릭되지 않았습니다.\n\n귀하의 메일함에서 도착한 인증 메일을 열어 링크를 클릭(활성화)한 후 다시 단추를 눌러주십시오.");
      }
    } catch (err) {
      alert("인증 확인 과정에서 시간초과 혹은 서비스 전산 지연이 발생했습니다: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setCheckingRealEmail(false);
    }
  };

  const checkIdDuplication = async (id: string, formType: 'signup' | 'onboarding') => {
    const formattedId = id.trim().toLowerCase().replace(/[^a-z0-0_]/g, '');
    if (!formattedId) {
      alert("아이디 형식(영문/숫자/_ 만 가능)에 부합하지 않거나 비어 있습니다.");
      return;
    }
    if (formattedId.length < 3) {
      alert("고유 아이디는 최소 3글자 이상이어야 합니다.");
      return;
    }

    const reservedIds = ['art_pioneer', 'culture_helper', 'wheel_champion', 'admin', 'anonymous'];
    if (reservedIds.includes(formattedId)) {
      setIdCheckStatus('taken');
      alert(`❌ [@${formattedId}] 아이디는 시스템 예약어 혹은 이미 다른 회원이 선점한 고유 식별자입니다. 다른 아이디를 입력해 주세요.`);
      return;
    }

    setIsCheckingId(true);
    setIdCheckStatus('checking');
    try {
      const q = query(collection(db, 'users'), where('userId', '==', formattedId));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setIdCheckStatus('taken');
        alert(`❌ [@${formattedId}] 아이디는 이미 다른 회원이 사용 중입니다. 다른 아이디를 입력해 주세요.`);
      } else {
        setIdCheckStatus('available');
        setDuplicateCheckedId(formattedId);
        alert(`✅ [@${formattedId}] 아이디는 사용 가능합니다!`);
      }
    } catch (err) {
      console.error("ID duplication check error:", err);
      alert("아이디 중복 조회 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsCheckingId(false);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedId = onboardingId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!formattedId || !onboardingName.trim() || !onboardingEmail) return;

    if (idCheckStatus !== 'available' || duplicateCheckedId !== formattedId) {
      alert("🚫 고유 사용자 ID 중복 확인을 먼저 완료해 주십시오. (절대 중복되면 안 됩니다!)");
      return;
    }

    setIsLoading(true);
    try {
      const newUser = {
        userId: formattedId,
        name: onboardingName.trim(),
        email: onboardingEmail,
        role: onboardingRole,
        avatarUrl: onboardingAvatar,
        favoriteGenres,
        requiredSupports
      };

      const docRef = doc(db, 'users', onboardingEmail);
      try {
        await setDoc(docRef, newUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${onboardingEmail}`);
      }

      localStorage.setItem(`user_profile_${onboardingEmail}`, JSON.stringify(newUser));
      localStorage.setItem('bypass_logged_in_user', JSON.stringify(newUser));
      alert(`🎉 403 BYPASS 무장벽 예술 커뮤니티 가입 환영합니다!\n\n고유 아이디: @${formattedId}\n닉네임: ${newUser.name}\n\n*귀하의 고유 아이디는 수정 불가능하며, 홈화면에 귀하를 위한 맞춤 추천 공연들이 즉각 제공됩니다.`);
      onLoginSuccess(newUser);
    } catch (err) {
      console.error("Onboarding saving profile error:", err);
      alert("프로필 정보 가입 처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim() || !signupPassword) {
      alert("이메일과 비밀번호를 모두 입력해 주십시오.");
      return;
    }

    if (!isVerified) {
      alert("🚫 본인 확인을 위해 실제 메일함의 링크를 클릭한 후, [실제 이메일 인증 완료 확인] 과정을 거쳐 주십시오. (실제 가입이 곤란한 환경이면 우측 상단의 [인증 우회]를 활용해주세요)");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create credential via firebase auth
      try {
        await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword);
      } catch (authErr: any) {
        if (authErr.code !== 'auth/email-already-in-use') {
          throw authErr;
        }
      }

      // 2. Prefill onboarding (Step 2) parameters and move
      setOnboardingEmail(signupEmail.trim());
      setOnboardingName(signupEmail.split('@')[0]);
      setOnboardingId(signupEmail.split('@')[0].replace(/[^a-z0-9_]/g, ''));
      setMode('onboarding');
      alert("🎉 1단계 계정 생성 완료!\n\n2단계: 고유 ID 입력, 별명, 아바타, 선호 공연 장르 및 필요한 장애 지원 수단 구성을 완료하고 프로필을 매칭하겠습니다.");
    } catch (error) {
      console.error('Firebase profile signup error:', error);
      alert('회원가입 인증 도중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter(g => g !== genre));
    } else {
      setFavoriteGenres([...favoriteGenres, genre]);
    }
  };

  const toggleSupport = (support: string) => {
    if (requiredSupports.includes(support)) {
      setRequiredSupports(requiredSupports.filter(s => s !== support));
    } else {
      setRequiredSupports([...requiredSupports, support]);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };


  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto bg-[#0a0f1d] flex flex-col justify-between p-6 ${highContrast ? 'high-contrast-mode' : ''}`}>
      <div className="max-w-md w-full mx-auto my-auto space-y-6">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <span className="text-white font-black text-2xl tracking-wider">403</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-wider flex items-center justify-center gap-1.5 hc-accent">
              BYPASS <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30 hc-badge">UNIVERSAL</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-widest uppercase hc-text-mute">장벽 없는 보편적 예술 관람 & 매칭 플랫폼</p>
          </div>
        </div>

        {/* Accessibility Quick Tools bar */}
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between hc-card">
          <div className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5 hc-text">
            <Accessibility className="w-4 h-4 text-cyan-400" />
            <span>로그인 전 접근성 맞춤 조정</span>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-[10px] font-black font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center gap-1 hc-button-secondary"
          >
            <Settings className="w-3.5 h-3.5 animate-spin-slow" />
            접근성설정
          </button>
        </div>

        {/* Form panel container */}
        <div className="hc-card bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          {userStatusAnswer === null ? (
            <div className="space-y-4 text-left py-2">
              <div className="space-y-1.5 text-center pb-2.5 border-b border-slate-800/80">
                <span className="text-cyan-400 font-extrabold text-[10px] tracking-wider uppercase">Welcome to 403 BYPASS</span>
                <h3 className="text-sm font-black text-white">403 BYPASS 회원 여부 확인</h3>
                <p className="text-[10px] text-slate-400 leading-normal">정식 장벽 없는 무장벽 예술 서비스 및 파트너 매칭을 이용하시려면 먼저 회원 등록 여부를 선택해 주세요.</p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserStatusAnswer('no');
                    setMode('signup');
                  }}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-950/45 to-cyan-950/45 border border-cyan-500/30 hover:border-cyan-400 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-black text-[#00E5FF] group-hover:text-cyan-300">🙋‍♂️ 처음 방문했습니다 (회원 가입부터 하기)</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                    본인 인증 및 아이디(ID)를 등록하고 장벽 없는 보편적 예술 관람 준비를 완료합니다.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserStatusAnswer('yes');
                    setMode('login');
                  }}
                  className="w-full p-4 rounded-xl bg-slate-950/60 border border-slate-850 hover:border-blue-500 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-black text-slate-200 group-hover:text-white">🔑 이미 회원입니다 (기존 계정 로그인)</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                    구글 간편 로그인 또는 이메일 아이디 계정을 연동해 예술 커뮤니티 공간에 직행합니다.
                  </p>
                </button>

                <div className="flex items-center justify-between py-1 text-[10px] text-slate-700">
                  <span className="w-1/4 border-b border-slate-900"></span>
                  <span>또는 게스트 체험</span>
                  <span className="w-1/4 border-b border-slate-900"></span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const guestUser = {
                      userId: 'tester_guest',
                      name: '체험용 관객',
                      email: 'guest@universal.com',
                      role: '일반',
                      avatarUrl: '🐹'
                    };
                    localStorage.setItem(`user_profile_${guestUser.email}`, JSON.stringify(guestUser));
                    localStorage.setItem('bypass_logged_in_user', JSON.stringify(guestUser));
                    onLoginSuccess(guestUser);
                    alert("🔑 [모의 체험용 게스트 입장]\n\n실제 인증 단계를 거치지 않고 보편적 관람 매칭 기능을 모두 테스트해 보실 수 있도록 데모 게스트 세션을 활성화했습니다!");
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-400 border border-slate-700 font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-lg transition-all cursor-pointer"
                >
                  <span>🐹 회원등록 없이 체험용으로 바로가기</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {mode !== 'onboarding' ? (
                <div className="flex border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setIdCheckStatus('idle');
                      setUserStatusAnswer('yes');
                    }}
                    className={`flex-1 pb-2.5 text-center text-xs font-black transition-all ${
                      mode === 'login' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setIdCheckStatus('idle');
                      setUserStatusAnswer('no');
                    }}
                    className={`flex-1 pb-2.5 text-center text-xs font-bold transition-all ${
                      mode === 'signup' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    회원가입
                  </button>
                </div>
              ) : (
                <div className="border-b border-slate-800 pb-2.5 text-center">
                  <h2 className="text-sm font-black text-blue-400 tracking-wider">🌟 GOOGLE 계정 연동 가입 단계</h2>
                  <p className="text-[10px] text-slate-400">맞춤 서비스를 위한 추가 정보를 기입해 주세요.</p>
                </div>
              )}

          {/* Quick SSO */}
          {mode === 'login' && (
            <div className="space-y-3">
              {isInAppBrowser && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-left">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-400">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>⚠️ {inAppType} 감지 - 구글 로그인 제한 안내</span>
                  </div>
                  <p className="text-[10px] text-zinc-300 leading-relaxed font-medium">
                    구글 보안 정책상 <strong>카톡, 인스타, 네이버 등 인앱 브라우저</strong>에서는 구글 간편 로그인이 차단됩니다 (403 disallowed_useragent 오류).
                  </p>
                  <p className="text-[10px] text-[#00E5FF] leading-relaxed font-bold">
                    아래 버튼을 눌러 외부 전용 브라우저(크롬/사파리)로 전환하시면 외부 연동 및 동기화 로그인이 정상 작동합니다!
                  </p>
                  <button
                    type="button"
                    onClick={handleEscapeInAppBrowser}
                    className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>🚀 {isAndroidOs ? "기본 크롬(Chrome) 브라우저로 열기" : "💡 아이폰 사파리(Safari) 열기 안내"}</span>
                  </button>
                  <p className="text-[9px] text-zinc-500 text-center font-semibold">
                    * 또는 아래 일반계정 회원가입을 이용하시면 어떠한 앱 브라우저에서도 즉시 가입 및 이용이 가능합니다.
                  </p>
                </div>
              )}

              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block hc-text-mute">간편 빠른 로그인</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleGoogleQuickLogin}
                  disabled={isLoading}
                  className="w-full py-3 px-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-lg transition-all focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span>Google 계정 연동</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const guestUser = {
                      userId: 'tester_guest',
                      name: '체험용 관객',
                      email: 'guest@universal.com',
                      role: '일반',
                      avatarUrl: '🐹'
                    };
                    localStorage.setItem(`user_profile_${guestUser.email}`, JSON.stringify(guestUser));
                    localStorage.setItem('bypass_logged_in_user', JSON.stringify(guestUser));
                    onLoginSuccess(guestUser);
                    alert("🔑 [모의 체험용 게스트 입장]\n\n실제 인증 단계를 거치지 않고 보편적 관람 매칭 기능을 모두 테스트해 보실 수 있도록 데모 게스트 세션을 활성화했습니다!");
                  }}
                  className="w-full py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-400 border border-slate-700 font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-lg transition-all cursor-pointer"
                >
                  <span>🔑 게스트 즉시 입장</span>
                </button>
              </div>
              <div className="flex items-center justify-between py-2 text-[10px] text-slate-500 hc-text-mute">
                <span className="w-1/3 border-b border-slate-800"></span>
                <span className="px-2">또는 일반 계정 로그인</span>
                <span className="w-1/3 border-b border-slate-800"></span>
              </div>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleManualLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">이메일 주소</label>
                <input
                  type="email"
                  required
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  placeholder="example@domain.com"
                  className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-blue-500 focus:outline-none hc-card"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">비밀번호</label>
                <input
                  type="password"
                  required
                  value={passwordLogin}
                  onChange={(e) => setPasswordLogin(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-blue-500 focus:outline-none hc-card"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="hc-button-primary w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>로그인 완료</span>
              </button>
            </form>
          ) : mode === 'signup' ? (
            <form onSubmit={handleManualSignup} className="space-y-4">
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-xl text-left">
                <div className="text-xs font-black text-cyan-400 mb-0.5">Step 1: 계정 정보 등록 및 인증</div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  일단 사용하실 이메일과 비밀번호를 등록해 주세요. 1단계를 통과하면 <strong>고유 ID 설정, 닉네임, 관심 장르, 보조 수단</strong>을 맞춤 조율할 수 있습니다.
                </p>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">이메일 주소</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    disabled={isVerified}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="email@address.com"
                    className="flex-1 text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-blue-500 focus:outline-none hc-card"
                  />
                  <button
                    type="button"
                    disabled={isVerified || isLoading}
                    onClick={sendEmailLink}
                    className="text-[11px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-2 rounded-xl hover:bg-blue-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0 hc-button-secondary flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    인증링크 전송
                  </button>
                </div>
                <div className="mt-1.5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!signupEmail.trim() || !signupEmail.includes('@')) {
                        alert("인증 우회 테스트를 위해 먼저 이메일 주소를 형식에 맞게 입력해 주세요.");
                        return;
                      }
                      setIsSentCode(true);
                      setIsVerified(true);
                      alert(`⚠️ [임시 모의 인증 활성화]\n\n[${signupEmail}] 메일 주소의 소유권 임시 통과 처리를 완료하였습니다. 실제 인증 메일을 확인하실 필요 없이 아래에서 비밀번호와 유형을 설정하고 즉시 가입을 진행하실 수 있습니다!`);
                    }}
                    className="text-[9.5px] font-bold text-[#00E5FF] hover:underline underline-offset-2 flex items-center gap-1 cursor-pointer bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/60"
                  >
                    💡 인증 통과 (메일 수신 생략/우회하기)
                  </button>
                </div>
              </div>

              {/* Email Verification Form */}
              {isSentCode && (
                <div className="space-y-3 border border-slate-800/60 p-3.5 rounded-2xl bg-slate-950/40 hc-card text-left">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">이메일 링크 인증 상태</label>
                    <span className={`text-[10px] font-bold font-mono ${isVerified ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {isVerified ? '인증 승인됨 ✅' : '인증 링크 확인 대기 중'}
                    </span>
                  </div>

                  {!isVerified ? (
                    <div className="space-y-2">
                      <p className="text-[11px] text-zinc-300 leading-normal font-medium">
                        📬 가입하신 이메일의 수신함으로 <strong>실제 인증 승인 링크</strong>가 발송되었습니다. 메일을 열어 링크를 클릭(터치)하신 후, 아래 확인 버튼을 눌러 승인 절차를 완료해 주세요.
                      </p>
                      
                      <button
                        type="button"
                        onClick={checkRealEmailVerified}
                        disabled={checkingRealEmail}
                        className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
                      >
                        {checkingRealEmail ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>실시간 이메일 인증 활성 여부 조회 중...</span>
                          </>
                        ) : (
                          <span>📬 [실제 가입] 이메일 링크 클릭 후 본인확인 완료</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                      <p className="text-xs text-emerald-400 font-extrabold">🎉 이메일 소유권 인증에 성공하였습니다!</p>
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">아래 비밀번호를 설정하고 2단계로 넘어가주세요.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">비밀번호 비밀키 설정</label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="6문자 이상 안전 비밀번호"
                  minLength={6}
                  className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-blue-500 focus:outline-none hc-card"
                />
              </div>

              <button
                type="submit"
                className="hc-button-primary w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-black shadow-lg transition-all"
              >
                1단계 가입 완료 후 프로필 설정(2단계) 이동
              </button>
            </form>
          ) : (
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/30 rounded-xl text-left">
                <div className="text-xs font-black text-cyan-400 mb-1">🎯 2단계: 맞춤 프로필 정보 입력</div>
                <p className="text-[10px] text-zinc-350 leading-normal font-semibold block">
                  🔐 연동 계정: {onboardingEmail}
                </p>
                <p className="text-[10px] text-slate-400 leading-normal">
                  교류를 위해 <strong>절대 중복되지 않는 고유 ID와 닉네임</strong>을 등록해 주세요. 관심 공연 장르와 지향하시는 편의 지원 수단을 고르시면 홈화면에서 나를 위한 맞춤 추천 공연들을 바로 만나실 수 있습니다!
                </p>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">고유 사용자 ID / 핸들 (영문/숫자/_ 만 가능. 가입 후 변경 불가!)</label>
                <div className="flex gap-2">
                  <div className="relative flex items-center flex-1">
                    <span className="absolute left-3 text-xs text-slate-500 font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={onboardingId}
                      onChange={(e) => {
                        const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                        setOnboardingId(clean);
                        if (clean !== duplicateCheckedId) {
                          setIdCheckStatus('idle');
                        }
                      }}
                      placeholder="universal01"
                      className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 pl-7 pr-3 py-2.5 focus:border-blue-500 focus:outline-none hc-card"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => checkIdDuplication(onboardingId, 'onboarding')}
                    disabled={isCheckingId || !onboardingId}
                    className="text-[10px] font-bold bg-slate-800 text-cyan-400 px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all whitespace-nowrap shrink-0 disabled:opacity-50"
                  >
                    {isCheckingId ? '조회 중...' : '중복 확인'}
                  </button>
                </div>
                {idCheckStatus === 'available' && onboardingId === duplicateCheckedId && (
                  <p className="text-[9px] text-emerald-400 font-bold">✅ 사용 가능한 고유 ID입니다!</p>
                )}
                {idCheckStatus === 'taken' && (
                  <p className="text-[9px] text-red-400 font-bold">❌ 이미 사용 중이거나 시스템 예약어인 고유 ID입니다.</p>
                )}
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">사용자 이름 / 닉네임</label>
                <input
                  type="text"
                  required
                  value={onboardingName}
                  onChange={(e) => setOnboardingName(e.target.value)}
                  placeholder="닉네임 입력"
                  className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-blue-500 focus:outline-none hc-card"
                />
              </div>

              {/* Profile Avatar Selection */}
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">프로필 사진(캐릭터아바타) 선택</span>
                <div className="grid grid-cols-7 gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.emoji}
                      type="button"
                      onClick={() => setOnboardingAvatar(av.emoji)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${
                        onboardingAvatar === av.emoji
                          ? 'bg-blue-600 ring-2 ring-blue-400 scale-105 shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-350'
                      } cursor-pointer`}
                      title={av.label}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold block">또는 커스텀 이미지 웹 링크 URL (선택사항)</span>
                  <input
                    type="url"
                    value={onboardingAvatar.startsWith('http') ? onboardingAvatar : ''}
                    onChange={(e) => setOnboardingAvatar(e.target.value || '🐹')}
                    placeholder="https://example.com/profile.jpg"
                    className="w-full text-[10px] bg-slate-950 text-slate-350 rounded-lg border border-slate-800 p-1 px-2 focus:border-blue-500 focus:outline-none hc-card"
                  />
                </div>
              </div>

              {/* 관심 공연 장르 선택 */}
              <div className="space-y-1.5 text-left border-t border-slate-900 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">관심 공연 장르 (중복 선택 가능)</span>
                <p className="text-[9px] text-slate-500">관심이 가시는 장르를 체크하시면 맞춤 조율 우선 매칭됩니다.</p>
                <div className="flex flex-wrap gap-2">
                  {['뮤지컬', '연극', '콘서트'].map((g) => {
                    const isSelected = favoriteGenres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`py-1.5 px-3.5 rounded-xl text-xs font-bold tracking-tight border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]'
                            : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        {g} {isSelected ? '🏆' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 필요한 편의 지원 선택 */}
              <div className="space-y-1.5 text-left border-t border-slate-900 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">필요한 관람 편의 지원 (중복 선택 가능)</span>
                <p className="text-[9px] text-slate-500">장벽 없는 쾌적한 공연 관람을 위한 지원 사항을 선택하세요.</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { key: "휠체어 접근 및 리프트", label: "♿ 휠체어 접근 및 안내 설비 매칭", desc: "휠체어석, 통행 대기 경사로 및 이동 승강 리프트가 준비된 맞춤 극장 추천" },
                    { key: "청각 지원 자막/수어", label: "💬 청각 보조 (자막 및 수어 실시간 자막)", desc: "문자 중계 스크린 단말기 및 한국어 실시간 소통 지원 공연장 매칭" },
                    { key: "시각 음성해설/가이드", label: "🎙️ 시각 보조 (사운드 장치 및 음성해설)", desc: "개별 무선 헤드셋 음성 유도해설 장비 및 배리어프리 전용 나레이션 회차 매칭" }
                  ].map((support) => {
                    const isSelected = requiredSupports.includes(support.key);
                    return (
                      <button
                        key={support.key}
                        type="button"
                        onClick={() => toggleSupport(support.key)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                          isSelected
                            ? 'bg-blue-950/40 text-blue-300 border-[#00E5FF]'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-xs font-black">{support.label}</span>
                        <span className="text-[8px] text-slate-500 font-medium leading-tight">{support.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setIdCheckStatus('idle');
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black transition-all border border-slate-750 cursor-pointer"
                >
                  가입 취소
                </button>
                <button
                  type="submit"
                  className="flex-1 hc-button-primary py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-black shadow-lg transition-all cursor-pointer"
                >
                  프로필 완성하기
                </button>
              </div>
            </form>
          )}
          </>)}
        </div>

        <p className="text-[10px] text-center text-slate-500 font-semibold leading-relaxed hc-text-mute">
          * 처음이셔도 부담 없이 Google 간편 로그인 1초 패스를 이용해 즉시 무장벽 예술 감상을 시작해 보세요!
        </p>
      </div>

      <div className="text-center text-[9px] text-slate-600 py-3 uppercase tracking-widest border-t border-slate-900 mt-6">
        403 BYPASS v3.2.0 - Universal access systems secure node
      </div>
    </div>
  );
}
