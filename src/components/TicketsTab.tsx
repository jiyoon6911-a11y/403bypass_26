import React, { useState } from 'react';
import { Ticket, RefreshCw, Info, Link } from 'lucide-react';
import { Ticket as TicketType } from '../types';

interface TicketsTabProps {
  syncedTickets: TicketType[];
  onDeleteTicket: (id: string) => void;
  onOpenSync: () => void;
  highContrast: boolean;
}

export default function TicketsTab({
  syncedTickets,
  onDeleteTicket,
  onOpenSync,
  highContrast,
}: TicketsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<0 | 1>(0);

  return (
    <div className="space-y-4">
      {/* Subtab Toggle */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveSubTab(0)}
          className={`flex-1 py-2 text-center text-xs font-bold transition-all ${
            activeSubTab === 0
              ? 'text-blue-500 border-b-2 border-blue-500 font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          예매 완료 모바일 티켓
        </button>
        <button
          onClick={() => setActiveSubTab(1)}
          className={`flex-1 py-2 text-center text-xs font-bold transition-all ${
            activeSubTab === 1
              ? 'text-blue-500 border-b-2 border-blue-500 font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          지난 관람 공연
        </button>
      </div>

      {activeSubTab === 0 ? (
        <div className="space-y-4">
          {/* Sync Button Banner */}
          <div className="hc-card rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-950/30 border border-blue-500/20 p-4 space-y-2.5 shadow-lg text-left">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-400 shrink-0">
                <Ticket className="w-4 h-4 text-cyan-405" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-slate-100 flex items-center gap-1">
                  🎫 외부 예매처 티켓 연동 (시뮬레이터)
                </h4>
                <p className="text-[9.5px] text-slate-400 leading-normal">
                  인터파크, YES24 등 타사에서 예매한 내역을 연동하여 모바일 자막 안경 및 휠체어 전용 편의 설정을 구성합니다.
                </p>
              </div>
            </div>
            
            <button
              onClick={onOpenSync}
              className="hc-button-secondary py-2 w-full text-[10px] font-black tracking-wider text-center text-blue-400 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              타 사이트 예매 내역 연동 완료하기
            </button>
          </div>

          {/* Render Tickets */}
          <div className="space-y-4">
            {/* Core Default Ticket */}
            <div className="hc-card rounded-3xl bg-slate-900 border border-blue-500/30 overflow-hidden shadow-2xl relative text-left">
              <div className="bg-gradient-to-r from-blue-700 to-cyan-700 p-4 text-white space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase opacity-90 font-sans">
                  <span>Bypass Ticket (보편적 무벽 패스)</span>
                  <span className="px-1.5 py-0.5 rounded bg-black/30 font-mono text-[9px] text-yellow-400">발권 완료</span>
                </div>
                <h3 className="text-base font-black tracking-tight leading-snug">연극 '새로운 연극적 기쁨' 403호 시나리오</h3>
                <p className="text-[11px] font-medium text-slate-100 uppercase opacity-95">혜화 대학로 공터_극장 403호</p>
              </div>

              {/* Edge Cuts decoration */}
              <div className="absolute left-0 top-[110px] -translate-x-1/2 w-4 h-4 rounded-full bg-[#0B0F19] z-20"></div>
              <div className="absolute right-0 top-[110px] translate-x-1/2 w-4 h-4 rounded-full bg-[#0B0F19] z-20"></div>

              <div className="p-4 space-y-4 border-b border-dashed border-slate-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block hc-text-mute">일정 및 관람시간</span>
                    <p className="text-xs font-extrabold text-white">2026. 06. 15 (월) 19:30</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block hc-text-mute">지정 확보 좌석</span>
                    <p className="text-xs font-extrabold text-cyan-405">1층 휠체어 접근 석-D2</p>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="pt-2 flex flex-col items-center justify-center space-y-2">
                  <div className="bg-white p-3 rounded-lg border border-slate-300">
                    <div className="flex items-center h-10 w-48 gap-[1px]">
                      <div className="h-full bg-black w-[4px]" />
                      <div className="h-full bg-black w-[2px]" />
                      <div className="h-full bg-white w-[2px]" />
                      <div className="h-full bg-black w-[1px]" />
                      <div className="h-full bg-black w-[4px]" />
                      <div className="h-full bg-white w-[3px]" />
                      <div className="h-full bg-black w-[2px]" />
                      <div className="h-full bg-black w-[5px]" />
                      <div className="h-full bg-white w-[1px]" />
                      <div className="h-full bg-black w-[3px]" />
                      <div className="h-full bg-black w-[2px]" />
                      <div className="h-full bg-white w-[4px]" />
                      <div className="h-full bg-black w-[1px]" />
                      <div className="h-full bg-black w-[4px]" />
                      <div className="h-full bg-black w-[2px]" />
                      <div className="h-full bg-white w-[2px]" />
                      <div className="h-full bg-black w-[3px]" />
                      <div className="h-full bg-black w-[5px]" />
                    </div>
                  </div>
                  <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    BYPASS-ACC-403-998A
                  </span>
                </div>
              </div>

              {/* Banner Info */}
              <div className="p-3 bg-slate-950/60 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-400 leading-relaxed hc-text-mute">
                  <span className="font-bold text-yellow-405">교통 연계 안내:</span> 본 티켓 소지 시 대학로 보행 경사 확보를 위해 혜화역 2번 출구 앞 배동 엘리베이터 진입 연계 차량을 보조 요청할 수 있습니다.
                </p>
              </div>
            </div>

            {/* Synced external ticket list */}
            {syncedTickets.map((t) => {
              const themeClass = t.provider === 'interpark'
                ? 'from-rose-700 to-red-800'
                : t.provider === 'yes24'
                ? 'from-blue-705 to-indigo-800'
                : 'from-emerald-700 to-teal-700';

              const providerLabel = t.provider === 'interpark'
                ? '인터파크 연동완료'
                : t.provider === 'yes24'
                ? 'YES24 연동완료'
                : '멜론티켓 보안연동';

              return (
                <div
                  key={t.id}
                  className="hc-card rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl relative text-left"
                >
                  <div className={`bg-gradient-to-r ${themeClass} p-4 text-white space-y-1`}>
                    <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase opacity-90">
                      <span className="flex items-center gap-1">
                        <Link className="w-3.5 h-3.5 text-yellow-400" />
                        {providerLabel}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-[9px] text-cyan-300">무장벽 모드 결합</span>
                    </div>
                    <h3 className="text-base font-black tracking-tight leading-snug">{t.title}</h3>
                    <p className="text-[11px] font-medium text-slate-100 uppercase opacity-95">{t.place}</p>
                  </div>

                  {/* Cut logic holes */}
                  <div className="absolute left-0 top-[110px] -translate-x-1/2 w-4 h-4 rounded-full bg-[#0B0F19] z-20" />
                  <div className="absolute right-0 top-[110px] translate-x-1/2 w-4 h-4 rounded-full bg-[#0B0F19] z-20" />

                  <div className="p-4 space-y-4 border-b border-dashed border-slate-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block hc-text-mute">관람시간(동기화 완료)</span>
                        <p className="text-xs font-extrabold text-white">{t.time}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block hc-text-mute">확보 좌석</span>
                        <p className="text-xs font-extrabold text-cyan-405">{t.seat}</p>
                      </div>
                    </div>

                    {/* Barcode representation */}
                    <div className="pt-2 flex flex-col items-center justify-center space-y-2">
                      <div className="bg-white p-3 rounded-lg border border-slate-300">
                        <span className="flex items-center h-10 w-48 gap-[1px]">
                          <span className="h-full bg-black w-[2px]" />
                          <span className="h-full bg-black w-[1px]" />
                          <span className="h-full bg-white w-[3px]" />
                          <span className="h-full bg-black w-[4px]" />
                          <span className="h-full bg-black w-[1px]" />
                          <span className="h-full bg-white w-[2px]" />
                          <span className="h-full bg-black w-[3px]" />
                          <span className="h-full bg-black w-[5px]" />
                        </span>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        SYNC-{t.id}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/45 border-b border-slate-800 flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">🕶️ 다자막 글래스</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20">♿ 보행 동행 연동</span>
                    </div>
                    <button
                      onClick={() => onDeleteTicket(t.id)}
                      className="text-[9px] font-black text-rose-455 bg-rose-400/10 px-2.5 py-1 rounded-lg border border-rose-500/20 hover:bg-rose-400/20 active:scale-95 transition-all"
                    >
                      연동 해제
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950/60 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-relaxed hc-text-mute">
                      <span className="font-bold text-emerald-400">무장벽 보정 상태:</span> 해당 외부 기관의 오리지널 원고 스크레핑 탑재 완료. 스마트 자막 안경 착용 시 자동 매칭 자막 수신기가 활성화됩니다.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Refund accordion */}
          <div className="hc-card rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-2 text-left">
            <h4 className="text-xs font-black text-slate-205 flex items-center gap-1">
              <Info className="w-4 h-4 text-blue-500" />
              장애 인식 보증 취소 및 환불 안내
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed hc-text-mute">
              관람객의 거동 이상, 교통 안전 고장, 또는 당일 보조 스탭 미배정으로 인한 긴급 취소 시, 공연 시작 발생 30분 전까지 전액 면제 100% 환불을 완전 보장합니다. (앱 내 취소 가능)
            </p>
          </div>
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
          <RefreshCw className="w-12 h-12 text-slate-600 animate-spin-slow" />
          <h4 className="text-xs font-bold text-slate-400">만료된 지난 관람 티켓이 없습니다.</h4>
          <p className="text-[10px] text-slate-550 hc-text-mute">
            403 바이패스를 통해 즐거운 문화 예술 추억을 완벽하게 축적해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
