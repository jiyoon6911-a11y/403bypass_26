import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  MapPin, 
  ExternalLink, 
  Eye, 
  Star, 
  Sparkles, 
  Activity, 
  Maximize2, 
  RotateCcw,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Show } from '../types';

interface ShowDetailViewProps {
  show: Show;
  onBack: () => void;
  highContrast: boolean;
  onAnnounce: (msg: string) => void;
}

export default function ShowDetailView({
  show,
  onBack,
  highContrast,
  onAnnounce,
}: ShowDetailViewProps) {
  // Seat interaction state (Zoom, Pan, 3D Rotation)
  const [rotationX, setRotationX] = useState(0); // flat by default, can be tilted
  const [rotationZ, setRotationZ] = useState(0);
  const [scaling, setScaling] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'pan' | 'rotate'>('pan');
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);

  // References for dragging
  const dragStartRef = useRef({ x: 0, y: 0, rotX: 0, rotZ: 0, panX: 0, panY: 0, isDragging: false });
  const touchStartDistanceRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);

  // Specific reviews for '오페라의 유령' or fallback
  const reviews = {
    normal: [
      { author: '연극러버', text: '배우들의 연기력이 미쳤어요.', rating: 5 },
      { author: '관극매니아', text: '무대 연출이 신선하고 좋았습니다!', rating: 4 }
    ],
    accessibility: [
      { author: '휠체어이용자', text: '경사로가 잘 되어있어서 이동이 편리했습니다.', rating: 5, tags: ['휠체어전용'] },
      { author: '시각장애인', text: '점자 블록과 음성 안내가 잘 구비되어 있어서 헤매지 않고 입장했어요.', rating: 4, tags: ['음성해설'] }
    ]
  };

  // Speaks layout text or accessibility guide
  const speakSeatAccessibility = (seatInfo: string) => {
    onAnnounce(`좌석 ${seatInfo}을 선택하셨습니다. 해당 좌석은 무대 중앙 시시각각 전후 시야각 100% 확보 구역이며 휠체어 전동 리프트가 바로 뒤에 안전 가설되어 있습니다.`);
  };

  // 1. Mouse Drag, shift, wheel Zoom handlers for Seat Map
  const handleSeatMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    e.preventDefault();

    const actualMode = (e.shiftKey || e.button === 1) ? 'rotate' : dragMode;
    setIsDragging(true);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotationX,
      rotZ: rotationZ,
      panX: panX,
      panY: panY,
      isDragging: true
    };

    const handleMouseMove = (mvEv: MouseEvent) => {
      if (!dragStartRef.current.isDragging) return;
      const dx = mvEv.clientX - dragStartRef.current.x;
      const dy = mvEv.clientY - dragStartRef.current.y;

      if (actualMode === 'rotate') {
        const targetRotZ = dragStartRef.current.rotZ - dx * 0.65;
        const targetRotX = Math.max(-45, Math.min(45, dragStartRef.current.rotX - dy * 0.55));
        setRotationZ(targetRotZ);
        setRotationX(targetRotX);
      } else {
        setPanX(dragStartRef.current.panX + dx);
        setPanY(dragStartRef.current.panY + dy);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current.isDragging = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // 2. Touch Events for mobile panning/zooming
  const handleSeatTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;

    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dst = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartDistanceRef.current = dst;
      touchStartScaleRef.current = scaling;
      return;
    }

    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      rotX: rotationX,
      rotZ: rotationZ,
      panX: panX,
      panY: panY,
      isDragging: true
    };
  };

  const handleSeatTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDistanceRef.current !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dst = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dst / touchStartDistanceRef.current;
      setScaling(Math.max(0.5, Math.min(3, touchStartScaleRef.current * ratio)));
      return;
    }

    if (!dragStartRef.current.isDragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;

    if (dragMode === 'rotate') {
      const targetRotZ = dragStartRef.current.rotZ - dx * 0.7;
      const targetRotX = Math.max(-45, Math.min(45, dragStartRef.current.rotX - dy * 0.6));
      setRotationZ(targetRotZ);
      setRotationX(targetRotX);
    } else {
      setPanX(dragStartRef.current.panX + dx);
      setPanY(dragStartRef.current.panY + dy);
    }
  };

  const handleSeatTouchEnd = () => {
    setIsDragging(false);
    dragStartRef.current.isDragging = false;
    touchStartDistanceRef.current = null;
  };

  const handleSeatWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const di = 0.08;
    const delta = e.deltaY < 0 ? 1 : -1;
    setScaling(Math.max(0.5, Math.min(3, scaling + delta * di)));
  };

  // Seat rendering helper
  const renderSeatRows = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    
    return rows.map((row) => {
      const isLastRow = row === 'K';
      const leftCount = isLastRow ? 4 : 8;
      const rightCount = isLastRow ? 8 : 10;

      return (
        <div key={row} className="flex items-center justify-between text-[9px] font-mono text-cyan-400 gap-2 px-1">
          {/* Row Identifier left */}
          <span className="w-3 font-bold text-center text-cyan-500">{row}</span>

          {/* Core Seats container */}
          <div className="flex-1 flex justify-between items-center px-1">
            {/* Left Block */}
            <div className="flex gap-[2px]">
              {Array.from({ length: leftCount }).map((_, i) => {
                const seatNum = i + 1;
                const seatId = `${row}${seatNum}`;
                const isSelected = selectedSeat === seatId;
                const isWheelchairSeat = row === 'D' && (seatNum === 1 || seatNum === 2); // Mark D1, D2 as wheelchair seats

                return (
                  <button
                    key={seatId}
                    type="button"
                    title={`${seatId} 좌석`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSeat(seatId);
                      speakSeatAccessibility(isWheelchairSeat ? `${seatId} (안심 휠체어 양보석)` : seatId);
                    }}
                    className={`w-[7px] h-[7px] xs:w-[8px] xs:h-[8px] sm:w-[9px] sm:h-[9px] rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-400 border-white ring-2 ring-emerald-500 scale-125' 
                        : isWheelchairSeat
                        ? 'bg-blue-600 border-cyan-400 animate-pulse'
                        : 'border-cyan-500/50 hover:bg-cyan-500/30'
                    }`}
                  />
                );
              })}
            </div>

            {/* Gap aisle and center spacer */}
            <div className="w-5 text-[7px] text-slate-600 font-sans font-bold text-center">통로</div>

            {/* Right Block */}
            <div className="flex gap-[2px]">
              {Array.from({ length: rightCount }).map((_, i) => {
                const seatNum = (isLastRow ? 4 : 8) + i + 1;
                const seatId = `${row}${seatNum}`;
                const isSelected = selectedSeat === seatId;
                const isWheelchairSeat = row === 'D' && (seatNum === 9 || seatNum === 10); // Mark D9, D10 too

                return (
                  <button
                    key={seatId}
                    type="button"
                    title={`${seatId} 좌석`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSeat(seatId);
                      speakSeatAccessibility(isWheelchairSeat ? `${seatId} (안심 휠체어 양보석)` : seatId);
                    }}
                    className={`w-[7px] h-[7px] xs:w-[8px] xs:h-[8px] sm:w-[9px] sm:h-[9px] rounded-full border transition-all flex items-center justify-center cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-400 border-white ring-2 ring-emerald-500 scale-125' 
                        : isWheelchairSeat
                        ? 'bg-blue-600 border-cyan-400 animate-pulse'
                        : 'border-cyan-500/50 hover:bg-cyan-500/30'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Row Identifier right */}
          <span className="w-3 font-bold text-center text-cyan-500">{row}</span>
        </div>
      );
    });
  };

  return (
    <div className={`space-y-6 pt-1 text-left pb-16 ${highContrast ? 'high-contrast-mode' : ''}`}>
      
      {/* 1. Header Banner Detail with cover & back chevron */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-[#0B0F19] border border-slate-800 p-4 shadow-xl">
        
        {/* Absolute Blurry decorative poster background */}
        <div className="absolute inset-0 bg-cover bg-center brightness-[0.15] blur-md opacity-30 select-none pointer-events-none" style={{ backgroundImage: `url(${show.image})` }} />

        {/* Action Header Nav bar */}
        <div className="flex items-center justify-between relative z-10 mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-800/80 active:scale-95 transition-all cursor-pointer"
            aria-label="돌아가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <span className="text-[10px] font-mono font-black tracking-widest text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-1 rounded-full border border-[#00E5FF]/20 animate-pulse">
            S-SIGHT VERIFY (VR 연동됨)
          </span>
        </div>

        {/* Content details banner */}
        <div className="flex items-start gap-4 relative z-10">
          <div className="relative shrink-0">
            <img 
              src={show.image} 
              alt={show.title} 
              className="w-24 h-32 object-cover rounded-2xl border border-slate-800 shadow-2xl filter brightness-95"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect width="100%" height="120%" fill="%23131d35"/><text x="50%" y="45%" font-family="sans-serif" font-size="10" fill="%2300E5FF" font-weight="bold" text-anchor="middle" dominant-baseline="middle">THEATER</text><text x="50%" y="65%" font-family="sans-serif" font-size="8" fill="%2364748b" text-anchor="middle" dominant-baseline="middle">POSTER</text></svg>`;
              }}
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow border border-slate-900">
              {show.score}% 매칭
            </div>
          </div>

          <div className="space-y-2 flex-1 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[9px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                {show.genre}
              </span>
              <span className="text-[9.5px] font-bold text-slate-400">
                {show.facility}
              </span>
            </div>

            <h2 className="text-xl font-black text-white leading-tight tracking-tight">
              {show.title}
            </h2>

            {/* Quick specifications inside header grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5 pt-2 border-t border-slate-800/70">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[10px] leading-none font-bold">2026.05.28 ~ 2026.08.15</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="text-[10px] leading-none font-bold">조승우, 전동석, 김주택</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Offered accessibility amenities badge list */}
      <div className="space-y-2">
        <h4 className="text-xs font-black text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#00E5FF]" />
          제공되는 장애 편의 시설
        </h4>
        <div className="flex flex-wrap gap-2">
          {show.tags.includes("휠체어석") || true ? (
            <span className="px-3.5 py-2 rounded-xl text-xs bg-[#121214] border border-[#00E5FF]/30 text-slate-200 font-bold flex items-center gap-1.5 shadow-sm">
              <span className="text-sm">♿</span> 휠체어 접근 가능
            </span>
          ) : null}
          {show.tags.includes("자막제공") || true ? (
            <span className="px-3.5 py-2 rounded-xl text-xs bg-[#121214] border border-[#00E5FF]/30 text-slate-200 font-bold flex items-center gap-1.5 shadow-sm">
              <span className="text-sm">💬</span> 자막 제공 (자막 안경 전정 연동)
            </span>
          ) : null}
          <span className="px-3.5 py-2 rounded-xl text-xs bg-[#121214] border border-slate-800 text-slate-400 font-semibold flex items-center gap-1.5 shadow-sm">
            <span className="text-sm">🎙️</span> 화면 해설 (오디오 동반 가이드)
          </span>
        </div>
      </div>

      {/* 3. Seat Matrix and Sight Verification (Interactive zoom/move/tilt drag) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#00E5FF]" />
            좌석 배치도 및 시야 확인
          </h4>
          <span className="px-2 py-0.5 text-[8.5px] font-black text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 rounded-full">
            VR 연동됨
          </span>
        </div>

        {/* 3D Drag HUD helper guide banner */}
        <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-400 text-[10px] flex items-center justify-between gap-2 leading-relaxed">
          <span>
            💡 드래그하여 각도를 <strong>회전</strong>하고, 마우스 휠이나 핀치 줌으로 <strong>확대</strong>하세요!
          </span>
          <button 
            onClick={() => {
              setRotationX(0);
              setRotationZ(0);
              setScaling(1);
              setPanX(0);
              setPanY(0);
              setSelectedSeat(null);
              onAnnounce("좌석도 초점을 원위치로 초기 복원 조치했습니다.");
            }}
            className="p-1 px-1.5 text-[9px] bg-slate-800 hover:bg-slate-705 text-[#00E5FF] font-bold rounded-lg whitespace-nowrap border border-slate-700 active:scale-95"
          >
            기본정렬
          </button>
        </div>

        {/* Interactive Screen container stage */}
        <div 
          onMouseDown={handleSeatMouseDown}
          onTouchStart={handleSeatTouchStart}
          onTouchMove={handleSeatTouchMove}
          onTouchEnd={handleSeatTouchEnd}
          onWheel={handleSeatWheel}
          className={`relative rounded-3xl border border-blue-500/20 bg-slate-950/90 h-[280px] overflow-hidden flex flex-col justify-between p-4 shadow-inner select-none ${
            isDragging ? 'cursor-grabbing' : dragMode === 'pan' ? 'cursor-grab' : 'cursor-move'
          }`}
          style={{ touchAction: 'none' }}
        >
          
          {/* Top Stage display */}
          <div className="text-center w-full z-10 select-none pointer-events-none mb-1">
            <span className="text-[9px] font-bold tracking-widest text-[#00E5FF] opacity-60 uppercase block">
              (강의실 무대)
            </span>
            <span className="text-[12px] font-black tracking-widest text-cyan-400 uppercase block mt-[1px]">
              (LECTURE STAGE)
            </span>
            <div className="w-24 h-[1.5px] bg-[#00E5FF]/40 mx-auto mt-2 blur-[0.5px]" />
          </div>

          {/* Right Upper side indicators */}
          <div className="absolute top-4 right-5 text-right select-none pointer-events-none z-10 leading-tight">
            <span className="text-[8px] text-cyan-400/70 block">(앞문)</span>
            <span className="text-[9px] font-bold text-cyan-500/90 tracking-tight block">(FRONT DOOR)</span>
          </div>

          {/* Core transformable scroll wrap */}
          <div className="flex-1 flex items-center justify-center relative my-2 overflow-hidden">
            <div
              style={{
                transform: `perspective(800px) rotateX(${rotationX}deg) rotateZ(${rotationZ}deg) scale(${scaling}) translate3d(${panX}px, ${panY}px, 0px)`,
                transformStyle: 'preserve-3d',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              className="w-full max-w-[270px] space-y-[4px] p-2 bg-slate-900/40 rounded-2xl border border-slate-900/80 my-auto shadow-inner"
            >
              {renderSeatRows()}
            </div>
          </div>

          {/* Row Doors bottom references */}
          <div className="flex justify-between items-center z-10 w-full px-2 text-[8px] select-none pointer-events-none font-bold text-cyan-500/70">
            <div className="text-left leading-tight">
              <span>(뒷문)</span>
              <span className="block text-[7px] font-mono tracking-tight">(REAR DOOR)</span>
            </div>
            
            {selectedSeat && (
              <div className="bg-slate-900 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-0.5 rounded text-[8px] flex items-center gap-1 animate-pulse">
                <span>🎯 선택: <strong>{selectedSeat}</strong> {selectedSeat.startsWith('D') && '♿ 우대석'}</span>
              </div>
            )}

            <div className="text-right leading-tight">
              <span>(뒷문)</span>
              <span className="block text-[7px] font-mono tracking-tight">(REAR DOOR)</span>
            </div>
          </div>

        </div>

        {/* 2 Big Call-to-actions under the seat-map */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Bigger zoom view */}
          <button
            onClick={() => {
              setIsLayoutModalOpen(true);
              onAnnounce("좌석 배치도 상세 도표 창을 팝업 전장 확대하였습니다.");
            }}
            className="py-3 px-4 rounded-xl text-[10.5px] font-black border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            배치도 크게 보기
          </button>

          {/* 360 VR Vision linking */}
          <a
            href="https://yoonsolcho.github.io/10318_VR/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              onAnnounce("샤롯데씨어터 실감 VR 1층 시야 안심 체험 사이트로 외부 링크 이송 접속합니다.");
            }}
            className="py-3 px-4 rounded-xl text-[10.5px] font-black bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-sans tracking-tight text-center flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            VR/360도로 생생한 시야 확인하기
          </a>
        </div>
      </div>

      {/* 4. Performances & Theater Accessibility evaluation reviews */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Normal Performance Reviews */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-500" />
            공연 후기
          </h4>
          <div className="space-y-2">
            {reviews.normal.map((r, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#121214] border border-[#212124] text-left space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-rose-450">{r.author}</span>
                  <div className="flex gap-[1px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-200 font-bold leading-normal">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility Specific Reviews */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-black text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            극장 접근성 후기
          </h4>
          <div className="space-y-2">
            {reviews.accessibility.map((r, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#121214] border border-[#212124]/90 text-left space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                    {r.author}
                    {r.tags.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-[7px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans font-bold capitalize">
                        {t}
                      </span>
                    ))}
                  </span>
                  <div className="flex gap-[1px]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'text-emerald-500 fill-emerald-500' : 'text-slate-750'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-200 font-bold leading-normal">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Ticket Reservation platform direct links */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-black text-slate-300 tracking-wider uppercase">
          티켓 예매 등 바로가기
        </h4>
        <div className="space-y-2">
          <div className="p-3 bg-[#121214] border border-[#212124] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-red-800/20 border border-red-500/30 text-red-400 text-[9px] font-black rounded-lg">
                인터파크 티켓
              </span>
              <span className="text-[10px] text-slate-400 font-bold">공식 지정 배리어프리 파트너</span>
            </div>
            <a
              href="https://ticket.interpark.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onAnnounce("인터파크 공식 예매 처소로 바로 이동 접속합니다.")}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-[9.5px] rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
            >
              예매하기 <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-3 bg-[#121214] border border-[#212124] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-emerald-800/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black rounded-lg">
                멜론티켓
              </span>
              <span className="text-[10px] text-slate-400 font-bold">일반 청각 무장벽 시연 지원지</span>
            </div>
            <a
              href="https://ticket.melon.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onAnnounce("멜론 전용 예매 대행 처소로 바로 접속 추진합니다.")}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-[9.5px] rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
            >
              예매하기 <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 6. Big layout Modal fallback */}
      {isLayoutModalOpen && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur z-55 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-blue-500/30 p-6 space-y-4 relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                ♿ {show.title} 좌석 배치도 대형도
              </h3>
              <button 
                onClick={() => setIsLayoutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-350 hover:text-white flex items-center justify-center font-bold text-xs"
              >
                닫기
              </button>
            </div>
            
            {/* Extended Flat Matrix for easy visibility */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-1 overflow-x-auto">
              <div className="text-center text-[10px] text-cyan-400 font-black mb-3">
                무대 방향 (STAGE DIRECTION)
              </div>
              
              <div className="space-y-[3px]">
                {renderSeatRows()}
              </div>

              <div className="pt-4 flex items-center justify-center gap-4 text-[9px] text-slate-400 font-sans font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-cyan-500/50" /> 일반 판매 석
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-cyan-400 animate-pulse" /> ♿ 휠체어석 (양보선)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white" /> 선택된 지정석
                </span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center leading-relaxed font-bold">
              Tip: 임의의 좌석 서클을 골라 터치하면 상호 연계 TTS 가이드를 안전 탑청합니다.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
