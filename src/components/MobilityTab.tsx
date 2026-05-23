import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Map, Zap, Layers, Play, StopCircle, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { MAPS_DATA, FLOORS_DATA } from '../data';

interface MobilityTabProps {
  onAnnounce: (msg: string) => void;
  highContrast: boolean;
}

export default function MobilityTab({ onAnnounce, highContrast }: MobilityTabProps) {
  const [selectedTheaterId, setSelectedTheaterId] = useState('theater_403');
  const [isArActive, setIsArActive] = useState(false);
  const [isSMap3DActive, setIsSMap3DActive] = useState(false);
  const [selected3DFloor, setSelected3DFloor] = useState<number>(4);
  const [isArObstacleAlertActive, setIsArObstacleAlertActive] = useState(false);
  const [isElevatorBroken, setIsElevatorBroken] = useState(true);

  const activeMap = MAPS_DATA[selectedTheaterId] || MAPS_DATA.theater_403;

  const handleTheaterChange = (tid: string) => {
    setSelectedTheaterId(tid);
    const item = MAPS_DATA[tid];
    onAnnounce(`안내 지도를 [${item.header.split(' ')[0]}] 전용 공간으로 변환 조치하였습니다.`);
  };

  const handleArToggle = () => {
    const newState = !isArActive;
    setIsArActive(newState);
    setIsSMap3DActive(false);

    if (newState) {
      onAnnounce("실시간 입체 지시 가이드: AR 마일스톤 안전 보행 및 단차 탐지 모드를 탑재 개시했습니다.");
    } else {
      onAnnounce("실시간 AR 렌즈 탐색을 안전하게 해제하여 도면 정보로 우회하였습니다.");
    }
  };

  const handleSMapToggle = () => {
    const newState = !isSMap3DActive;
    setIsSMap3DActive(newState);
    setIsArActive(false);

    if (newState) {
      setSelected3DFloor(4);
      onAnnounce("건물 3D 입체 구조 시뮬레이터를 가동했습니다. 터치를 통해 층별 내부 단면을 자유롭게 관측 가능합니다.");
    } else {
      onAnnounce("입체 조형 투시 모드를 안전 정지 해제했습니다.");
    }
  };

  const selectFloor = (fNum: number) => {
    setSelected3DFloor(fNum);
    onAnnounce(`건물 3D 구조도: [${fNum}층] 단면 가상 투시 조회를 실행했습니다.`);
  };

  const handleMockObstacleSimulation = () => {
    const nextAlertState = !isArObstacleAlertActive;
    setIsArObstacleAlertActive(nextAlertState);

    if (nextAlertState) {
      onAnnounce("💓 [스마트 안심 진동 발생!] 전방 0.8m 통행 장애물이 감지되어 고강도 고주파 보행 안전 진동 경고가 제어되었습니다!");
      if (navigator.vibrate) {
        navigator.vibrate([250, 100, 250, 100, 300]);
      }
    } else {
      onAnnounce("보행 경로의 임시 장애물이 무사 소거되어 진동 알람을 소거 안전 복구 조치했습니다.");
    }
  };

  const handleElevatorToggle = () => {
    const nextElevatorState = !isElevatorBroken;
    setIsElevatorBroken(nextElevatorState);

    if (nextElevatorState) {
      onAnnounce("장애 현장 점검: 혜화역 4번출구 엘리베이터 상태가 [안내중: 복구 대기]로 원격 셋업되었습니다.");
    } else {
      onAnnounce("상태 변경 완료: 혜화역 4번 출입구 엘리베이터 기계가 정상 복구되어 전속 작동 중입니다.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Floor Congestion Card */}
      <div className="hc-card rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Map className="w-4 h-4 text-blue-500" />
              대학로 복합 예술홀 403 실시간 약도
            </h3>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded px-1.5 py-0.5 hc-badge">
              지수 {activeMap.score.split(' ')[1]}
            </span>
          </div>
        </div>

        {/* Theater Select buttons */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <button
            onClick={() => handleTheaterChange('theater_403')}
            className={`py-2 text-xs font-bold rounded-xl transition-all border text-center ${
              selectedTheaterId === 'theater_403'
                ? 'bg-blue-600 text-white border-blue-500 shadow shadow-blue-500/10'
                : 'border-slate-800 bg-slate-950 text-slate-300'
            }`}
          >
            대학로 공터 403
          </button>
          <button
            onClick={() => handleTheaterChange('theater_dream')}
            className={`py-2 text-xs font-bold rounded-xl transition-all border text-center ${
              selectedTheaterId === 'theater_dream'
                ? 'bg-blue-600 text-white border-blue-500 shadow shadow-blue-500/10'
                : 'border-slate-800 bg-slate-950 text-slate-300'
            }`}
          >
            민들레 극장
          </button>
          <button
            onClick={() => handleTheaterChange('theater_hanye')}
            className={`py-2 text-xs font-bold rounded-xl transition-all border text-center ${
              selectedTheaterId === 'theater_hanye'
                ? 'bg-blue-600 text-white border-blue-500 shadow shadow-blue-500/10'
                : 'border-slate-800 bg-slate-950 text-slate-300'
            }`}
          >
            한예아트홀
          </button>
        </div>

        {/* Blueprint display simulator */}
        <div className="relative w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-3">
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:14px_14px]"></div>

          {/* 1. AR CAMERA CONTAINER HOOK */}
          {isArActive && (
            <div className="absolute inset-0 bg-slate-955 flex flex-col justify-between p-3 z-20 border border-cyan-500/50 rounded-xl">
              <div className="absolute inset-0 bg-cyan-950/20 pointer-events-none opacity-30 bg-[linear-gradient(to_right,#0891b2_1px,transparent_1px),linear-gradient(to_bottom,#0891b2_1px,transparent_1px)] bg-[size:16px_16px]"></div>

              {/* HUD */}
              <div className="relative z-15 flex items-center justify-between text-[8px] bg-slate-900 border border-cyan-500/30 p-1.5 rounded-lg text-cyan-400">
                <span className="font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                  <span className="text-white font-extrabold">AI AR 실시간 카메라 보조 가이드</span>
                </span>
                <span className="font-mono bg-cyan-950 px-1 border border-cyan-805 rounded animate-pulse">실시간 정합</span>
              </div>

              {/* Overlay Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full border border-dashed border-cyan-500/30 flex items-center justify-center animate-spin-slow">
                  <div className="w-2 h-2 rounded-full bg-cyan-400/80 animate-ping" />
                </div>
              </div>

              {/* Guide paths */}
              <div className="relative z-10 flex flex-col justify-between h-full py-1">
                <div className="flex justify-between items-start">
                  <div className="bg-[#0f172a]/95 border border-blue-500/30 p-2 rounded-lg text-[8px] max-w-[150px] text-left">
                    <p className="font-black text-white flex items-center gap-1 mb-0.5">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      목적지: 대학로 예술홀 403호
                    </p>
                    <span className="text-slate-400">남은거리: 28m · 안전 램프 매칭</span>
                  </div>
                  <span className="bg-cyan-950/70 border border-cyan-500/20 px-1.5 py-0.5 rounded text-[7px] font-mono text-cyan-300">
                    GPS 정합률: 99.8%
                  </span>
                </div>

                {/* Floating labels */}
                <div className="relative w-full flex-1 flex flex-col items-center justify-end">
                  <div className="absolute bottom-1 flex flex-col items-center pointer-events-none gap-0.5">
                    <span className="text-[8px] text-cyan-300 bg-cyan-950/95 border border-cyan-500/20 px-1.5 py-0.5 rounded font-black tracking-wide">
                      🔵 AI 안전 보행로 유도선
                    </span>
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-cyan-500 animate-bounce" />
                  </div>

                  {/* Obstacles warning */}
                  {isArObstacleAlertActive && (
                    <motion.div
                      initial={{ scale: 0.9, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      className="absolute bottom-10 bg-red-955 border border-red-500 p-2 rounded-xl text-[8.5px] max-w-[180px] space-y-1 animate-shake shadow-lg text-left"
                    >
                      <div className="flex items-center gap-1 text-red-400 font-extrabold text-white">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>전방 보행장애물 발견 🚨</span>
                      </div>
                      <p className="text-white leading-normal font-semibold">통행로 임시 안전 폐쇄! 우회 바랍니다.</p>
                      <div className="flex items-center justify-between text-[7px] bg-red-900/30 p-1 rounded border border-red-500/35 text-red-300">
                        <span>💓 손목 진동 경고 작동 중</span>
                        <span className="bg-red-500 text-white px-1 rounded animate-pulse">디바이스 진동</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Action testing button */}
              <div className="relative z-15 flex gap-2 items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-lg text-left">
                <span className="text-[8px] text-slate-400 font-semibold leading-normal">
                  💡 <span className="text-slate-200">체험형 테스트:</span> 장애물 턱 출현 시 강한 진동 알림 체험
                </span>
                <button
                  onClick={handleMockObstacleSimulation}
                  className="p-1 px-3 rounded-lg bg-red-650 hover:bg-red-700 text-white text-[8px] font-black transition-all whitespace-nowrap shrink-0 hc-button-primary"
                >
                  {isArObstacleAlertActive ? '장애물 복원 완료' : '장애물 알람 시뮬'}
                </button>
              </div>
            </div>
          )}

          {/* 2. SMAP 3D LAYERED MODEL HOOK */}
          {isSMap3DActive && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col justify-between p-3 z-20 border border-blue-500/50 rounded-xl">
              <div className="flex justify-between items-center bg-slate-900 p-1.5 rounded-lg border border-blue-500/30 text-[9px] text-blue-400">
                <span className="font-bold flex items-center gap-1.5 hc-accent">
                  <Layers className="w-3 h-3 animate-bounce" />
                  입체 3D 건물 층별 내부 구조 (터치하여 층 대입)
                </span>
              </div>

              <div className="relative flex-1 flex flex-row gap-2 items-stretch justify-center h-full my-1">
                {/* 3D stacked elevator list on left */}
                <div className="w-[120px] flex flex-col justify-between gap-1 pr-1 border-r border-slate-800 shrink-0">
                  {[4, 3, 2, 1].map((f) => (
                    <button
                      key={f}
                      onClick={() => selectFloor(f)}
                      className={`p-1 px-1.5 rounded-lg text-left text-[8px] font-bold border transition-all flex items-center justify-between ${
                        selected3DFloor === f
                          ? 'text-white bg-blue-600 border-blue-500'
                          : 'border-slate-850 text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <span>{f}F {f === 4 ? '관람홀 403' : f === 3 ? '보행 브리지' : f === 2 ? '중앙 매표소' : '전용 로비'}</span>
                      {f === 4 ? (
                        <span className="text-[6.5px] bg-red-500/20 text-red-400 px-0.5 rounded font-black">종점</span>
                      ) : f === 1 ? (
                        <span className="text-[6.5px] text-cyan-400">진입</span>
                      ) : null}
                    </button>
                  ))}
                </div>

                {/* Selected Floor dynamic description */}
                <div className="flex-1 bg-slate-900/60 border border-slate-850 rounded-xl p-2.5 flex flex-col justify-between text-left relative overflow-hidden">
                  <div className="relative z-10 space-y-1 flex flex-col justify-between h-full">
                    <div>
                      <span className="text-[9px] font-black text-cyan-400 block h-4">
                        {FLOORS_DATA[selected3DFloor]?.title}
                      </span>
                      <p className="text-[8px] text-slate-300 leading-normal font-semibold mt-1">
                        {FLOORS_DATA[selected3DFloor]?.desc}
                      </p>
                    </div>
                    <div className="bg-indigo-950/40 p-1.5 rounded border border-indigo-500/20 text-[7.5px] text-indigo-300 flex justify-between items-center">
                      <span>{FLOORS_DATA[selected3DFloor]?.stat}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. DEFAULT GRAPHIC VIEW (Blueprint) */}
          <div className="relative w-full h-full flex flex-col justify-between text-left">
            <div className="flex justify-between items-start">
              <span className="hc-badge inline-flex items-center text-[8px] bg-cyan-950 text-cyan-400 font-bold border border-cyan-800 rounded px-1.5 py-0.5">
                {activeMap.header}
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900/40 px-1 rounded">
                {activeMap.crowd}
              </span>
            </div>

            {/* Stage Layout graphics */}
            <div className="flex-1 flex items-center justify-center relative my-2">
              <div className="w-32 h-6 bg-slate-800 border border-slate-705 flex items-center justify-center text-[8.5px] text-slate-400 font-bold uppercase rounded-b-md">
                STAGE (무대 전방)
              </div>
              <div className="absolute bottom-1 flex gap-2">
                <div className="w-5.5 h-5.5 rounded bg-blue-500/20 border border-blue-500/80 flex items-center justify-center text-[8px] text-blue-400 font-bold">
                  ♿
                </div>
                <div className="w-5.5 h-5.5 rounded bg-blue-500/20 border border-blue-500/80 flex items-center justify-center text-[8px] text-blue-400 font-bold">
                  ♿
                </div>
                <div className="w-5.5 h-5.5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] text-slate-500 font-bold">
                  A-1
                </div>
                <div className="w-5.5 h-5.5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] text-slate-500 font-bold">
                  A-2
                </div>
              </div>

              {/* Blue tracking point indicator */}
              <div className="absolute left-1/3 top-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-ping" />
              <div className="absolute left-1/3 top-1/2 w-2 h-2 bg-cyan-400 rounded-full border border-white" />
            </div>

            <div className="text-[10px] text-slate-400 leading-normal bg-slate-900/40 p-1.5 rounded border border-slate-800 flex justify-between items-center">
              <span className="truncate pr-1">{activeMap.milestone}</span>
              <span className="text-[9px] font-bold text-blue-400 font-mono shrink-0">
                {activeMap.dist}m
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic trigger control buttons */}
        <div className="grid grid-cols-2 gap-3 mt-1.5">
          {/* Quick AR Guide */}
          <div className="hc-card rounded-2xl p-3 bg-slate-950 border border-slate-805 space-y-2 text-left">
            <h4 className="text-xs font-black text-white flex items-center gap-1">
              <Play className="w-3.5 h-3.5 text-cyan-400" />
              AI AR 길안내
            </h4>
            <p className="text-[9px] text-slate-400 leading-relaxed hc-text-mute">
              화면 카메라 렌즈 인식으로 턱 높낮이를 계측해 보행 유도 유도선을 그립니다.
            </p>
            <button
              onClick={handleArToggle}
              className={`w-full py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                isArActive
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isArActive ? '안내 중지' : '카메라 활성'}
            </button>
          </div>

          {/* Isometric 3D View */}
          <div className="hc-card rounded-2xl p-3 bg-slate-950 border border-slate-805 space-y-2 text-left">
            <h4 className="text-xs font-black text-white flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              건물 3D 입체도
            </h4>
            <p className="text-[9px] text-slate-400 leading-relaxed hc-text-mute">
              엘리베이터 브리지 및 다중 층 구조 단면을 확인해 안전하게 진로를 투시해봅니다.
            </p>
            <button
              onClick={handleSMapToggle}
              className={`w-full py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-1 ${
                isSMap3DActive
                  ? 'bg-blue-500/20 border-blue-501 text-blue-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isSMap3DActive ? '투시 정지' : '3D 투시'}
            </button>
          </div>
        </div>
      </div>

      {/* Metro Lift Service Notice Alert Box */}
      <div
        onClick={handleElevatorToggle}
        className={`hc-card rounded-2xl p-4 border transition-all cursor-pointer text-left ${
          isElevatorBroken
            ? 'bg-red-500/10 border-red-500/50 hover:bg-red-505/20'
            : 'bg-green-500/10 border-green-500/50 hover:bg-green-505/20'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isElevatorBroken ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
            }`}
          >
            {isElevatorBroken ? (
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-black tracking-wide uppercase font-mono ${
                  isElevatorBroken ? 'text-red-400' : 'text-green-400'
                }`}
              >
                [실시간 지하철 리프트 알림]
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                  isElevatorBroken
                    ? 'bg-red-400/20 text-red-300 border-red-500/30'
                    : 'bg-green-400/20 text-green-300 border-green-500/30'
                }`}
              >
                {isElevatorBroken ? '고장 발생' : '정상 복구'}
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-white">
              {isElevatorBroken
                ? '혜화역 4번 출구 승강기 대형 부품 파손 고장'
                : '혜화역 내부 및 출입구 엘리베이터 승강기 안전 정상 복원'}
            </h4>
            <p className="text-[10px] text-slate-300 leading-relaxed hc-text-mute">
              {isElevatorBroken
                ? '현재 에스컬레이터 대형 부품 고사로 휠체어 전동 특차 이용자는 우회 통로 이용 요망'
                : '종합 안전 검진을 무사히 수립하여 지체 동행 장애인 관람객 리프트를 포함 전 라인 즉각 가동 가능'}
            </p>
            <p className="text-[9px] text-slate-500 italic mt-1 font-semibold hc-text-mute">
              * 기기를 터치해 가상 원격 전산망 수리 복원 완료를 시뮬레이션 해보실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
