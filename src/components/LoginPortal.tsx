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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

interface LoginPortalProps {
  onLoginSuccess: (user: { email: string; name: string; userId: string; role: string }) => void;
  onOpenSettings: () => void;
  highContrast: boolean;
}

export default function LoginPortal({ onLoginSuccess, onOpenSettings, highContrast }: LoginPortalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Signup fields
  const [signupId, setSignupId] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('장애인 당사자');

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

      let userObj;
      if (snap && snap.exists()) {
        userObj = snap.data();
      } else {
        const defaultId = emailStr.split('@')[0].replace(/[^a-z0-9_]/g, '');
        userObj = {
          userId: defaultId,
          name: fUser.displayName || '무명 무벽 관객',
          email: emailStr,
          role: '장애인 당사자',
        };
        try {
          await setDoc(docRef, userObj);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${emailStr}`);
        }
      }

      localStorage.setItem(`user_profile_${emailStr}`, JSON.stringify(userObj));
      localStorage.setItem('bypass_logged_in_user', JSON.stringify(userObj));
      onLoginSuccess(userObj as any);
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
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, emailLogin.trim(), passwordLogin);
      const fUser = userCredential.user;

      // 2. Load Firestore account
      const docRef = doc(db, 'users', emailLogin.trim());
      let snap;
      try {
        snap = await getDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${emailLogin.trim()}`);
      }

      let userObj;
      if (snap && snap.exists()) {
        userObj = snap.data();
      } else {
        const defaultId = emailLogin.split('@')[0].replace(/[^a-z0-9_]/g, '');
        userObj = {
          userId: defaultId,
          name: fUser.displayName || '무명 무벽 관객',
          email: emailLogin.trim(),
          role: '장애인 당사자',
        };
        try {
          await setDoc(docRef, userObj);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${emailLogin.trim()}`);
        }
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

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedId = signupId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!formattedId || !signupName.trim() || !signupEmail.trim() || !signupPassword) return;

    if (!isVerified) {
      alert("🚫 본인 확인을 위해 실제 메일함의 링크를 클릭한 후, [실제 이메일 인증 완료 확인] 과정을 거쳐 주십시오.");
      return;
    }

    setIsLoading(true);
    try {
      const newUser = {
        userId: formattedId,
        name: signupName.trim(),
        email: signupEmail.trim(),
        role: signupRole
      };

      // Save user record to Firestore
      const docRef = doc(db, 'users', signupEmail.trim());
      try {
        await setDoc(docRef, newUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${signupEmail.trim()}`);
      }

      localStorage.setItem(`user_profile_${signupEmail.trim()}`, JSON.stringify(newUser));
      localStorage.setItem('bypass_logged_in_user', JSON.stringify(newUser));
      onLoginSuccess(newUser);
    } catch (error) {
      console.error('Firebase profile save error:', error);
      alert('회원가입 프로필 저장에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
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
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 pb-2.5 text-center text-xs font-black transition-all ${
                mode === 'login' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 pb-2.5 text-center text-xs font-bold transition-all ${
                mode === 'signup' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              회원가입
            </button>
          </div>

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

              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block hc-text-mute">Google 간편 로그인</span>
              <button
                onClick={handleGoogleQuickLogin}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
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
                <span>Google 계정으로 즉시 로그인</span>
              </button>
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
          ) : (
            <form onSubmit={handleManualSignup} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">고유 사용자 ID / 핸들 (영문/숫자)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-slate-500 font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={signupId}
                    onChange={(e) => setSignupId(e.target.value)}
                    placeholder="universal01"
                    className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 pl-7 pr-3 py-2.5 focus:border-blue-500 focus:outline-none hc-card"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">이름 / 닉네임</label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="장벽없는관객"
                  className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-blue-500 focus:outline-none hc-card"
                />
              </div>

              <div className="space-y-1">
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
              </div>

              {/* Email Verification Form */}
              {isSentCode && (
                <div className="space-y-3 border border-slate-800/60 p-3.5 rounded-2xl bg-slate-950/40 hc-card text-left">
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">이메일 링크 인증 상태</label>
                    <span className={`text-[10px] font-bold font-mono ${isVerified ? 'text-emerald-400' : 'text-cyan-400 animate-pulse'}`}>
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
                      <p className="text-xs text-emerald-400 font-extrabold">🎉 이메일 소유권 인증에 대성공하였습니다!</p>
                      <p className="text-[10px] text-zinc-400 font-medium mt-0.5">하단의 비밀번호 및 유형 선택 후 회원등록을 마쳐주세요.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">비밀번호 비밀키</label>
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

              {/* Barriers selector role */}
              <div className="space-y-1.5 pt-1 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">보편적 지원 및 관람 유형</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSignupRole('장애인 당사자')}
                    className={`py-1.5 text-[9px] font-bold rounded-lg border text-center transition-all ${
                      signupRole === '장애인 당사자'
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    ♿ 동행/가이드 희망
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('서포터즈')}
                    className={`py-1.5 text-[9px] font-bold rounded-lg border text-center transition-all ${
                      signupRole === '서포터즈'
                        ? 'border-green-500/30 bg-green-500/10 text-green-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    🤝 보조 서포터
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole('일반')}
                    className={`py-1.5 text-[9px] font-bold rounded-lg border text-center transition-all ${
                      signupRole === '일반'
                        ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    🎭 일반 관람인
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="hc-button-primary w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-black shadow-lg transition-all"
              >
                회원 등록 및 즉시 로그인
              </button>
            </form>
          )}
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
