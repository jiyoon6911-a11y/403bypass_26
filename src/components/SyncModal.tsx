import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, RefreshCw, Zap, CheckCircle, Loader2, Link } from 'lucide-react';
import { Ticket } from '../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: (newTicket: Ticket) => void;
  highContrast: boolean;
}

export default function SyncModal({
  isOpen,
  onClose,
  onSyncComplete,
  highContrast,
}: SyncModalProps) {
  const [provider, setProvider] = useState<'interpark' | 'yes24' | 'melon'>('interpark');
  const [username, setUsername] = useState('jiyoon6911');
  const [password, setPassword] = useState('••••••••');
  const [syncState, setSyncState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [progress, setProgress] = useState(15);
  const [statusTitle, setStatusTitle] = useState('예매처 터널 수립 중...');
  const [statusDesc, setStatusDesc] = useState('보안 계정 데이터베이스 인증 확인 및 핸드셰이크 수립');
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  const startScrapeSync = () => {
    if (!username.trim()) {
      alert("연동하고자 하는 예매처 아이디를 입력해주십시오.");
      return;
    }

    setSyncState('loading');
    setProgress(15);
    setStatusTitle('외부 예매 서버 보안 통로 정합 중...');
    setStatusDesc('가상 VPN 보안 인증 터널 설정 완료 및 안전 세션 수립 중');

    // Progression Mock
    setTimeout(() => {
      setProgress(55);
      setStatusTitle('API 에이전트 인증 인출 진행 중...');
      setStatusDesc(`${provider.toUpperCase()} 데이터베이스에서 인증 계정 검증 및 타사 예매 조회`);
    }, 1000);

    setTimeout(() => {
      setProgress(85);
      setStatusTitle('극장 대본 배리어프리 다자막 시나리오 결합 중...');
      setStatusDesc('극작 완고 배리어프리 다자막 시나리오 컴파일링 및 자막 안경 서버 연계');
    }, 2200);

    setTimeout(() => {
      setProgress(100);
      
      let newTicket: Ticket;
      if (provider === 'interpark') {
        newTicket = {
          id: 'EXT_INT_' + Math.floor(Math.random() * 9000 + 1000),
          provider: 'interpark',
          title: "뮤지컬 '베르테르' 휠체어석 접근 연계",
          place: "대학로 예스24 스테이지 1관",
          time: "2026. 06. 24 (수) 20:00",
          seat: "O열 휠체어지정석 D1"
        };
      } else if (provider === 'yes24') {
        newTicket = {
          id: 'EXT_YES_' + Math.floor(Math.random() * 9000 + 1000),
          provider: 'yes24',
          title: "연극 '에쿠우스' 배리어프리 특별회차",
          place: "대학로 예술극장 대극장",
          time: "2026. 06. 28 (일) 15:00",
          seat: "A열 3번 (접근성 전용 특성석)"
        };
      } else {
        newTicket = {
          id: 'EXT_MEL_' + Math.floor(Math.random() * 9000 + 1000),
          provider: 'melon',
          title: "콘서트 '보편적 음악의 밤' 배리어프리 존",
          place: "올림픽공원 88잔디마당 (야외공연장)",
          time: "2026. 07. 05 (토) 18:00",
          seat: "Barrier-free Zone A-12"
        };
      }

      setCreatedTicket(newTicket);
      setSyncState('success');
    }, 3400);
  };

  const finalizeAndClose = () => {
    if (createdTicket) {
      onSyncComplete(createdTicket);
    }
    // reset states
    setSyncState('idle');
    setCreatedTicket(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl ${
              highContrast ? 'high-contrast-mode' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-widest text-blue-400 font-mono flex items-center gap-1.5 hc-accent">
                <Link className="w-4 h-4 text-cyan-400" />
                타사 예매 대중 연동 시스템
              </span>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Switcher */}
            {syncState === 'idle' && (
              <div className="space-y-3.5">
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold hc-text-mute">
                  * 대형 예매처 가상 게이트웨이를 구동하여 예매하신 좌석 연동 및 시각/청각 배리어프리 다자막 시나리오를 자동 탑재합니다.
                </p>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                    1. 통합할 예매 사이트 선택
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setProvider('interpark')}
                      className={`py-2 text-[10px] font-bold rounded-xl border transition-all text-center ${
                        provider === 'interpark'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 font-black'
                          : 'border-slate-850 bg-slate-950 text-slate-400'
                      }`}
                    >
                      인터파크 티켓
                    </button>
                    <button
                      type="button"
                      onClick={() => setProvider('yes24')}
                      className={`py-2 text-[10px] font-bold rounded-xl border transition-all text-center ${
                        provider === 'yes24'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 font-black'
                          : 'border-slate-850 bg-slate-950 text-slate-400'
                      }`}
                    >
                      YES24 티켓
                    </button>
                    <button
                      type="button"
                      onClick={() => setProvider('melon')}
                      className={`py-2 text-[10px] font-bold rounded-xl border transition-all text-center ${
                        provider === 'melon'
                          ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 font-black'
                          : 'border-slate-850 bg-slate-950 text-slate-400'
                      }`}
                    >
                      멜론 티켓
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                      2. 예매처 계정 정보 입력
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="예매처 아이디(이메일)"
                      className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호"
                      className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-805/50 space-y-1">
                  <label className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-800 bg-slate-950 accent-blue-500"
                    />
                    실시간 자막 안경 연계 스크레핑 탑재
                  </label>
                  <label className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-800 bg-slate-950 accent-blue-500"
                    />
                    휠체어석 접근 동행 전담 코디 배정
                  </label>
                </div>

                <button
                  onClick={startScrapeSync}
                  className="hc-button-primary w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  배리어프리 연동 동기화 시작
                </button>
              </div>
            )}

            {syncState === 'loading' && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-white">{statusTitle}</h4>
                  <p className="text-[9px] text-slate-400">{statusDesc}</p>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {syncState === 'success' && createdTicket && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-white">무장벽 데이터 통합 완료!</h4>
                  <p className="text-[9px] text-slate-400">타 사이트 예매 내역이 성공적으로 가공 연동되었습니다.</p>
                </div>
                <p className="text-[9.5px] text-yellow-500 font-bold bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-xl text-left">
                  [{createdTicket.provider === 'interpark' ? '인터파크' : createdTicket.provider === 'yes24' ? 'YES24' : '멜론'}] '{createdTicket.title}' 휠체어석 예매 1건이 무장벽 자막 세션과 정상 결합되어 로드 완료되었습니다.
                </p>
                <button
                  onClick={finalizeAndClose}
                  className="hc-button-primary w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md"
                >
                  보러가기
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
