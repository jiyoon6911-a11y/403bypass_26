import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Accessibility, Settings, Mail, Lock, User, Info } from 'lucide-react';

interface LoginPortalProps {
  onLoginSuccess: (user: { email: string; name: string; userId: string; role: string }) => void;
  onOpenSettings: () => void;
  highContrast: boolean;
}

export default function LoginPortal({ onLoginSuccess, onOpenSettings, highContrast }: LoginPortalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [emailLogin, setEmailLogin] = useState('');
  const [passwordLogin, setPasswordLogin] = useState('');

  // Signup fields
  const [signupId, setSignupId] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('장애인 당사자');

  // Verification fields
  const [isSentCode, setIsSentCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userEnteredCode, setUserEnteredCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(180);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSentCode && timer > 0 && !isVerified) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSentCode, timer, isVerified]);

  const handleGoogleQuickLogin = () => {
    // Simulates quick account detect
    const quickEmail = "jiyoon6911@gmail.com";
    const userObj = {
      email: quickEmail,
      name: "지윤",
      userId: "jiyoon_403",
      role: "장애인 당사자"
    };
    
    localStorage.setItem(`user_profile_${quickEmail}`, JSON.stringify(userObj));
    localStorage.setItem('bypass_logged_in_user', JSON.stringify(userObj));
    onLoginSuccess(userObj);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailLogin.trim() || !passwordLogin) return;

    const savedProfile = localStorage.getItem(`user_profile_${emailLogin.trim()}`);
    if (!savedProfile) {
      alert("가입되지 않은 이메일 주소입니다. 회원가입 탭에서 신규 등록해 주십시오.");
      return;
    }

    const userObj = JSON.parse(savedProfile);
    if (userObj.password && userObj.password !== passwordLogin) {
      alert("비밀번호가 일치하지 않습니다. 다시 입력해 주십시오.");
      return;
    }

    localStorage.setItem('bypass_logged_in_user', JSON.stringify(userObj));
    onLoginSuccess(userObj);
  };

  const sendEmailCode = () => {
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      alert("정상적인 메일 주소를 먼저 입력해 주십시오.");
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setIsSentCode(true);
    setTimer(180);
    setIsVerified(false);
    alert(`📩 [BYPASS GATEWAY]\n보안 메일 시스템을 통해 [${signupEmail}] 주소로 6자리 인증 메일을 가상 발송 완료했습니다.`);
  };

  const handleVerifyCode = () => {
    if (userEnteredCode === verificationCode && timer > 0) {
      setIsVerified(true);
      alert("이메일 진위 확인이 성공 완료되었습니다!");
    } else {
      alert("인증번호가 일치하지 않습니다. 다시 올바르게 기재해 주십시오.");
    }
  };

  const autoFillDemoCode = () => {
    setUserEnteredCode(verificationCode);
  };

  const handleManualSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedId = signupId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!formattedId || !signupName.trim() || !signupEmail.trim() || !signupPassword) return;

    if (!isVerified) {
      alert("🚫 이메일 실재성 인증(인증번호 발송 및 점검 확인)을 먼저 완료해주셔야 회원 가입처리가 완료됩니다.");
      return;
    }

    const existing = localStorage.getItem(`user_profile_${signupEmail}`);
    if (existing) {
      alert("이미 사용 중인 이메일 주소입니다. 해당 계정으로 로그인해주시기 바랍니다.");
      return;
    }

    const newUser = {
      userId: formattedId,
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword,
      role: signupRole
    };

    localStorage.setItem(`user_profile_${signupEmail}`, JSON.stringify(newUser));
    localStorage.setItem('bypass_logged_in_user', JSON.stringify(newUser));
    onLoginSuccess(newUser);
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
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block hc-text-mute">Google 간편 로그인 추천</span>
              <button
                onClick={handleGoogleQuickLogin}
                className="w-full py-3 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all focus:ring-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>jiyoon6911@gmail.com 계정으로 즉시 시작</span>
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
                className="hc-button-primary w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 transition-all"
              >
                로그인 완료
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
                    disabled={isVerified}
                    onClick={sendEmailCode}
                    className="text-[11px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/30 px-3 py-2 rounded-xl hover:bg-blue-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0 hc-button-secondary"
                  >
                    인증번호 전송
                  </button>
                </div>
              </div>

              {/* Email Verification Form */}
              {isSentCode && (
                <div className="space-y-1.5 border border-slate-800/60 p-3 rounded-2xl bg-slate-950/40 hc-card">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block hc-text">이메일 인증번호 입력</label>
                    <span className={`text-[10px] font-bold font-mono ${timer <= 30 ? 'text-red-500 animate-pulse' : 'text-blue-405'}`}>
                      {isVerified ? '인증 성공 ✅' : formatTime(timer)}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      disabled={isVerified}
                      value={userEnteredCode}
                      onChange={(e) => setUserEnteredCode(e.target.value)}
                      placeholder="6자리 번호"
                      maxLength={6}
                      className="flex-1 text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 tracking-widest text-center font-bold font-mono focus:border-blue-500 focus:outline-none hc-card"
                    />
                    <button
                      type="button"
                      disabled={isVerified}
                      onClick={handleVerifyCode}
                      className="text-[10px] font-bold text-white bg-blue-600 px-3.5 py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all whitespace-nowrap shrink-0 hc-button-primary"
                    >
                      {isVerified ? '완료' : '인증 확인'}
                    </button>
                  </div>

                  {!isVerified && (
                    <div className="text-[9px] text-yellow-400 font-bold p-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-between gap-1 mt-1">
                      <span>📧 [가상 알림] 인증코드: <span className="font-mono text-xs text-white">{verificationCode}</span></span>
                      <button
                        type="button"
                        onClick={autoFillDemoCode}
                        className="text-[8px] bg-yellow-405 text-slate-950 px-1.5 py-0.5 rounded font-black hover:bg-yellow-300 transition-all font-sans"
                      >
                        자동입력
                      </button>
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
                <div class="grid grid-cols-3 gap-1.5">
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
