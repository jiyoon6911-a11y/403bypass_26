import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map, Zap, Layers, Play, StopCircle, CheckCircle, 
  AlertTriangle, AlertOctagon, Compass, Video, 
  HelpCircle, Accessibility, Activity, Volume2, 
  VolumeX, RefreshCw, Eye, Landmark, Navigation2, LogIn,
  Sliders, X
} from 'lucide-react';
import { FLOORS_DATA } from '../data';

interface MobilityTabProps {
  onAnnounce: (msg: string) => void;
  highContrast: boolean;
}

// Highly explicit 3D architectural floor schematics including restroom, pathways, elevator, and hazards
interface EnhancedFloorDetail {
  title: string;
  desc: string;
  pathway: string;
  elevator: string;
  toilet: string;
  hazards: string;
  visualPathNodes: Array<{ x: number; y: number; label: string; type: 'path' | 'toilet' | 'elevator' | 'hazard' }>;
}

const DETAILED_3D_FLOORS: Record<number, EnhancedFloorDetail> = {
  4: {
    title: "4F [대학로 복합 예술홀 메인 관람석]",
    desc: "기어 단차가 전혀 없는 평탄형 설계 플로어. 시각 무대 안심 동선 및 휠체어 전용 발코니 우대 전용석이 인접되어 있습니다.",
    pathway: "🗺️ 안심 권장 이동 경로: 초고속 엘리베이터 승하차 후 점자 블록 트랙을 따라 직진 12미터 진입 ➡️ 자동유도 미닫이문 통과 완료",
    elevator: "🛗 승강설비: [서측 메인 침대형 특대 엘리베이터] 연계 (정상 실시간 서비스 중)",
    toilet: "🚻 장애인 전용 편의실: [객석 남여 구분 다목적 화장실] 자동 개폐문, 비상 제어 도움벨 탑재, 수평 손잡이 가설 완료",
    hazards: "⚠️ 세밀 관찰 요망 장애 구역: 중앙 콘솔 뒤편 마이크 오디오 선로 케이블 배선 보호대 턱 (안전 마찰 경사판 덮개 처리됨)",
    visualPathNodes: [
      { x: 30, y: 80, label: "🛗 메인 침대 엘리베이터", type: "elevator" },
      { x: 45, y: 65, label: "🚶 유도 점자 트랙", type: "path" },
      { x: 65, y: 50, label: "⚠️ 케이블 배선 경사판", type: "hazard" },
      { x: 80, y: 70, label: "🚻 장애인 화장실", type: "toilet" },
      { x: 85, y: 35, label: "♿ 휠체어 전용석 종점", type: "path" }
    ]
  },
  3: {
    title: "3F [공공 보행 지원 안심 브리지]",
    desc: "서로 다른 건물의 본관과 극장 별관 홀을 평탄하게 보조 연결하는 실외 통행용 고상 육교 복도 구간입니다.",
    pathway: "🗺️ 안심 권장 이동 경로: 본관 승강기 방면 평탄 복도 ➡️ 육교 난간 구간 직진 ➡️ 별관 연결부 안심 오토 슬라이딩 게이트 통과",
    elevator: "🛗 승강설비: [별관 연결부 안심 전동 휠체어 보조 수직 리프트] 완설 작동 가용함",
    toilet: "❌ 장애인 전용 편의실: 3층 구역 내부에는 전용 화장실이 부재합니다. 보행 이동 후 2F 대합실 또는 4F 안심 화장실 이용을 기획 권장합니다.",
    hazards: "⚠️ 세밀 관찰 요망 장애 구역: 보행용 야외 브리지 우천시 미끄럼 가속 우려 (황색 고마찰 안심 우레탄 시트 밀착 가로 시공됨)",
    visualPathNodes: [
      { x: 20, y: 40, label: "🛗 보완 휠체어 리프트", type: "elevator" },
      { x: 45, y: 45, label: "🚶 야외 안심 고상 브리지", type: "path" },
      { x: 65, y: 50, label: "⚠️ 미끄럼 주의 시트 구간", type: "hazard" },
      { x: 85, y: 55, label: "🚪 안심 슬라이딩 게이트", type: "path" }
    ]
  },
  2: {
    title: "2F [중앙 배리어프리 매표소 및 촉지도]",
    desc: "티켓 부스 데스크가 있으며 저고도 배리어프리 저상 통합 무인 키오스크와 수어 안심 대면 복지 서비스 데스크가 집중 배치되어 있습니다.",
    pathway: "🗺️ 안심 권장 이동 경로: 서편 로비 진입 경사로 ➡️ 촉지도 음성 점자판 안내 체험 ➡️ 통합 저저 도가 매표소 연계 보도 직결",
    elevator: "🛗 승강설비: [중앙 엘리베이터 1호기] 및 지하철 연계 연동 통로 승강 게이지 정밀 작동 중",
    toilet: "🚻 장애인 전용 편의실: [수어 데스크 우측 코너 내부] 장애인 수평 수직 가변 손잡이 세면기 및 점자 유도형 화장실 완비",
    hazards: "⚠️ 세밀 관찰 요망 장애 구역: 대기 인원이 많을 때 발생하는 차단 가이드 라인 벨트 (서포터들이 정체 현상 완화 관리 중)",
    visualPathNodes: [
      { x: 15, y: 70, label: "🛗 중앙 엘리베이터 1호기", type: "elevator" },
      { x: 30, y: 55, label: "👁️ 음성 점자 촉지도", type: "path" },
      { x: 50, y: 40, label: "🎟️ 휠체어 저상 매표 키오스크", type: "path" },
      { x: 75, y: 45, label: "⚠️ 가이드 대기 라인 벨트", type: "hazard" },
      { x: 85, y: 75, label: "🚻 영유아 겸용 장애 화장실", type: "toilet" }
    ]
  },
  1: {
    title: "1F [로비, 지하철 4번 출구 무벽 연계로]",
    desc: "지상 차량 진입로 정문 슬라이딩 완전 개패 통로 및 혜화역 대합실 연계 통로가 가단성 없이 일체로 연출된 광활한 보편적 로비입니다.",
    pathway: "🗺️ 안심 권장 이동 경로: 지하철 4번출입 정합 엘리베이터 하차 ➡️ 로비 통합 무장벽 게이트 진입 ➡️ 중앙 엘리베이터 인접 보도 통과",
    elevator: "🛗 승강설비: [외부 연계 침대형 리프트] 및 내부 승강기 통합 3대 가동 작동 중",
    toilet: "🚻 장애인 전용 편의실: [로비 엘리베이터 우측 코너] 다각도 회전 도움 손잡이 및 장애벨 가설 완료",
    hazards: "⚠️ 세밀 관찰 요망 장애 구역: 혜화역 4번출구 지상 연계 엘리베이터 덮개 공사 가벼운 먼지 가림막 장애",
    visualPathNodes: [
      { x: 15, y: 75, label: "🛗 외부 침대 리프트 혜화역", type: "elevator" },
      { x: 40, y: 60, label: "🚪 로비 무장벽 메인 게이트", type: "path" },
      { x: 65, y: 45, label: "⚠️ 혜화역 4번출구 점검 가림막", type: "hazard" },
      { x: 80, y: 70, label: "🚻 로비 서편 장애인 화장실", type: "toilet" }
    ]
  }
};

export default function MobilityTab({ onAnnounce, highContrast }: MobilityTabProps) {
  const [selectedFloor, setSelectedFloor] = useState(4);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [simulatedEnvironment, setSimulatedEnvironment] = useState<'safe' | 'step' | 'obstacle'>('safe');
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState<boolean | null>(null);
  const [isVibratingEffect, setIsVibratingEffect] = useState(false);
  const [isElevatorBroken, setIsElevatorBroken] = useState(false);

  // High-fidelity 3D structural states
  const [is3DActive, setIs3DActive] = useState(false);
  const [viewMode, setViewMode] = useState<'default' | 'hazard' | 'radius'>('default');
  const [rotationX, setRotationX] = useState(55);
  const [rotationZ, setRotationZ] = useState(-18);
  const [scaling, setScaling] = useState(0.85);

  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Robust ref callback to assign stream instantly upon mounting
  const assignVideoRef = (el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current) {
      try {
        if (el.srcObject !== streamRef.current) {
          el.srcObject = streamRef.current;
        }
      } catch (err) {
        console.warn("Failed to attach live stream to video element:", err);
      }
    }
  };

  // Stop Camera Streaming safely
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis vocal failed:", e);
    }
  };

  // Handle Camera activation
  const handleCameraToggle = async () => {
    if (isCameraActive) {
      stopCameraStream();
      setIsCameraActive(false);
      onAnnounce("실시간 AI 보행 안내 카메라 렌즈 탐색을 종료했습니다.");
    } else {
      setIsCameraActive(true);
      onAnnounce("AI AR 실시간 보행 카메라를 가동합니다. 주변 장애물과 보행 안전 턱을 스캔하겠습니다.");
      
      // Request real video stream with precise environment facing constraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        streamRef.current = stream;
        setCameraPermissionGranted(true);
        // Force immediate binding to current video element if already exists
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Camera stream access failed, using premium simulated visual environment feed", err);
        setCameraPermissionGranted(false);
      }
      
      // Initialize with step warning as requested in mockups
      setTimeout(() => {
        triggerSimulationAlert('step');
      }, 500);
    }
  };

  const handleCameraRetry = async () => {
    onAnnounce("실제 장치 카메라 접근 승인을 브라우저 보안 대화상자에 다시 요청합니다.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      setCameraPermissionGranted(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      onAnnounce("장치 실시간 비디오 스트림 매핑에 완벽 성공했습니다!");
    } catch (err) {
      console.warn("Failed to request camera stream again:", err);
      setCameraPermissionGranted(false);
      onAnnounce("카메라 승인 연동에 실패했습니다. 우측 상단의 Launch in new tab 버튼을 통해 무장벽 독립 윈도우에서 가동해 보십시오.");
    }
  };

  // Trigger simulated warning trigger for device haptic / vibration and speaker feedback
  const triggerSimulationAlert = (mode: 'safe' | 'step' | 'obstacle') => {
    setSimulatedEnvironment(mode);
    setIsVibratingEffect(true);
    
    // Auto reset vibrating visual indicator after a short duration
    setTimeout(() => {
      setIsVibratingEffect(false);
    }, 1500);

    const hasVibrator = 'vibrate' in navigator;

    if (mode === 'step') {
      if (hasVibrator) navigator.vibrate([200, 100, 200]);
      speakText("정지! 전방 단차 감지. 전방 2미터 앞 단차 15센티미터.");
      onAnnounce("🚨 [위험] 전방 단차가 감지되었습니다. 진행 방향을 우회하십시오.");
    } else if (mode === 'obstacle') {
      if (hasVibrator) navigator.vibrate([400, 150, 400]);
      speakText("피해 가십시오! 가이드 지지선 철제 차단.");
      onAnnounce("🚧 [장애물] 돌출물이 감지되었습니다. 이동 경로를 보정하십시오.");
    } else {
      if (hasVibrator) navigator.vibrate(100);
      speakText("안측 평로가 안전합니다.");
      onAnnounce("🟢 [안전] 진행 방향 상태가 안전합니다. 안심하고 전진하십시오.");
    }
  };

  const handleElevatorToggle = () => {
    const nextState = !isElevatorBroken;
    setIsElevatorBroken(nextState);
    if (!nextState) {
      speakText("혜화역 승강 설비가 정상 가동으로 복구되었습니다.");
      onAnnounce("🛗 [교통약자 속보] 혜화역 4번출구 승강 설비가 가동 복구되었습니다.");
    } else {
      speakText("혜화역 4번출구 승강 설비가 검사 점검으로 중지되었습니다.");
      onAnnounce("🛗 [교통약자 속보] 혜화역 4번출구 승강 설비가 점검 작업 진행을 위해 일시 정지되었습니다.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: AI AR 카메라 스마트 길안내 - Styled exactly like the provided screenshots */}
      <div className="space-y-3 text-left">
        {/* Section Header */}
        <div className="flex items-center gap-2 text-white">
          <Video className="w-6 h-6 text-[#00E5FF] shrink-0" />
          <h2 className="text-lg font-black tracking-tight font-sans">AI AR 카메라 스마트 길안내</h2>
        </div>

        {/* Dynamic Takeover View or Compact Card view */}
        {isCameraActive ? (
          /* FULL IMMERSIVE TAKE-OVER AR CAMERA VIEW - Matching second screenshot exactly */
          <div className="fixed inset-0 z-50 bg-[#060608] flex flex-col justify-between overflow-hidden">
            
            {/* Real Web Camera view or high-fidelity simulated street scan */}
            <div className="absolute inset-0 w-full h-full bg-[#121214]">
              {cameraPermissionGranted === true ? (
                <video
                  ref={assignVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.82] contrast-[1.08]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                /* Dynamic Animated Simulated Street Backdrop with Depth Grid of a lobby entrance */
                <div className="absolute inset-0 bg-[#0d0d10] flex flex-col items-center justify-center overflow-hidden">
                  {/* Glowing background matrix simulation */}
                  <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#00E5FF_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                  
                  {/* Stylized background outline depicting a theater hallway look */}
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-5 relative select-none">
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                      <Landmark className="w-96 h-96 text-white" />
                    </div>
                    
                    {/* Simulated person silhouette shape to resemble the screenshot backdrop */}
                    <div className="relative w-36 h-36 rounded-full bg-slate-800/20 border border-slate-700/20 flex items-center justify-center animate-pulse">
                      <div className="w-20 h-20 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center">
                        <Video className="w-8 h-8 text-[#00E5FF]" />
                      </div>
                    </div>
                    
                    <div className="space-y-4 max-w-sm z-10 bg-slate-900/95 p-5 rounded-3xl border border-slate-850 backdrop-blur-sm shadow-2xl">
                      <div className="text-center space-y-1">
                        <p className="text-sm font-black text-[#00E5FF] tracking-tight flex items-center justify-center gap-1.5 font-sans">
                          <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping"></span>
                          실제 기기 카메라 연동 활성화
                        </p>
                        <p className="text-[11px] text-zinc-400 font-bold leading-relaxed font-sans">
                          AI가 보도 물리 장애 요철을 연동 스캔하도록 카메라를 가동하겠습니다. 아래 버튼을 터치하여 장치 권한을 동의해 주십시오.
                        </p>
                      </div>

                      <button
                        onClick={handleCameraRetry}
                        className="w-full py-3.5 px-4 bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-slate-950 font-black rounded-2xl text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer active:scale-95"
                      >
                        🎥 기기 실제 카메라 권한 연동하기
                      </button>

                      <div className="text-[10px] text-zinc-500 font-semibold leading-normal pt-2 border-t border-slate-800/60 font-sans">
                        💡 <span className="text-cyan-400 font-black">완벽 권한 해결안:</span> 아이프레임(iframe) 환경에서 권한이 막혔다면 우측 상단의 <span className="text-white underline font-bold">"Launch in new tab"</span> 버튼으로 독립 창을 열어 가동하십시오.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Grid & Perspective Guidelines (Red Warning guidelines in screenshot 2) */}
            <div className="absolute inset-0 pointer-events-none z-10">
              
              {/* Converging guiding lines mimicking screenshot 2 projection */}
              {simulatedEnvironment === 'step' && (
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 800" preserveAspectRatio="none">
                  {/* Warning perspective lanes flashing in red */}
                  <polygon 
                    points="80,750 320,750 220,380 180,380" 
                    fill="url(#redGradient)" 
                    className="opacity-30 animate-pulse"
                  />
                  <line x1="80" y1="750" x2="180" y2="380" stroke="#EF4444" strokeWidth="3.5" className="animate-pulse" />
                  <line x1="320" y1="750" x2="220" y2="380" stroke="#EF4444" strokeWidth="3.5" className="animate-pulse" />
                  
                  {/* Concentric warning circles on point of impact */}
                  <circle cx="200" cy="380" r="30" fill="none" stroke="#EF4444" strokeWidth="2.5" className="animate-ping" />
                  <circle cx="200" cy="380" r="14" fill="#EF4444" className="opacity-75 animate-pulse" />
                  <line x1="200" y1="380" x2="200" y2="280" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5" />

                  <defs>
                    <linearGradient id="redGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              {simulatedEnvironment === 'obstacle' && (
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
                  {/* Dynamic side barrier alert marker */}
                  <polygon 
                    points="50,750 180,320 230,320 100,750" 
                    fill="rgba(239, 68, 68, 0.25)"
                    className="animate-pulse"
                  />
                  <line x1="50" y1="750" x2="180" y2="320" stroke="#EF4444" strokeWidth="4.5" />
                  <line x1="100" y1="750" x2="230" y2="320" stroke="#EF4444" strokeWidth="2" strokeDasharray="4,4" />
                </svg>
              )}

              {simulatedEnvironment === 'safe' && (
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 800" preserveAspectRatio="none">
                  {/* High contract emerald guiding highway */}
                  <polygon 
                    points="100,750 300,750 215,320 185,320" 
                    fill="url(#greenGradient)" 
                    className="opacity-25"
                  />
                  <line x1="100" y1="750" x2="185" y2="320" stroke="#10B981" strokeWidth="4.5" />
                  <line x1="300" y1="750" x2="215" y2="320" stroke="#10B981" strokeWidth="4.5" />
                  
                  {/* Floating Chevron pointing forward */}
                  <path d="M 190,440 L 200,425 L 210,440" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
                  <path d="M 190,400 L 200,385 L 210,400" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />

                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>

            {/* TOP HUD BAR - Blinking live state & Close button */}
            <div className="relative z-20 flex items-center justify-between p-5 bg-gradient-to-b from-black/85 to-transparent">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-650 animate-ping shrink-0"></span>
                <span className="text-xs font-black text-rose-500 tracking-wide">● 실시간 AI 비전 스캔중</span>
              </div>
              <button 
                onClick={() => {
                  stopCameraStream();
                  setIsCameraActive(false);
                  onAnnounce("실시간 AI 보행 안내 카메라 안내를 중단했습니다.");
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15 select-none"
                title="종료"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MAIN ALERTS DISPLAY CONSOLE - Exactly matching Screenshot 2 centered alert design */}
            <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 text-center">
              
              {/* Dynamic Alerts based on detected simulation mode */}
              <AnimatePresence mode="wait">
                {simulatedEnvironment === 'step' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center space-y-4"
                  >
                    {/* Red Warning Overlay Block */}
                    <div className="bg-[#1c090a]/90 border border-red-500/40 px-8 py-6 rounded-[1.5rem] max-w-xs shadow-[0_20px_50px_rgba(239,68,68,0.25)] backdrop-blur-md">
                      <div className="w-14 h-14 rounded-full border border-red-500 bg-red-500/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                      </div>
                      <h4 className="text-red-500 text-xs font-black tracking-widest uppercase mb-1">장애물 경고</h4>
                      <p className="text-white text-base font-black tracking-tight leading-snug">전방 2m 앞 단차 (15cm)</p>
                      <p className="text-zinc-400 text-[10px] font-black tracking-wider uppercase mt-1">우회 경로 탐색 중...</p>
                    </div>

                    {/* Thick dark rounded warning pill from screenshot 2 */}
                    <div className="bg-[#1f1618]/95 border-2 border-red-500 px-7 py-3 rounded-full text-center shadow-[0_10px_30px_rgba(239,68,68,0.15)] animate-bounce">
                      <span className="text-white text-sm font-black tracking-tight font-sans">
                        정지! 전방 단차 감지
                      </span>
                    </div>
                  </motion.div>
                )}

                {simulatedEnvironment === 'obstacle' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center space-y-4"
                  >
                    <div className="bg-[#1c090a]/90 border border-red-500/40 px-8 py-6 rounded-[1.5rem] max-w-xs shadow-[0_20px_50px_rgba(239,68,68,0.25)] backdrop-blur-md">
                      <div className="w-14 h-14 rounded-full border border-red-500 bg-red-500/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                        <AlertOctagon className="w-8 h-8 text-red-500" />
                      </div>
                      <h4 className="text-red-500 text-xs font-black tracking-widest uppercase mb-1">통행 불가 경고</h4>
                      <p className="text-white text-base font-black tracking-tight leading-snug">가이드 지지선 철제 차단</p>
                      <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest mt-1">이동 궤적 보정 안내 점등</p>
                    </div>

                    <div className="bg-[#1f1618]/95 border-2 border-red-500 px-7 py-3 rounded-full text-center shadow-xl animate-bounce">
                      <span className="text-white text-sm font-black tracking-tight font-sans">
                        우측 안전 경로로 대피 요함
                      </span>
                    </div>
                  </motion.div>
                )}

                {simulatedEnvironment === 'safe' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center space-y-4"
                  >
                    <div className="bg-emerald-950/90 border border-emerald-500/30 px-8 py-5 rounded-[1.5rem] max-w-xs shadow-[0_20px_50px_rgba(16,185,129,0.25)] backdrop-blur-md">
                      <div className="w-12 h-12 rounded-full border border-emerald-500 bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h4 className="text-emerald-400 text-[10px] font-black tracking-widest uppercase mb-0.5">보행성 수평 안전</h4>
                      <p className="text-white text-sm font-black tracking-tight">전방 보도 평탄 노선 감지됨</p>
                    </div>

                    <div className="bg-emerald-950/95 border border-emerald-550/40 px-6 py-2.5 rounded-full text-center shadow-lg">
                      <span className="text-emerald-300 text-xs font-black tracking-tight font-sans flex items-center gap-1.5 justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        직진 주행 가동 보도
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Haptic Vibration Ring Overlay */}
              <AnimatePresence>
                {isVibratingEffect && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 pointer-events-none border-4 border-double border-red-500/80 bg-red-500/10 flex items-center justify-center"
                  >
                    <div className="bg-black/90 p-3 rounded-2xl border border-red-500 text-center space-y-1 max-w-[170px] shadow-2xl">
                      <div className="text-xl animate-bounce">📳</div>
                      <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest leading-none">햅틱 경고 진동 발생 중</p>
                      <p className="text-[8px] text-white font-mono leading-none font-bold">250ms x 3 모션 작동</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* FLOATING ACTION INTERACTIVE CONTROLLERS (Simulating road obstacles inside the view) */}
            <div className="relative z-25 mx-4 mb-3 p-3 bg-black/85 backdrop-blur-md rounded-2xl border border-zinc-850 flex flex-col gap-2 shadow-2xl">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#00E5FF] tracking-tight">가상 시뮬레이터 조절:</span>
                <span className="text-[9px] text-zinc-500 font-bold font-mono">VIBRATION & VOICE ALERTS</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button 
                  onClick={() => triggerSimulationAlert('step')}
                  className={`px-2 py-2 rounded-xl text-[10px] font-black tracking-tight border transition-all cursor-pointer whitespace-nowrap ${
                    simulatedEnvironment === 'step' 
                      ? 'bg-rose-500/20 border-red-500 text-red-200' 
                      : 'bg-zinc-900/80 border-zinc-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ⚠️ 15cm 단차
                </button>
                <button 
                  onClick={() => triggerSimulationAlert('obstacle')}
                  className={`px-2 py-2 rounded-xl text-[10px] font-black tracking-tight border transition-all cursor-pointer whitespace-nowrap ${
                    simulatedEnvironment === 'obstacle' 
                      ? 'bg-rose-500/20 border-red-500 text-red-200' 
                      : 'bg-zinc-900/80 border-zinc-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🚧 철제 차단
                </button>
                <button 
                  onClick={() => triggerSimulationAlert('safe')}
                  className={`px-2 py-2 rounded-xl text-[10px] font-black tracking-tight border transition-all cursor-pointer whitespace-nowrap ${
                    simulatedEnvironment === 'safe' 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-250' 
                      : 'bg-zinc-900/80 border-zinc-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🟢 평탄 보도
                </button>
              </div>
            </div>

            {/* GLASS HUD NAVIGATION FOOTER BAR - Mockup 2 Bottom Display */}
            <div className="relative z-20 px-4 pb-6 pt-2 bg-gradient-to-t from-black to-transparent">
              <div className="flex items-center justify-between bg-[#131315]/95 border border-[#1d1d20] rounded-3xl px-6 py-4.5 shadow-2xl text-left select-none">
                
                {/* Left block: Destination */}
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">도착지</span>
                  <span className="text-white text-[13px] font-black tracking-tight font-sans">
                    객석 1층 메인 게이트
                  </span>
                </div>

                {/* Right block: Remaining Distance & estimation */}
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">남은 거리</span>
                  <div className="text-sm font-black tracking-tight font-sans">
                    <span className="text-[#3b82f6] font-mono mr-1.5">15m</span>
                    <span className="text-zinc-700">/</span>
                    <span className="text-white ml-1.5 font-mono">1분</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          /* STANDARD CLOSED CARD VIEW - Exactly matching Screenshot 1 */
          <div className="bg-[#121214] border border-[#212124] rounded-3xl p-6 shadow-xl text-left">
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white tracking-tight leading-snug font-sans">
                내 위치를 보며 찾아가기
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans font-semibold">
                카메라로 주변을 비추면 AI가 <span className="text-[#3b82f6] font-extrabold">안전한 보행로</span>와 <span className="text-[#3b82f6] font-extrabold">단차/장애물</span>을 인식해 진동과 AR 화살표로 알려줍니다.
              </p>
            </div>

            {/* Big Action button styled exactly like Screenshot 1 */}
            <button
              onClick={handleCameraToggle}
              className="w-full bg-[#1e61f6] hover:bg-[#154fc1] text-white py-3.5 px-4 rounded-3xl text-sm font-extrabold flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-lg shadow-blue-600/10 transition-all active:scale-[0.982]"
            >
              <Video className="w-5 h-5 text-white" />
              <span>AR 길안내 시작</span>
            </button>
          </div>
        )}

        {/* SIMULATION TESTER CARD */}
        {!isCameraActive && (
          <div className="bg-[#121214] border border-[#212124] rounded-3xl p-6 shadow-xl text-left mt-4 space-y-4">
            <div className="space-y-2">
              <span className="text-[9px] bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 px-2 py-0.5 rounded font-black tracking-wider uppercase inline-block">
                안심 진동/음성 시뮬레이터
              </span>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5 pt-1 font-sans">
                <Sliders className="w-5 h-5 text-[#00E5FF]" />
                피드백 장치 모의 테스트
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans font-semibold">
                실제 카메라 가동 없이도 안전 알림 및 긴급 단차 진동 피드백을 미리 체험하고 수치를 체크할 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => triggerSimulationAlert('step')}
                className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-[9px] font-extrabold transition-all cursor-pointer ${
                  simulatedEnvironment === 'step'
                    ? 'bg-amber-500/25 border-amber-500 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 mb-1" />
                <span>⚠️ 전방 턱 감지</span>
                <span className="text-[7.5px] text-slate-500 font-mono mt-0.5">(높이 12cm)</span>
              </button>

              <button
                onClick={() => triggerSimulationAlert('obstacle')}
                className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-[9px] font-extrabold transition-all cursor-pointer ${
                  simulatedEnvironment === 'obstacle'
                    ? 'bg-red-500/25 border-red-500 text-red-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertOctagon className="w-4 h-4 text-red-500 mb-1 animate-pulse" />
                <span>🚨 돌출물 감지</span>
                <span className="text-[7.5px] text-slate-500 font-mono mt-0.5">(이동 불가)</span>
              </button>

              <button
                onClick={() => triggerSimulationAlert('safe')}
                className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-[9px] font-extrabold transition-all cursor-pointer ${
                  simulatedEnvironment === 'safe'
                    ? 'bg-emerald-500/25 border-emerald-500 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 mb-1" />
                <span>✅ 평탄도로 확보</span>
                <span className="text-[7.5px] text-slate-500 font-mono mt-0.5">(안전 보행)</span>
              </button>
            </div>

            {/* Simulated actions triggers info display */}
            <div className="text-[8px] bg-slate-900 border border-slate-850 p-2 rounded-lg text-slate-400 text-center font-bold">
              🖥️ 실 장치 테스트: 경고 선택 즉시 <span className="text-amber-400">navigator.vibrate</span> 진동 지시가 로컬 단말기에 하드웨어로 전달 연동됩니다.
            </div>
          </div>
        )}

        {/* Camera toggle bottom button */}
        {isCameraActive && (
          <button
            onClick={handleCameraToggle}
            className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-cyan-500/30 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <StopCircle className="w-4 h-4 text-cyan-400" />
            <span>AI AR 카메라 길안내 보정 중지하기</span>
          </button>
        )}
      </div>

      {/* SECTION 2: 건물 3D 입체도 (Interactive Architectural Spatial Floor schematic map) */}
      <div className="hc-card rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4 text-left shadow-lg">
        {/* Module Header */}
        <div className="space-y-1">
          <span className="text-[9px] bg-cyan-500/15 text-[#00E5FF] border border-cyan-500/30 px-2 py-0.5 rounded font-black tracking-wider uppercase hc-badge inline-block">
            S-MAP INTEGRATION
          </span>
          <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5 font-sans">
            <Layers className="w-4 h-4 text-[#00E5FF]" />
            S-MAP 실시간 3D 공간 연계 시뮬레이터
          </h3>
          <p className="text-xs text-slate-400 leading-normal font-semibold font-sans">
            지하 승하차역 대합실과 극장 내부를 3D 입체 투시하여, 전동 휠체어 안전 회전 반경 확인 및 보도 장벽 요소를 가설 검출합니다.
          </p>
        </div>

        {/* Static Inline Preview Card (Launcher) */}
        <div className="relative w-full aspect-video rounded-3xl bg-[#0a0a0d] border border-slate-850 overflow-hidden flex flex-col justify-between shadow-inner">
          <div className="absolute inset-0 z-20 w-full h-full flex flex-col items-center justify-center p-6 relative bg-slate-950/90">
            {/* Perspective grid overlay */}
            <div 
              className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(45deg,#00E5FF_1.5px,transparent_1.5px),linear-gradient(-45deg,#00E5FF_1.5px,transparent_1.5px)] bg-[size:28px_28px] pointer-events-none"
              style={{ 
                transform: 'perspective(450px) rotateX(65deg) translateY(-40px)', 
                transformOrigin: 'center top' 
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none"></div>

            {/* Central Glowing Teaser Card */}
            <div className="relative z-10 w-full max-w-sm bg-[#0e0e11]/95 border border-slate-800 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 shadow-2xl backdrop-blur-md">
              <div className="relative w-14 h-14 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,229,255,0.15)] animate-pulse">
                <Layers className="w-7 h-7 text-[#00E5FF]" />
                <div className="absolute inset-0 rounded-2xl bg-[#00E5FF]/10 blur-xl"></div>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-white tracking-tight font-sans">
                  S-MAP 3D 디지털 트윈 스캐너
                </h4>
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed font-sans px-2">
                  원하는 각도로 건물을 돌려보고, 층별 보행 편의 3차원 투입 단면을 입체 시뮬레이터로 탐색하십시오.
                </p>
              </div>

              <button
                onClick={() => {
                  setIs3DActive(true);
                  onAnnounce("디지털 트윈 3D 구조 시뮬레이터를 가동했습니다. 마우스 3D 회전 제어판 및 층별 분석 도구가 전격 작동하고 단독 풀스크린으로 실행됩니다.");
                }}
                className="w-full bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-slate-900 font-black px-6 py-3.5 rounded-2xl text-xs tracking-wider transition-all duration-300 transform hover:scale-[1.012] shadow-[0_0_24px_rgba(0,229,255,0.45)] cursor-pointer"
              >
                건물 3D 정밀 투시도 기동
              </button>
            </div>
          </div>
        </div>

        {/* Informative text specification listing for Selected Floor features */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
          <p className="text-[10px] text-slate-400 leading-normal font-sans text-center font-bold">
            💡 위 버튼을 터치하시면 <span className="text-[#00E5FF]">건물 3D 도면만이 집중 표기되는 고급 스크린 인터페이스</span>로 완벽 확장 진입합니다.
          </p>
        </div>
      </div>

      {/* FULLSCREEN IMMERSIVE TAKE-OVER 3D DIGITAL-TWIN VIEW */}
      {is3DActive && (
        <div className="fixed inset-0 z-50 bg-[#060608] flex flex-col justify-between overflow-hidden text-left">
          
          {/* Top Header Panel */}
          <div className="z-20 flex justify-between items-center bg-[#0d0d10] border-b border-slate-800 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/20">
                <Layers className="w-5 h-5 text-[#00E5FF] animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                  S-MAP 3D 실시간 디지털 트윈 시뮬레이터
                  <span className="text-[9px] bg-cyan-500/15 text-[#00E5FF] border border-cyan-550/30 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-widest animate-pulse">
                    LIVE SCANNER
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold font-sans mt-0.5">
                  실시간 보행로 물리 지형 데이터 및 휠체어 전동 회전 반경 통과 여부를 3D 가상 투시하여 검측합니다.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIs3DActive(false);
                onAnnounce("3D 공간 시뮬레이터를 종료하고 안전 보도 메인 요약도로 복귀했습니다.");
              }}
              className="px-4 py-2 bg-rose-950/25 hover:bg-rose-900/40 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow select-none"
            >
              <X className="w-4 h-4 text-rose-400" />
              <span>3D 시뮬레이션 종료</span>
            </button>
          </div>

          {/* Content Panel Layout (horizontal split) */}
          <div className="flex-1 w-full flex flex-col md:flex-row relative overflow-hidden">
            
            {/* Left Sidebar: Controls & Options */}
            <div className="w-full md:w-64 border-r border-[#1a1a1f] bg-[#0c0c0e] p-5 flex flex-col justify-between shrink-0 space-y-6 overflow-y-auto">
              
              {/* Target Floor Selection */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-500 font-black tracking-wider block uppercase">층수 필터 선택</span>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                  {[4, 3, 2, 1].map((f) => {
                    const isSelected = selectedFloor === f;
                    return (
                      <button
                        key={f}
                        onClick={() => {
                          setSelectedFloor(f);
                          onAnnounce(`3D 내부 가상 도면: [${f}층 내부 다면 구조]를 변경 투사했습니다.`);
                        }}
                        className={`py-3 px-3 rounded-2xl text-left border text-xs font-black transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#00E5FF] border-[#00E5FF] text-slate-950 shadow-[0_4px_12px_rgba(0,229,255,0.25)]'
                            : 'bg-zinc-950/60 border-zinc-850 text-slate-400 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] opacity-80">Floor</span>
                          <span className="text-sm font-black">{f}F</span>
                        </div>
                        <span className="text-[10px] font-bold opacity-75">
                          {f === 4 ? '객석관람석' : f === 3 ? '안심교량' : f === 2 ? '안심매표소' : '로비진입로'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Analyzer Focus Modes Selection */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-500 font-black tracking-wider block uppercase">스캔 모드 변경</span>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setViewMode('default');
                      onAnnounce("3D 기본 공간 분석 모드로 투사합니다.");
                    }}
                    className={`w-full py-3 px-3 border rounded-2xl flex items-center gap-2.5 transition-all text-xs font-black cursor-pointer text-left ${
                      viewMode === 'default'
                        ? 'border-[#00E5FF] bg-cyan-950/20 text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                        : 'border-zinc-850 bg-zinc-950/40 hover:bg-zinc-900/50 text-zinc-400'
                    }`}
                  >
                    <Layers className="w-5 h-5 shrink-0" />
                    <div className="leading-tight">
                      <p>기본 공간 보기</p>
                      <p className="text-[9px] text-slate-500 font-medium">Core structural map</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setViewMode('hazard');
                      onAnnounce("3D 공간 단차 및 장애물 경보 모드를 가동했습니다.");
                    }}
                    className={`w-full py-3 px-3 border rounded-2xl flex items-center gap-2.5 transition-all text-xs font-black cursor-pointer text-left ${
                      viewMode === 'hazard'
                        ? 'border-red-500 bg-red-950/20 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
                        : 'border-zinc-850 bg-zinc-950/40 hover:bg-zinc-900/50 text-zinc-400'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
                    <div className="leading-tight text-red-450">
                      <p className="text-red-400">물리적 턱(단차)</p>
                      <p className="text-[9px] text-zinc-500 font-medium leading-none mt-0.5">Hazard detection</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setViewMode('radius');
                      onAnnounce("3D 휠체어 회전반경 1.4m 공간 적합성 점검 모드를 켭니다.");
                    }}
                    className={`w-full py-3 px-3 border rounded-2xl flex items-center gap-2.5 transition-all text-xs font-black cursor-pointer text-left ${
                      viewMode === 'radius'
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                        : 'border-zinc-850 bg-zinc-950/40 hover:bg-zinc-900/50 text-zinc-400'
                    }`}
                  >
                    <Compass className="w-5 h-5 shrink-0 text-emerald-400" />
                    <div className="leading-tight text-emerald-450">
                      <p className="text-emerald-450">전동반경 시뮬레이션</p>
                      <p className="text-[9px] text-zinc-500 font-medium leading-none mt-0.5">Wheelchair turn radius</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Cybernetic telemetry watermark */}
              <div className="text-[8.5px] font-mono text-slate-650 bg-black/40 p-2.5 border border-zinc-900 rounded-xl leading-relaxed text-center uppercase tracking-wider block">
                ● SECURITY CHECK: ONLINE<br />
                ● S-MAP V2 DIGITAL TWIN
              </div>

            </div>

            {/* Center Viewport Stage (The main 3D visualization arena) */}
            <div className="flex-1 relative flex flex-col justify-between bg-[#08080a] p-4 overflow-hidden">
              
              {/* 3D ROTATION HUD CONTROL BAR (Floating overlay on main viewport) */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-slate-900/95 border border-slate-850 p-1.5 rounded-2xl shadow-2xl backdrop-blur-sm">
                <button 
                  onClick={() => setRotationZ(z => z - 15)}
                  className="p-2 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer whitespace-nowrap"
                  title="좌회전"
                >
                  ↺ 3D 회전
                </button>
                <button 
                  onClick={() => setRotationZ(z => z + 15)}
                  className="p-2 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer whitespace-nowrap"
                  title="우회전"
                >
                  ↻ 3D 회전
                </button>
                <div className="w-[1.5px] h-4 bg-slate-800"></div>
                <button 
                  onClick={() => setRotationX(x => Math.min(x + 10, 80))}
                  className="p-2 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer whitespace-nowrap"
                  title="높이기"
                >
                  ▲ 눕히기
                </button>
                <button 
                  onClick={() => setRotationX(x => Math.max(x - 10, 25))}
                  className="p-2 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black transition-all cursor-pointer whitespace-nowrap"
                  title="내리기"
                >
                  ▼ 세우기
                </button>
                <div className="w-[1.5px] h-4 bg-slate-800"></div>
                <button 
                  onClick={() => {
                    setRotationX(55);
                    setRotationZ(-18);
                    setScaling(0.85);
                  }}
                  className="p-2 bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/20 rounded-xl text-[10px] font-black transition-all cursor-pointer"
                  title="기본 시야 복원"
                >
                  시야 리셋
                </button>
              </div>

              {/* Watermark status directly floating on viewport */}
              <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-xl text-[9px] font-mono font-bold text-slate-400 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="uppercase tracking-widest text-emerald-400">S-MAP ENGINE: CONNECTED</span>
              </div>

              {/* Real Canvas Center Display Stage */}
              <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden my-4">
                
                {/* Stylized background outline depicting architectural map schematics */}
                <div 
                  style={{ 
                    transform: `perspective(1200px) rotateX(${rotationX}deg) rotateZ(${rotationZ}deg) scale(${scaling * 1.15})`,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  className="relative w-[340px] h-[210px] rounded-3xl border border-cyan-500/20 bg-slate-900/30 flex items-center justify-center shadow-[0_0_50px_rgba(0,229,255,0.06)]"
                >
                  
                  {/* Neon inner grid overlay */}
                  <div className="absolute inset-0 opacity-[0.22] bg-[linear-gradient(rgba(0,229,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.08)_1px,transparent_1px)] bg-[size:16px_16px] rounded-3xl"></div>

                  {/* Floor text on the ground */}
                  <div className="absolute top-6 left-8 select-none pointer-events-none font-mono font-black text-[18px] text-[#00E5FF]/10 tracking-widest uppercase">
                    {selectedFloor}F REAL STRUCT
                  </div>

                  {/* SVG route drawing path */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#00E5FF] fill-none z-10" viewBox="0 0 340 210">
                    <path 
                      d="M 50,130 L 130,90 L 210,120 L 300,75" 
                      strokeWidth="4" 
                      strokeLinecap="round" 
                      strokeDasharray={viewMode === 'radius' ? "6,4" : "none"}
                      className={viewMode === 'radius' ? "stroke-emerald-400 animate-pulse" : "stroke-cyan-400/80"} 
                    />
                    <path 
                      d="M 50,130 L 130,90 L 210,120 L 300,75" 
                      strokeWidth="1.5" 
                      className="stroke-white/40" 
                    />
                  </svg>

                  {/* 3D Billboards positioning */}
                  <div 
                    style={{ 
                      left: '50px', 
                      top: '130px',
                      transform: `translate(-50%, -50%) rotateX(-${rotationX}deg) rotateZ(-${rotationZ}deg)`
                    }}
                    className="absolute z-25 flex flex-col items-center pointer-events-none select-none transition-transform"
                  >
                    <div className="w-5 h-5 rounded-full bg-cyan-500 border border-white flex items-center justify-center shadow-lg animate-pulse">
                      <span className="text-[7.5px] font-bold text-slate-950">1</span>
                    </div>
                    <div className="mt-1 bg-slate-950/95 text-white border border-slate-800 text-[6.5px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                      🛗 메인 승강전초
                    </div>
                  </div>

                  <div 
                    style={{ 
                      left: '300px', 
                      top: '75px',
                      transform: `translate(-50%, -50%) rotateX(-${rotationX}deg) rotateZ(-${rotationZ}deg)`
                    }}
                    className="absolute z-25 flex flex-col items-center pointer-events-none select-none transition-transform"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-500 border border-white flex items-center justify-center shadow-lg animate-pulse">
                      <span className="text-[7.5px] font-bold text-white">2</span>
                    </div>
                    <div className="mt-1 bg-slate-950/95 text-white border border-slate-800 text-[6.5px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                      🚻 안심 장애 화장실
                    </div>
                  </div>

                  {/* View mode warning anchors */}
                  {viewMode === 'hazard' && (
                    <div 
                      style={{ 
                        left: '170px', 
                        top: '105px',
                        transform: `translate(-50%, -100%) rotateX(-${rotationX}deg) rotateZ(-${rotationZ}deg)`
                      }}
                      className="absolute z-35 flex flex-col items-center pointer-events-none"
                    >
                      <div className="bg-red-950/95 text-red-100 border-2 border-red-500 px-3 py-1.5 rounded-2xl shadow-[0_0_24px_rgba(239,68,68,0.5)] flex flex-col items-center text-center animate-bounce">
                        <AlertTriangle className="w-4 h-4 text-red-400 mb-0.5" />
                        <span className="text-[7.5px] font-black uppercase text-red-400 tracking-wider">위험 물리 단차 탐지</span>
                        <span className="text-[9px] font-black text-white whitespace-nowrap mt-0.5 leading-none">
                          {selectedFloor === 4 ? '⚠️ 중앙 콘솔 뒤 케이블 보호대 턱' : 
                           selectedFloor === 3 ? '⚠️ 야외 브리지 우천시 미끄럼 가속 부위' :
                           selectedFloor === 2 ? '⚠️ 가이드라인 매표 차단막 주위' : 
                           '⚠️ 혜화역 4번출구 전방 공사 요철 단차'}
                        </span>
                      </div>
                      <div className="w-0.5 h-6 bg-red-500 border-dashed border-r border-red-400"></div>
                      <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-red-500/20 flex items-center justify-center animate-ping">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'radius' && (
                    <div 
                      style={{ 
                        left: '130px', 
                        top: '90px',
                        transform: `translate(-50%, -50%)`
                      }}
                      className="absolute z-15 pointer-events-none"
                    >
                      <div className="w-16 h-16 rounded-full border-2 border-emerald-400 border-dashed bg-emerald-500/10 animate-spin" style={{ animationDuration: '6s' }}></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          style={{ transform: `rotateX(-${rotationX}deg) rotateZ(-${rotationZ}deg)` }}
                          className="bg-slate-950/95 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[7px] font-black whitespace-nowrap shadow-lg"
                        >
                          ♿ 회전반경 1.4m 확보
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'default' && (
                    <div 
                      style={{ 
                        left: '210px', 
                        top: '120px',
                        transform: `translate(-50%, -100%) rotateX(-${rotationX}deg) rotateZ(-${rotationZ}deg)`
                      }}
                      className="absolute z-20 flex flex-col items-center pointer-events-none"
                    >
                      <div className="bg-cyan-950/95 text-[#00E5FF] border border-[#00E5FF]/40 px-2.5 py-1 rounded-xl shadow-[0_0_12px_rgba(0,229,255,0.25)] flex items-center gap-1">
                        <span className="text-[10px]">♿</span>
                        <span className="text-[9px] font-black text-white whitespace-nowrap">안심 권장 동선로</span>
                      </div>
                      <div className="w-0.5 h-4 bg-cyan-400"></div>
                    </div>
                  )}

                </div>

              </div>

            </div>

            {/* Right Sidebar: Real Specification & Checklist */}
            <div className="w-full md:w-80 border-l border-[#1a1a1f] bg-[#0c0c0e] p-5 flex flex-col justify-start space-y-4 overflow-y-auto shrink-0">
              
              <div className="bg-[#121215] p-3.5 rounded-2xl border border-zinc-850 space-y-2 text-left">
                <h4 className="text-[10px] font-black uppercase text-[#00E5FF] tracking-widest leading-none">안심 보도 시스템 상세 규격</h4>
                <p className="text-[11px] text-zinc-300 font-extrabold leading-relaxed font-sans">
                  {DETAILED_3D_FLOORS[selectedFloor].desc}
                </p>
              </div>

              <div className="space-y-2 mt-2">
                <span className="text-[10px] text-zinc-500 font-black tracking-wider block uppercase text-left">안전 편의시설 상태</span>
                <div className="flex flex-col gap-2">
                  
                  <div className="p-3 border border-zinc-850 bg-[#121215] rounded-xl flex items-start gap-2.5">
                    <span className="p-1 rounded bg-blue-500/10 text-blue-400 shrink-0 text-xs">🚻</span>
                    <div className="text-left space-y-0.5">
                      <p className="text-[10px] font-black text-blue-405 leading-tight">배리어프리 편의 화장실 정보</p>
                      <p className="text-[10px] text-zinc-300 font-medium leading-normal">{DETAILED_3D_FLOORS[selectedFloor].toilet}</p>
                    </div>
                  </div>

                  <div className="p-3 border border-zinc-850 bg-[#121215] rounded-xl flex items-start gap-2.5">
                    <span className="p-1 rounded bg-cyan-500/10 text-cyan-405 shrink-0 text-xs">🛗</span>
                    <div className="text-left space-y-0.5">
                      <p className="text-[10px] font-black text-cyan-405 leading-tight">승강기 및 수직 리프트 현황</p>
                      <p className="text-[10px] text-zinc-300 font-medium leading-normal">{DETAILED_3D_FLOORS[selectedFloor].elevator}</p>
                    </div>
                  </div>

                  <div className="p-3 border border-zinc-850 bg-[#121215] rounded-xl flex items-start gap-2.5">
                    <span className="p-1 rounded bg-amber-500/10 text-amber-550 shrink-0 text-xs">⚠️</span>
                    <div className="text-left space-y-0.5">
                      <p className="text-[10px] font-black text-amber-550 leading-tight">주의 필요 지면 요철 상태</p>
                      <p className="text-[10px] text-zinc-300 font-medium leading-normal">{DETAILED_3D_FLOORS[selectedFloor].hazards}</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* Footer Diagnostics logs row */}
          <div className="text-[10px] text-slate-350 bg-[#070709] px-6 py-4 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg shrink-0 ${
                viewMode === 'hazard' ? 'bg-red-500/10 text-red-500' :
                viewMode === 'radius' ? 'bg-emerald-500/10 text-[#00FF88]' :
                'bg-cyan-500/10 text-[#00E5FF]'
              }`}>
                {viewMode === 'hazard' ? <AlertTriangle className="w-4 h-4" /> :
                 viewMode === 'radius' ? <Compass className="w-4 h-4" /> :
                 <Layers className="w-4 h-4" />}
              </div>
              <div className="space-y-0.5 text-left">
                <p className="text-[11px] font-black text-white leading-none">
                  {viewMode === 'hazard' ? '위험 요소(물리 단차/장애물 주위) 스캔 강조 상태' :
                   viewMode === 'radius' ? '휠체어 전동 회전 반경(1.4m) 시뮬레이션 적용 상태' :
                   '3D 정밀 투사 다층 도면 분석 가동 완료'}
                </p>
                <p className="text-[9.5px] text-slate-400 font-medium leading-normal">
                  {viewMode === 'hazard' ? '보행 중 지체 및 바퀴 회전을 방해하는 모든 단독 턱과 차단 보호 장벽을 붉은 플로팅 배너 좌표로 사상 투영합니다.' :
                   viewMode === 'radius' ? '전동 휠체어의 제자리 회전 반경(1.4m x 1.4m) 작동 가능 여부를 지형물과의 거리를 추계 비교해 실시간 자동 검사합니다.' :
                   '지하철 연결 출구 노선부터 무대 관람 스탠드까지 빈틈없이 정합한 디지털 트윈 공간 정보가 사상 완료되어 있습니다.'}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-mono font-black text-[#00E5FF] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-550/20 whitespace-nowrap shrink-0">
              S-MAP LIVE RADAR V2
            </span>
          </div>

        </div>
      )}

      {/* METRO LIFT ACCESS STATE BOARD */}
      <div
        onClick={handleElevatorToggle}
        className={`hc-card rounded-2xl p-4 border transition-all cursor-pointer text-left ${
          isElevatorBroken
            ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20'
            : 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isElevatorBroken ? 'bg-red-500/20 text-red-100' : 'bg-green-500/20 text-green-105'
            }`}
          >
            {isElevatorBroken ? (
              <AlertOctagon className="w-5 h-5 animate-pulse text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-black tracking-wide uppercase font-mono ${
                  isElevatorBroken ? 'text-red-400' : 'text-green-400'
                }`}
              >
                [혜화역 실시간 교통 약자 이동성 속보]
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                  isElevatorBroken
                    ? 'bg-red-400/20 text-red-300 border-red-500/30'
                    : 'bg-green-400/20 text-green-300 border-green-500/30'
                }`}
              >
                {isElevatorBroken ? '수리 대기 중' : '정상 작동'}
              </span>
            </div>
            <h4 className="text-xs font-extrabold text-white">
              {isElevatorBroken
                ? '혜화역 4번 출구 승강기 보수 작업 지연 알림'
                : '혜화역 외부 및 대합실 연계 보도 엘레베이터 전량 완벽 복구'}
            </h4>
            <p className="text-[10px] text-slate-305 leading-relaxed hc-text-mute font-medium">
              {isElevatorBroken
                ? '휠체어 및 전동 모빌리티 탑승객분들은 본 공석 403호 안심 정합 엘리베이터를 즉시 승차하거나 로비 동행 서포터를 우선 소생 호출해 주시기 바랍니다.'
                : '지체 휠체어 이용자 승차 브리지 및 동행 보호자 연대 안심 보행로 엘리베이터가 지연 없이 원활하게 즉시 닿을 수 있습니다.'}
            </p>
            <p className="text-[9px] text-slate-500 italic mt-1 font-semibold hc-text-mute">
              * 본 카드를 터치해 가상 원격 전산망 수리 복원 완료 상황을 즉시 시뮬레이션할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
