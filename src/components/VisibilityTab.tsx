import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Users, Check, CalendarDays, CheckCircle, Glasses, Clock, BookmarkCheck, CalendarPlus, Trash2 } from 'lucide-react';
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
  const [glassesVenue, setGlassesVenue] = useState('아르코예술극장 대극장');

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
    alert(`예약이 즉시 확정되었습니다!\n\n일시: ${managerDate} ${managerTime}\n지원유형: ${finalDetail}`);
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

  return (
    <div className="space-y-4">
      {/* Matched Manager Block */}
      <div className="hc-card rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4 text-left">
        <div className="space-y-1">
          <span className="text-[9px] bg-blue-500/10 text-cyan-400 border border-blue-500/20 px-2 py-0.5 rounded font-black tracking-wider uppercase hc-badge">
            현장 밀착 지원
          </span>
          <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5 pt-1">
            <Users className="w-4 h-4 text-blue-500" />
            접근성 매니저 사전 예약
          </h3>
          <p className="text-xs text-slate-405 font-semibold leading-relaxed">
            가까운 서울 혜화역 대합실부터 공연장 좌석까지, 전문 배리어프리 요원이 1:1 현장 안심 동행을 지원합니다. (선착순 에스코트 마감)
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest hc-text">
            지원 선택 사항
          </label>

          <div className="space-y-2">
            {[
              { id: '휠체어 동행 지원', label: '♿ 휠체어 전용 하차 동행 및 입석 매칭' },
              { id: '시각 촉지 가이드', label: '👁️ 시각 대체 음성 해설 및 촉도 촉지 수신기 제공' },
              { id: '음향 증폭 루프', label: '👂 청각 기기 주파수 연동 음향 증폭 희망' },
            ].map((item) => {
              const isSelected = opts.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleOpt(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer hover:bg-slate-800/80 transition-all ${
                    isSelected
                      ? 'border-blue-500/30 bg-blue-500/5'
                      : 'border-slate-800 bg-slate-950'
                  }`}
                >
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-350'}`}>
                    {item.label}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-slate-700 text-slate-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Description text input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block hc-text">
              구체적인 추가적 배려 사항 (텍스트)
            </label>
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="예: 휠체어가 매우 무거운 전동형입니다. 성인 2명 보조 필요"
              className="w-full text-xs bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-blue-500 focus:outline-none hc-card"
            />
          </div>

          {/* Open scheduler buttons */}
          <button
            onClick={() => {
              setIsManagerSchedulerOpen(!isManagerSchedulerOpen);
              setIsGlassesSchedulerOpen(false);
            }}
            className="hc-button-primary w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>동행 매니저 일정 확인 및 예약</span>
          </button>

          {/* Manager Calendar scheduler */}
          {isManagerSchedulerOpen && (
            <div className="border border-slate-850 bg-slate-955 p-3.5 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black text-cyan-400 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  동행 매니저 일정 및 시간대 조율
                </h4>
                <span className="text-[8px] bg-red-400/10 text-red-440 border border-red-500/25 px-1.5 py-0.5 rounded font-bold uppercase hc-badge">
                  선착순 매칭
                </span>
              </div>

              {/* Day selection calendar mock */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-500 font-bold block">1. 희망 방문 날짜 선택 (5월)</span>
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
                    {/* Padding empty block */}
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

              {/* Time grid */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-slate-500 font-bold block">2. 희망 관람 파견 시간</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled
                    className="p-2 rounded-xl text-left border text-xs font-mono font-bold bg-slate-900 border-slate-850 text-slate-500 line-through select-none"
                  >
                    11:00 <span className="float-right text-[8px] px-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-sans">선점마감</span>
                  </button>
                  <button
                    onClick={() => setManagerTime('13:00')}
                    className={`p-2 rounded-xl text-left border text-xs font-mono font-bold transition-all ${
                      managerTime === '13:00'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    13:00 <span className="float-right text-[8px] px-1 bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded font-sans">{managerTime === '13:00' ? '선택됨' : '선택'}</span>
                  </button>
                  <button
                    onClick={() => setManagerTime('15:30')}
                    className={`p-2 rounded-xl text-left border text-xs font-mono font-bold transition-all ${
                      managerTime === '15:30'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    15:30 <span className="float-right text-[8px] px-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-sans">{managerTime === '15:30' ? '선택됨' : '대여가능'}</span>
                  </button>
                  <button
                    onClick={() => setManagerTime('18:00')}
                    className={`p-2 rounded-xl text-left border text-xs font-mono font-bold transition-all ${
                      managerTime === '18:00'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    18:00 <span className="float-right text-[8px] px-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded font-sans">{managerTime === '18:00' ? '선택됨' : '마감임박'}</span>
                  </button>
                </div>
              </div>

              {/* Trigger */}
              <button
                onClick={handleManagerBook}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{managerDate} {managerTime} 매니저 예약 확정</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Smart Glasses Block */}
      <div className="hc-card rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4 text-left">
        <div className="space-y-1">
          <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-black tracking-wider uppercase hc-badge">
            증강 현실 보완
          </span>
          <h4 className="text-sm font-extrabold text-slate-100 flex items-center gap-1.5 pt-1">
            <Glasses className="w-4 h-4 text-cyan-400" />
            AI 자막안경 현장 대여 신청
          </h4>
          <p className="text-xs text-slate-400 leading-normal font-semibold">
            무대 위 실제 연기자 동선에서 시선을 뗄 필요 없이, AR 투명 글래스로 한국어 폐쇄 형 자막을 편안히 수신해 보세요.
          </p>
        </div>

        {/* 1. Venue selection (어디에서 빌릴건지) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block hc-text">
            📍 1단계: 수령 및 대여 공연장 선택
          </label>
          <select
            value={glassesVenue}
            onChange={(e) => {
              setGlassesVenue(e.target.value);
              onAnnounce(`AR 안경 대여 수령장소를 ${e.target.value}로 지정 조정했습니다.`);
            }}
            className="w-full text-xs font-semibold bg-slate-950 text-white rounded-xl border border-slate-800 px-3 py-2.5 focus:border-cyan-500 focus:outline-none hc-card"
          >
            <option value="아르코예술극장 대극장">아르코예술극장 대극장 (대학로)</option>
            <option value="아르코예술극장 소극장">아르코예술극장 소극장 (대학로)</option>
            <option value="대학로예술극장 대극장">대학로예술극장 대극장 (대학로)</option>
            <option value="대학로예술극장 소극장">대학로예술극장 소극장 (대학로)</option>
            <option value="국립극장 해오름극장">국립극장 해오름극장 (동대입구)</option>
            <option value="세종문화회관 대극장">세종문화회관 대극장 (광화문)</option>
          </select>
        </div>

        {/* 2. Scheduler Trigger */}
        <button
          onClick={() => {
            setIsGlassesSchedulerOpen(!isGlassesSchedulerOpen);
            setIsManagerSchedulerOpen(false);
          }}
          className="hc-button-secondary w-full py-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          <span>📅 2단계: 대여 일정 및 실시간 시간 정제 ({glassesDate} {glassesTime})</span>
        </button>

        {/* Glasses Calendar scheduler */}
        {isGlassesSchedulerOpen && (
          <div className="border border-slate-850 bg-slate-955 p-3.5 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black text-cyan-400 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                언제 & 몇 시 대여 일정 선택
              </h4>
            </div>

            {/* Calendar */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 font-bold block font-sans">희망 수령 날짜 (5월 중 택일)</span>
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
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 font-bold block font-sans">수령 대여 예정 시간 (공연 40분 전 권장)</span>
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
                          ? 'bg-slate-900 border-slate-850 text-slate-500 line-through cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-600 border-blue-501 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {time}
                      {isLocked ? (
                        <span className="float-right text-[8px] px-1 bg-red-500/10 text-red-500 border border-red-530 rounded font-sans">대여마감</span>
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
              <span>{glassesDate} {glassesTime} 자막안경 임대정보 확정하기</span>
            </button>
          </div>
        )}

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

      {/* Visually Separated Core Block of User Completed Bookings */}
      <div className="pt-6 border-t-2 border-dashed border-slate-800/80 mt-6"></div>

      <div className="hc-card rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-emerald-500/20 p-4 space-y-4 text-left shadow-xl shadow-slate-950/50">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60">
          <div className="space-y-0.5">
            <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black tracking-wider uppercase hc-badge inline-block">
              실시간 상태 관리 보드
            </span>
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5 pt-1">
              <BookmarkCheck className="w-4 h-4 text-emerald-400" />
              나의 실시간 예매/대여 예약 완료 현황
            </h3>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold font-mono">
            총 {bookings.length}건
          </span>
        </div>

        <div className="space-y-2.5">
          {bookings.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-2">
              <CalendarPlus className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-extrabold hc-text">대기 및 실시간 확정된 매칭/대여 예약이 존재하지 않습니다.</p>
              <p className="text-[10px] text-slate-500 hc-text-mute">위 스케줄러에서 원하시는 극장, 날짜 및 시간을 조합 입력 신청해 주십시오.</p>
            </div>
          ) : (
            bookings.map((b) => {
              const isManager = b.type === 'manager';
              const typeLabel = isManager ? '동행 매니저 1:1 안심매칭' : 'AR 자막안경 스마트 대여';
              const labelBg = isManager
                ? 'bg-blue-600/15 border-blue-500/40 text-blue-400'
                : 'bg-cyan-600/15 border-cyan-500/40 text-cyan-400';

              return (
                <div
                  key={b.id}
                  className="hc-card border border-slate-800/80 rounded-2xl p-3.5 bg-slate-900/40 flex flex-col justify-between gap-3 shadow shadow-blue-500/[0.01]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-350 shrink-0 mt-0.5">
                        {isManager ? (
                          <Users className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Glasses className="w-4 h-4 text-cyan-400" />
                        )}
                      </span>
                      <div className="space-y-0.5 text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-white">{typeLabel}</span>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold border uppercase ${labelBg} hc-badge`}>
                            {b.date} {b.time}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-205">{b.detail}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onCancelBooking(b.id)}
                      className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 active:scale-95 px-2.5 py-1 rounded-xl transition-all font-bold whitespace-nowrap shrink-0 hc-button-secondary cursor-pointer"
                    >
                      예약 취소
                    </button>
                  </div>

                  <div className="p-2 bg-slate-950/80 rounded-xl border border-slate-900/60 flex justify-between items-center text-[9.5px]">
                    <span className="text-slate-500 font-bold hc-text-mute">전달 보존안내:</span>
                    <span className="text-slate-300 truncate max-w-[210px] font-semibold">{b.note}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
