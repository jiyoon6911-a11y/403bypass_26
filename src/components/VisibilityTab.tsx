import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Users, 
  Check, 
  CalendarDays, 
  CheckCircle, 
  Glasses, 
  Clock, 
  BookmarkCheck, 
  CalendarPlus, 
  Trash2, 
  ChevronRight, 
  UserCheck, 
  Info, 
  Sparkles,
  TrendingUp,
  Award,
  ShieldCheck,
  Zap,
  Ticket
} from 'lucide-react';
import { Booking } from '../types';

interface VisibilityTabProps {
  bookings: Booking[];
  onAddBooking: (newB: Booking) => void;
  onCancelBooking: (id: string) => void;
  onAnnounce: (msg: string) => void;
  highContrast: boolean;
}

export default function VisibilityTab({
  bookings,
  onAddBooking,
  onCancelBooking,
  onAnnounce,
  highContrast,
}: VisibilityTabProps) {
  // Option fields
  const [opts, setOpts] = useState<string[]>(['휠체어 동행 지원']);
  const [customMsg, setCustomMsg] = useState('');

  // Scheduler controllers
  const [isManagerSchedulerOpen, setIsManagerSchedulerOpen] = useState(false);
  const [managerDate, setManagerDate] = useState('5월 24일');
  const [managerTime, setManagerTime] = useState('13:00');

  const [isGlassesSchedulerOpen, setIsGlassesSchedulerOpen] = useState(false);
  const [glassesDate, setGlassesDate] = useState('5월 24일');
  const [glassesTime, setGlassesTime] = useState('12:00');
  const [glassesVenue, setGlassesVenue] = useState('샤롯데씨어터'); // default to Charlotte

  // Booking List Tab control
  const [activeBookingTab, setActiveBookingTab] = useState<'today' | 'upcoming' | 'past'>('upcoming');

  // helper to toggle assistance options
  const toggleOpt = (name: string) => {
    if (opts.includes(name)) {
      setOpts(opts.filter((o) => o !== name));
      onAnnounce(`배려 옵션 [${name}]을 해제하셨습니다.`);
    } else {
      setOpts([...opts, name]);
      onAnnounce(`배려 옵션 [${name}]이 지정 보정되었습니다.`);
    }
  };

  const handleManagerBook = () => {
    const formattedNote = customMsg.trim() || '추가 특이 요망 사항 기입 없음';
    const finalDetail = opts.length > 0 ? opts.map(o => {
      if (o === '휠체어 동행 지원') return '♿ 휠체어 전용 동행';
      if (o === '시각 촉지 가이드') return '👁️ 시각 촉도 대체 해설';
      return '👂 청각 증폭 주파수 루프';
    }).join(', ') : '보편적 1:1 일대일 동행 보완';

    const newBooking: Booking = {
      id: 'manager_' + Date.now(),
      type: 'manager',
      date: managerDate,
      time: managerTime,
      detail: finalDetail,
      note: formattedNote,
    };

    onAddBooking(newBooking);
    setIsManagerSchedulerOpen(false);
    setCustomMsg('');
    alert(`동행 매니저 매칭 예약이 즉시 확정되었습니다!\n\n일시: ${managerDate} ${managerTime}\n지원유형: ${finalDetail}`);
    onAnnounce(`접근성 1:1 보행 동행 매니저 예약 성공: ${managerDate} ${managerTime}`);
  };

  const handleGlassesBook = () => {
    const newBooking: Booking = {
      id: 'glass_' + Date.now(),
      type: 'glass',
      date: glassesDate,
      time: glassesTime,
      detail: `🕶️ [${glassesVenue}] AR 무대 한글 해설 스마트 자막 안경 대여`,
      note: `공연장 입장 40분 전 수령 카운터 배리어프리 전용 데스크 본인 수령`,
    };

    onAddBooking(newBooking);
    setIsGlassesSchedulerOpen(false);
    alert(`스마트 자막 안경 대여 예약이 완료되었습니다!\n\n수령지: [${glassesVenue}]\n일시: ${glassesDate} ${glassesTime}\n수령 카운터: 1층 배리어프리 임대 데스크`);
    onAnnounce(`스마트 자막 안경 현장 대여 예약 완료: ${glassesVenue} - ${glassesDate} ${glassesTime}`);
  };

  // Helper to calculate D-Day relative to May 23, 2026
  const getBookingDDayInfo = (dateStr: string) => {
    const match = dateStr.match(/(\d+)월\s*(\d+)일/);
    if (!match) {
      return { 
        dDayText: '기한 미정', 
        category: 'upcoming' as const, 
        labelClass: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/25 px-1.5 py-0.5 rounded' 
      };
    }
    
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    const refMonth = 5;
    const refDay = 23;
    
    let diff = 0;
    if (month === refMonth) {
      diff = day - refDay;
    } else if (month < refMonth) {
      diff = -99;
    } else {
      diff = 99;
    }

    if (diff === 0) {
      return {
        dDayText: 'TODAY 오늘',
        category: 'today' as const,
        labelClass: 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
      };
    } else if (diff < 0) {
      return {
        dDayText: '이용완료 (종료)',
        category: 'past' as const,
        labelClass: 'bg-slate-800 text-slate-500 border border-slate-700/50'
      };
    } else {
      return {
        dDayText: `D-${diff} 예정`,
        category: 'upcoming' as const,
        labelClass: 'bg-blue-500/15 text-cyan-400 border border-blue-500/25'
      };
    }
  };

  // Inject 3 distinct mock bookings so user can instantly test Tab splits
  const injectDemoDataset = () => {
    const uniqueSuffix = () => Math.random().toString(36).substring(2, 8);
    const testItems: Booking[] = [
      {
        id: `test_demo_past_${uniqueSuffix()}`,
        type: 'manager',
        date: '5월 20일',
        time: '14:00',
        detail: '♿ 1:1 휠체어 리프트 대중교통 승하차 연계 가사 전정 에스코트',
        note: '대학로예술극장 매칭 시뮬레이션 완수'
      },
      {
        id: `test_demo_today_${uniqueSuffix()}`,
        type: 'glass',
        date: '5월 23일',
        time: '18:30',
        detail: '🕶️ [샤롯데씨어터] 오페라의 유령 AR 글래스 자막 대여',
        note: '공연 45분 전 현장 로비 웰컴 에스코트 부스 본인 수령'
      },
      {
        id: `test_demo_upcoming_${uniqueSuffix()}`,
        type: 'manager',
        date: '5월 25일',
        time: '17:00',
        detail: '♿ 보편적 1:1 일대일 동행 보완 사전 매칭',
        note: '혜화역 4번출구 안심 동행 서비스 예정'
      }
    ];
    testItems.forEach(b => onAddBooking(b));
    onAnnounce('테스트용 배리어프리 예약 데이터셋 3건이 실시간 탑재되었습니다.');
  };

  // Categorize standard bookings
  const categorizedBookings = {
    today: bookings.filter(b => getBookingDDayInfo(b.date).category === 'today'),
    upcoming: bookings.filter(b => getBookingDDayInfo(b.date).category === 'upcoming'),
    past: bookings.filter(b => getBookingDDayInfo(b.date).category === 'past')
  };

  const activeTabItems = categorizedBookings[activeBookingTab];

  // Listed theaters for beautiful custom selector grid instead of plain dropdown
  const customTheaters = [
    { name: '샤롯데씨어터', icon: '🎭', tags: ['VR 연동 극장', '자막안경 연동'], count: '14대 여유', location: '잠실역 도보 5분' },
    { name: '아르코예술극장 대극장', icon: '🏛️', tags: ['대학로 거점', '수어안내 지원'], count: '8대 대여가능', location: '혜화역 2번출구' },
    { name: '대학로예술극장 소극장', icon: '🎪', tags: ['배리어프리 전용', '휠체어 접근'], count: '5대 보유', location: '혜화역 마로니에' },
    { name: '국립극장 해오름극장', icon: '🏛️', tags: ['남산 숲속', '화면 해설 동반'], count: '12대 확보', location: 'DDP 동전 셔틀' }
  ];

  return (
    <div className="space-y-6">
      {/* 2. Matched Manager Block */}
      <div className="hc-card rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 text-left shadow-md">
        <div className="space-y-1">
          <span className="text-[9px] bg-blue-500/15 text-cyan-400 border border-blue-500/25 px-2.5 py-0.5 rounded font-black tracking-wider uppercase hc-badge inline-block">
            현장 밀착 지원 에스코트
          </span>
          <h3 className="text-sm font-black text-slate-100 flex items-center gap-1.5 pt-1">
            <Users className="w-4 h-4 text-blue-500" />
            접근성 매니저 사전 예약
          </h3>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            가까운 서울 혜화역 대합실부터 공연장 좌석까지, 전문 배리어프리 요원이 1:1 현장 안심 동행을 지원합니다.
          </p>
        </div>

        {/* Support Option Boxes Grid - MORE VISUAL */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest hc-text">
            지원 선택 (선택 시 테두리가 활성화됩니다)
          </label>

          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
            {[
              { id: '휠체어 동행 지원', emoji: '♿', short: '휠체어 하차 동행', long: '지하철 안전 승하차 및 기중 리프트 보행 유닛 매칭' },
              { id: '시각 촉지 가이드', emoji: '👁️', short: '시각 음성가이드', long: '음향 수신기 가설 점자 및 터치형 촉지 가이드 시사' },
              { id: '음향 증폭 루프', emoji: '👂', short: '청각 배리어프리', long: '극장 주파수 자기 보정 자석형 수신 디바이스 링크' },
            ].map((item) => {
              const isSelected = opts.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleOpt(item.id)}
                  className={`flex flex-col justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-600/10 shadow-[0_4px_12px_rgba(37,99,235,0.15)]'
                      : 'border-slate-800 bg-slate-950/80 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{item.emoji}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 border-blue-500' : 'border-slate-800 bg-slate-900'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                    </div>
                  </div>
                  <div className="text-left space-y-0.5">
                    <p className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-slate-350'}`}>
                      {item.short}
                    </p>
                    <p className="text-[8px] text-zinc-500 leading-tight">
                      {item.long}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Input box */}
        <div className="space-y-1.5">
          <label className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider block hc-text">
            ✍️ 특별 추가 동행 동선 요청 사항
          </label>
          <input
            type="text"
            value={customMsg}
            onChange={(e) => setCustomMsg(e.target.value)}
            placeholder="예: 전동 휠체어 전폭이 넓으며 혜화역 4번 엘리베이터 앞 미팅 가설 원함"
            className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-blue-500 focus:outline-none hc-card"
          />
        </div>

        {/* Open scheduler block */}
        <button
          onClick={() => {
            setIsManagerSchedulerOpen(!isManagerSchedulerOpen);
            setIsGlassesSchedulerOpen(false);
          }}
          className="hc-button-primary w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span>동행 매니저 일정 확인 및 예약 ({managerDate} {managerTime})</span>
        </button>

        {/* Scheduler panel dropdown */}
        {isManagerSchedulerOpen && (
          <div className="border border-slate-850 bg-slate-955 p-3.5 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black text-white flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                동행 매니저 일정 및 시간대 조율
              </h4>
              <span className="text-[8px] bg-red-400/10 text-red-400 border border-red-500/25 px-1.5 py-0.5 rounded font-bold uppercase hc-badge">
                선착순 매칭
              </span>
            </div>

            {/* Calendar */}
            <div className="space-y-1.5 text-center">
              <span className="text-[9px] text-slate-500 font-bold block text-left">1. 방문 희망 날짜 선택 (5월)</span>
              <div className="bg-slate-950 border border-slate-900 p-2 rounded-xl text-center">
                <div className="grid grid-cols-7 text-[8px] font-black text-slate-500 pb-1 border-b border-slate-900">
                  <div className="text-rose-500">일</div>
                  <div>월</div>
                  <div>화</div>
                  <div>수</div>
                  <div>목</div>
                  <div>금</div>
                  <div className="text-blue-500">토</div>
                </div>
                <div className="grid grid-cols-7 gap-1 mt-1 text-[10px] font-bold">
                  <div className="h-6" /> <div className="h-6" /> <div className="h-6" /> <div className="h-6" /> <div className="h-6" />
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day) => {
                    const dString = `5월 ${day}일`;
                    const isSelected = managerDate === dString;
                    const textClass = (day === 3 || day === 10 || day === 17 || day === 24 || day === 31)
                      ? 'text-rose-500'
                      : (day === 2 || day === 9 || day === 16 || day === 23 || day === 30)
                      ? 'text-blue-400'
                      : 'text-slate-350';

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setManagerDate(dString);
                          onAnnounce(`매니저 동행일이 수동 변경 조정되었습니다: ${dString}`);
                        }}
                        className={`h-6 rounded-lg text-center transition-all flex items-center justify-center border text-[9px] ${
                          isSelected
                            ? 'border-blue-500 bg-blue-600 text-white font-black shadow-sm'
                            : `border-slate-900 bg-slate-950 ${textClass} hover:bg-slate-800`
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time selection */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 font-bold block text-left">2. 희망 방문 시간 선택</span>
              <div className="grid grid-cols-2 gap-2">
                {['12:00', '14:30', '17:00', '18:00'].map((time) => {
                  const isSelected = managerTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setManagerTime(time)}
                      className={`p-2 rounded-xl text-left border text-xs font-mono font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800'
                      }`}
                    >
                      {time}
                      <span className="float-right text-[8px] px-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded font-sans">
                        {isSelected ? '선택됨' : time === '18:00' ? '마감임박' : '예약가능'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleManagerBook}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{managerDate} {managerTime} 매니저 즉시 예약 확정하기</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Smart AR Glasses Block */}
      <div className="hc-card rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 text-left shadow-md">
        <div className="space-y-1">
          <span className="text-[9px] bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 px-2.5 py-0.5 rounded font-black tracking-wider uppercase hc-badge inline-block">
            증강 현실 안경 보완
          </span>
          <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5 pt-1">
            <Glasses className="w-4 h-4 text-cyan-400" />
            AI 수어·자막 안경 현장 대여 신청
          </h4>
          <p className="text-xs text-slate-400 leading-normal font-semibold">
            무대 위 실제 연기자의 몸짓과 음악의 동선에서 시선을 뗄 필요 없이, AR 안경 투명 글래스로 한국어 폐쇄형 자막과 특수 효과 해설을 편안히 관측 수신하세요.
          </p>
        </div>

        {/* 1단계: 리스트 */}
        <div className="space-y-3">
          <label className="text-[10.5px] font-black uppercase text-cyan-400 tracking-wider block hc-text font-sans">
            📍 1단계 : 대여 수령지 극장 선택 (리스트)
          </label>
          
          <div className="space-y-2">
            {customTheaters.map((th) => {
              const isSelected = glassesVenue === th.name;
              return (
                <div
                  key={th.name}
                  onClick={() => {
                    setGlassesVenue(th.name);
                    onAnnounce(`안경 대여 수령장소를 ${th.name}로 지정 조정했습니다.`);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/20 border-cyan-500 shadow-[0_2px_8px_rgba(6,182,212,0.12)]'
                      : 'bg-slate-955 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{th.icon}</span>
                    <div className="text-left">
                      <p className={`text-[11.5px] font-black ${isSelected ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {th.name}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-semibold leading-relaxed">
                        {th.location} • {th.tags.map(t => `#${t}`).join(' ')}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`text-[8.5px] font-black px-2 py-0.5 rounded shrink-0 ${
                    isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 border border-slate-800 text-cyan-400/80 font-mono'
                  }`}>
                    {th.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2단계: 선택창 */}
        <div className="space-y-3 pt-2">
          <label className="text-[10.5px] font-black uppercase text-cyan-400 tracking-wider block hc-text font-sans">
            📅 2단계 : 대여 일정 및 예정 시간 선택창 (선택창)
          </label>

          <button
            onClick={() => {
              setIsGlassesSchedulerOpen(!isGlassesSchedulerOpen);
              setIsManagerSchedulerOpen(false);
            }}
            className="hc-button-secondary w-full py-2.5 rounded-xl bg-slate-955 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>상세 날짜 • 시간대 설정창 열기 / 닫기 (현재 선택: {glassesDate} {glassesTime})</span>
          </button>

          {/* Glasses Calendar scheduler */}
          {isGlassesSchedulerOpen && (
            <div className="border border-slate-850 bg-slate-955 p-4 rounded-2xl space-y-4">
              {/* Calendar list */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-zinc-400 font-bold block text-left">방문 희망 일자 선택 (5월)</span>
                <div className="bg-slate-955 border border-slate-900 p-2 rounded-xl text-center">
                  <div className="grid grid-cols-7 text-[8px] font-black text-slate-500 pb-1 border-b border-slate-900">
                    <div className="text-rose-500">일</div>
                    <div>월</div>
                    <div>화</div>
                    <div>수</div>
                    <div>목</div>
                    <div>금</div>
                    <div className="text-blue-500">토</div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mt-1 text-[10px] font-bold">
                    <div className="h-6" /> <div className="h-6" /> <div className="h-6" /> <div className="h-6" /> <div className="h-6" />
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((day) => {
                      const dString = `5월 ${day}일`;
                      const isSelected = glassesDate === dString;
                      const textClass = (day === 3 || day === 10 || day === 17 || day === 24 || day === 31)
                        ? 'text-rose-500'
                        : (day === 2 || day === 9 || day === 16 || day === 23 || day === 30)
                        ? 'text-blue-400'
                        : 'text-slate-350';

                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            setGlassesDate(dString);
                            onAnnounce(`안경 대여 희망날짜 변경: ${dString}`);
                          }}
                          className={`h-6 rounded-lg text-center transition-all flex items-center justify-center border text-[9px] ${
                            isSelected
                              ? 'border-blue-500 bg-blue-600 text-white font-black'
                              : `border-slate-900 bg-slate-950 ${textClass} hover:bg-slate-800`
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time selection */}
              <div className="space-y-1.5 text-left">
                <span className="text-[9px] text-zinc-400 font-bold block text-left">수령 대기 시간 (입장 40분 전)</span>
                <div className="grid grid-cols-2 gap-2">
                  {['12:00', '14:30', '17:00', '19:30'].map((time) => {
                    const isSelected = glassesTime === time;
                    const isLocked = time === '19:30';

                    return (
                      <button
                        key={time}
                        disabled={isLocked}
                        type="button"
                        onClick={() => setGlassesTime(time)}
                        className={`p-2 rounded-xl text-left border text-xs font-mono font-bold transition-all ${
                          isLocked
                            ? 'bg-slate-920 border-slate-900 text-slate-500 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-blue-600 border-blue-500 text-white font-black'
                            : 'bg-slate-900 border-slate-800 text-slate-350 hover:bg-slate-800'
                        }`}
                      >
                        {time}
                        {isLocked ? (
                          <span className="float-right text-[8px] px-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded font-sans">대여마감</span>
                        ) : (
                          <span className="float-right text-[8px] px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-sans">
                            {isSelected ? '선택됨' : '대여가능'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleGlassesBook}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 font-black" />
                <span>{glassesDate} {glassesTime} 자막안경 임대스케줄 최종 확정</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Instant Rental Trigger if closed */}
        {!isGlassesSchedulerOpen && (
          <button
            onClick={handleGlassesBook}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>선택한 [{glassesVenue}] 극장에서 자막안경 즉시 신청하기</span>
          </button>
        )}
      </div>

      {/* 4. CATEGORIZED RESERVATIONS WITH TABS & D-DAY IDENTIFIERS */}
      <div className="pt-6 border-t border-slate-800 mt-6"></div>

      <div className="hc-card rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-emerald-500/15 p-5 space-y-4 text-left shadow-xl shadow-slate-950/40">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-850">
          <div className="space-y-0.5">
            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded font-black tracking-wider uppercase hc-badge inline-block">
              REAL-TIME STATUS MANAGEMENT
            </span>
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5 pt-0.5">
              <BookmarkCheck className="w-4 h-4 text-emerald-400 animate-bounce" />
              나의 실시간 예매/대여 예약 완료 현황
            </h3>
          </div>

          {/* Quick Demo Dataset Injector Button - EXTREMELY USEFUL */}
          <button
            onClick={injectDemoDataset}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg text-[9px] font-black transition-all flex items-center gap-1 cursor-pointer select-none active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            📊 테스트용 예약 자동 가설
          </button>
        </div>

        {/* Categories Depth selection tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850">
          {[
            { id: 'today', label: '오늘 예약', count: categorizedBookings.today.length },
            { id: 'upcoming', label: '곧 다가올 예약', count: categorizedBookings.upcoming.length },
            { id: 'past', label: '완료 및 지난 예약', count: categorizedBookings.past.length },
          ].map((tab) => {
            const isTabActive = activeBookingTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveBookingTab(tab.id as any);
                  onAnnounce(`${tab.label} 조회를 탭 정제하였습니다. 등록 건수 ${tab.count}건입니다.`);
                }}
                className={`py-2 rounded-lg text-center font-bold text-[10.5px] transition-all flex items-center justify-center gap-1.5 ${
                  isTabActive
                    ? 'bg-slate-800 text-[#00E5FF] border border-[#00E5FF]/20 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-black ${
                  isTabActive ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-slate-900 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed Ticket / Reservation cards under currently expanded tab */}
        <div className="space-y-3 pt-1">
          {activeTabItems.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-850 rounded-2xl bg-slate-950/40 space-y-2.5">
              <CalendarPlus className="w-9 h-9 text-slate-700 mx-auto" />
              <p className="text-xs text-slate-450 font-black hc-text">
                이 구역에 등록된 매칭/임대 예약 건이 비어 있습니다.
              </p>
              
              {activeBookingTab === 'upcoming' && (
                <p className="text-[10px] text-zinc-500 leading-normal font-medium max-w-xs mx-auto">
                  상단의 에스코트 지원 및 하단 AR 수령지 극장을 조합 지정하시면 실시간 스케줄이 다가올 예약으로 가설 등록됩니다.
                </p>
              )}
              {activeBookingTab === 'today' && (
                <p className="text-[10px] text-zinc-500 leading-normal font-medium max-w-xs mx-auto">
                  5월 23일 (오늘자) 예약 건이 존재하지 않습니다. 우측 상단의 "📊 테스트용 예약 자동 가설" 버튼을 눌러보시면 바로 활성화 기입됩니다.
                </p>
              )}
              {activeBookingTab === 'past' && (
                <p className="text-[10px] text-zinc-500 leading-normal font-medium max-w-xs mx-auto">
                  과거 정상 수료하거나 사용 완료 처리된 서포트 로그 대장이 존재하지 않습니다.
                </p>
              )}
            </div>
          ) : (
            activeTabItems.map((b) => {
              const dday = getBookingDDayInfo(b.date);
              const isManager = b.type === 'manager';
              const typeLabel = isManager ? '동행 매니저 1:1 안심매칭' : 'AR 자막안경 스마트 대여';
              
              // Color schemes depending on type
              const cardBorder = isManager 
                ? 'border-blue-600/30 bg-blue-950/[0.04]' 
                : 'border-cyan-600/30 bg-cyan-950/[0.04]';

              const iconBg = isManager
                ? 'bg-blue-600/10 text-blue-400'
                : 'bg-cyan-600/10 text-cyan-400';

              return (
                <div
                  key={b.id}
                  className={`border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow transition-all hover:border-slate-700/85 ${cardBorder}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className={`p-2 rounded-xl shrink-0 mt-0.5 ${iconBg}`}>
                        {isManager ? (
                          <Users className="w-4 h-4" />
                        ) : (
                          <Glasses className="w-4 h-4" />
                        )}
                      </span>
                      
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wide ${dday.labelClass}`}>
                            {dday.dDayText}
                          </span>
                          <span className="text-[11.5px] font-black text-white">{typeLabel}</span>
                        </div>
                        
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-200">{b.detail}</p>
                          <p className="text-[10px] text-slate-450 font-mono font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>상세일정:</span>
                            <strong className="text-white">{b.date} {b.time}</strong>
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onCancelBooking(b.id);
                        onAnnounce(`${typeLabel} 스케줄 예약을 정지 해지 조치했습니다.`);
                      }}
                      className="text-[10.5px] text-rose-400 hover:text-rose-350 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 px-3 py-1.5 rounded-xl transition-all font-black whitespace-nowrap shrink-0 hc-button-secondary cursor-pointer"
                    >
                      예약 취소
                    </button>
                  </div>

                  {/* Escort Guidelines subtext bar */}
                  <div className="p-2.5 bg-slate-950/90 rounded-xl border border-slate-900 flex justify-between items-center text-[10px] gap-2">
                    <span className="text-zinc-500 font-bold whitespace-nowrap flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      전달 안심 지침:
                    </span>
                    <span className="text-zinc-300 truncate max-w-[210px] font-semibold text-right flex-1">{b.note}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 bg-[#0b0c10] rounded-xl border border-slate-850 text-left">
          <p className="text-[10px] text-zinc-400 font-sans font-semibold leading-normal">
            ⚙️ <strong className="text-yellow-500">D-Day 분류 보완 기준:</strong> 본 플랫폼은 대학로의 안심 실황 보강을 위한 수시 센서 시간대인 <strong className="text-white">2026년 5월 23일 (오늘자)</strong>을 기준으로 계산되어 정확하게 스택 배정됩니다.
          </p>
        </div>
      </div>

    </div>
  );
}
