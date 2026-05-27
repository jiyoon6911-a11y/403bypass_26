import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Map, Zap, Layers, Play, StopCircle, CheckCircle, 
  AlertTriangle, AlertOctagon, Compass, Video, 
  HelpCircle, Accessibility, Activity, Volume2, 
  VolumeX, RefreshCw, Eye, Landmark, Navigation2, LogIn,
  Sliders, X, Users, TrendingUp, Info
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
  const [isShowMobileSpecs, setIsShowMobileSpecs] = useState(false);

  // Real-time crowd density congestion telemetry list
  const [congestionList, setCongestionList] = useState([
    { id: 'b1', area: "혜화역 B1 지하철 연결 안심 통로", level: "smooth", density: 15, text: "🟢 원활", desc: "휠체어 리프트 대기 및 교량 지연 부재. 통행 매우 양호", color: "from-green-500/10 to-emerald-500/10", borderColor: "border-green-500/30", textCol: "text-green-400" },
    { id: 'f1', area: "1F 메인 무장벽 출입 로비 및 안내 데스크", level: "normal", density: 42, text: "🟡 보통", desc: "안내 기계 대기 3인 발생. 휠체어 전용 경사 발권 키오스크 한가함", color: "from-amber-500/10 to-yellow-500/10", borderColor: "border-amber-500/30", textCol: "text-amber-400" },
    { id: 'f2', area: "2F 안심 매표소 및 종합 점자 촉지도 존", level: "smooth", density: 20, text: "🟢 원활", desc: "밀착 수어 대면 데스크 여유. 지체 없이 즉각 연계 매칭 가능", color: "from-green-500/10 to-emerald-500/10", borderColor: "border-green-500/30", textCol: "text-green-400" },
    { id: 'f3', area: "3F 실외 연결 입체 안심 브리지 통로", level: "smooth", density: 8, text: "🟢 매우 원활", desc: "평로 확보 상태. 맞은편 마찰 전동 브리지 간 교통 장애 전혀 없음", color: "from-green-500/10 to-emerald-500/10", borderColor: "border-green-500/30", textCol: "text-green-400" },
    { id: 'f4', area: "4F 객석 1층 대강당 메인 관람석 대기홀", level: "crowded", density: 88, text: "🔴 혼잡", desc: "공연 입장 직전 인파 급증. 휠체어 관람객은 우측 우회로 확보 권장", color: "from-red-500/10 to-rose-500/10", borderColor: "border-red-500/30", textCol: "text-rose-450" }
  ]);

  const handleRefreshCongestion = () => {
    const updated = congestionList.map(item => {
      const change = Math.floor(Math.random() * 31) - 15; // -15% to +15%
      const nextDensity = Math.max(5, Math.min(100, item.density + change));
      let nLevel = "smooth";
      let nText = "🟢 원활";
      let nTextCol = "text-green-450";
      let nColor = "from-green-500/10 to-emerald-500/10";
      let nBorder = "border-green-500/20";

      if (nextDensity >= 70) {
        nLevel = "crowded";
        nText = "🔴 혼잡";
        nTextCol = "text-rose-400";
        nColor = "from-red-500/10 to-rose-500/10";
        nBorder = "border-red-500/20";
      } else if (nextDensity >= 35) {
        nLevel = "normal";
        nText = "🟡 보통";
        nTextCol = "text-amber-400";
        nColor = "from-amber-500/10 to-yellow-500/10";
        nBorder = "border-amber-500/20";
      }

      return {
        ...item,
        density: nextDensity,
        level: nLevel,
        text: nText,
        textCol: nTextCol,
        color: nColor,
        borderColor: nBorder
      };
    });

    setCongestionList(updated);
    onAnnounce("📡 속보: 각 층별 군중 센서 실시간 혼잡 밀집 지수 통계를 즉시 수집 가설하였습니다.");
    speakText("실시간 혼잡 분석 센서 데이터를 갱신 탑청 수신했습니다.");
  };

  const handleAreaClick = (area: string, level: string, density: number, desc: string) => {
    onAnnounce(`${area}의 혼잡도를 터치 확인하셨습니다. 현재 ${level === 'crowded' ? '매우 혼잡함' : level === 'normal' ? '보통' : '교통 양호 원활'} 상탭니다. 밀집율 ${density}% 로서 ${desc}`);
    speakText(`${area} 확인. 밀집율 ${density} 퍼센트. ${desc}`);
  };

  // High-fidelity 3D structural states
  const [is3DActive, setIs3DActive] = useState(false);
  const [viewMode, setViewMode] = useState<'default' | 'hazard' | 'radius'>('default');
  const [rotationX, setRotationX] = useState(55);
  const [rotationZ, setRotationZ] = useState(-18);
  const [scaling, setScaling] = useState(0.85);

  // Dynamic interactive navigation state modifiers (grab, shift rotation, wheel zoom and panning offsets)
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dragMode, setDragMode] = useState<'rotate' | 'pan'>('rotate');
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotZ: number; panX: number; panY: number; isDragging: boolean }>({
    x: 0,
    y: 0,
    rotX: 55,
    rotZ: -18,
    panX: 0,
    panY: 0,
    isDragging: false
  });

  const touchStartDistanceRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(0.85);

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
    if (nextState) {
      onAnnounce("🚨 경보: 지하철 연계 엘리베이터 점검 고장이 접수되었습니다. 대체 이동 우회로 지도를 참고해 주시기 바랍니다.");
      speakText("주의! 지하철 연계 승강기 고장 점검 중. 대체 우회로를 사상 투영합니다.");
    } else {
      onAnnounce("🟢 해제: 지하철 연계 엘리베이터가 정상 보도로 전면 회복되었습니다.");
      speakText("승강기 수리 복구 완료. 모든 다층 이동로가 정상 통행 가능 상탭니다.");
    }
  };

  // 1. Mouse Drag, shift, roll interactive Event Handlers
  const handleStageMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // We only support left click or middle click dragging
    if (e.button !== 0 && e.button !== 1) return;
    e.preventDefault();

    const actualMode = (e.shiftKey || e.button === 1) ? 'pan' : dragMode;
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
        const targetRotZ = dragStartRef.current.rotZ - dx * 0.55;
        const targetRotX = Math.max(15, Math.min(85, dragStartRef.current.rotX - dy * 0.45));
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

  // 2. Touch dragging and double swipe pinch zoom
  const handleStageTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;

    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      touchStartDistanceRef.current = distance;
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

  const handleStageTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDistanceRef.current !== null) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const ratio = distance / touchStartDistanceRef.current;
      const targetScale = Math.max(0.3, Math.min(2.5, touchStartScaleRef.current * ratio));
      setScaling(targetScale);
      return;
    }

    if (!dragStartRef.current.isDragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;

    if (dragMode === 'rotate') {
      const targetRotZ = dragStartRef.current.rotZ - dx * 0.6;
      const targetRotX = Math.max(15, Math.min(85, dragStartRef.current.rotX - dy * 0.5));
      setRotationZ(targetRotZ);
      setRotationX(targetRotX);
    } else {
      setPanX(dragStartRef.current.panX + dx);
      setPanY(dragStartRef.current.panY + dy);
    }
  };

  const handleStageTouchEnd = () => {
    setIsDragging(false);
    dragStartRef.current.isDragging = false;
    touchStartDistanceRef.current = null;
  };

  // 3. Mouse Wheel Scroll Zoom handler
  const handleStageWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomIntensity = 0.08;
    const delta = e.deltaY < 0 ? 1 : -1;
    const targetScale = Math.max(0.35, Math.min(2.5, scaling + delta * zoomIntensity));
    setScaling(targetScale);
  };

  // 4. Dynamic architectural detailed plan builder for each level resembling the uploaded styling
  const renderFloorPlanBlueprint = (floorNum: number) => {
    switch (floorNum) {
      case 1:
        return (
          <g>
            {/* Outline box */}
            <rect x="10" y="10" width="320" height="190" rx="14" fill="#0c0d12" stroke="#333a4d" strokeWidth="2.5" />
            {/* Grid background lines */}
            <line x1="10" y1="50" x2="330" y2="50" stroke="#1d2230" strokeDasharray="4,4" />
            <line x1="10" y1="100" x2="330" y2="100" stroke="#1d2230" strokeDasharray="4,4" />
            <line x1="10" y1="150" x2="330" y2="150" stroke="#1d2230" strokeDasharray="4,4" />
            <line x1="110" y1="10" x2="110" y2="200" stroke="#1d2230" strokeDasharray="4,4" />
            <line x1="220" y1="10" x2="220" y2="200" stroke="#1d2230" strokeDasharray="4,4" />

            {/* Subway Corridor link on Left */}
            <rect x="20" y="25" width="75" height="150" rx="8" fill="#141722" stroke="#2a334a" strokeWidth="1.5" />
            <text x="57" y="55" fill="#8f9bb3" fontSize="8" fontWeight="black" textAnchor="middle">혜화역 4번출구</text>
            <text x="57" y="68" fill="#586782" fontSize="7" fontWeight="bold" textAnchor="middle">지하 무장벽 연계</text>
            <path d="M 40,90 L 75,90 M 40,110 L 75,110 M 45,90 L 45,110" stroke="#3e4a68" strokeWidth="1" />

            {/* Main Entrance Gates at bottom */}
            <rect x="110" y="155" width="105" height="30" rx="4" fill="#141c2d" stroke="#00E5FF" strokeWidth="1.2" opacity="0.8" />
            <text x="162" y="173" fill="#00E5FF" fontSize="8.5" fontWeight="black" textAnchor="middle">로비 메인 게이트</text>

            {/* Information Desk Center */}
            <rect x="135" y="105" width="55" height="25" rx="4" fill="#192338" stroke="#2c3a57" strokeWidth="1.5" />
            <text x="162" y="120" fill="#a0aec0" fontSize="8" fontWeight="black" textAnchor="middle">안내 데스크</text>

            {/* Restrooms right */}
            <rect x="235" y="25" width="85" height="40" rx="6" fill="#16221c" stroke="#22c55e" strokeWidth="1.5" />
            <text x="277" y="44" fill="#22c55e" fontSize="8" fontWeight="black" textAnchor="middle">🚻 로비 장애인</text>
            <text x="277" y="55" fill="#60a5fa" fontSize="7" fontWeight="bold" textAnchor="middle">배리어프리 변환 완료</text>

            {/* Management & Emergency control room bottom right */}
            <rect x="235" y="80" width="85" height="45" rx="6" fill="#1a1215" stroke="#4a2e35" strokeWidth="1.5" />
            <text x="277" y="98" fill="#cbd5e1" fontSize="8" fontWeight="bold" textAnchor="middle">방재 제어실</text>
            <text x="277" y="110" fill="#64748b" fontSize="7.5" fontWeight="bold" textAnchor="middle">재난 피난 본부</text>

            {/* Ticket Machine Kiosks */}
            <rect x="110" y="25" width="105" height="35" rx="4" fill="#13151a" stroke="#2c303d" strokeWidth="1.5" />
            <circle cx="130" cy="42" r="4" fill="#3b82f6" />
            <circle cx="162" cy="42" r="4" fill="#3b82f6" />
            <circle cx="195" cy="42" r="4" fill="#3b82f6" />
            <text x="162" y="54" fill="#8a99ad" fontSize="6" fontWeight="bold" textAnchor="middle">음성안내 무인 키오스크 단말기</text>
          </g>
        );

      case 2:
        return (
          <g>
            <rect x="10" y="10" width="320" height="190" rx="14" fill="#0d0e14" stroke="#3d3730" strokeWidth="2.5" />
            {/* Grid references */}
            <line x1="10" y1="50" x2="330" y2="50" stroke="#211b15" strokeDasharray="3,3" />
            <line x1="10" y1="100" x2="330" y2="100" stroke="#211b15" strokeDasharray="3,3" />
            <line x1="10" y1="150" x2="330" y2="150" stroke="#211b15" strokeDasharray="3,3" />
            <line x1="110" y1="10" x2="110" y2="200" stroke="#211b15" strokeDasharray="3,3" />
            <line x1="220" y1="10" x2="220" y2="200" stroke="#211b15" strokeDasharray="3,3" />

            {/* Left Hand: Snack bar & Kitchen */}
            <rect x="20" y="25" width="80" height="100" rx="8" fill="#171311" stroke="#443125" strokeWidth="1.5" />
            <text x="60" y="55" fill="#c084fc" fontSize="8" fontWeight="black" textAnchor="middle">안심 푸드존</text>
            <text x="60" y="68" fill="#a18270" fontSize="7" fontWeight="bold" textAnchor="middle">저상형 카운터 적용</text>
            {/* Tables & Chairs symbols */}
            <circle cx="45" cy="95" r="5" fill="#2d2218" stroke="#5c442c" />
            <circle cx="75" cy="95" r="5" fill="#2d2218" stroke="#5c442c" />

            {/* Central Box Office: Ticket window with beautiful highlight */}
            <rect x="115" y="25" width="100" height="45" rx="6" fill="#1c2536" stroke="#00E5FF" strokeWidth="2" />
            <text x="165" y="47" fill="#00E5FF" fontSize="9.5" fontWeight="black" textAnchor="middle">통합 안심 매표소</text>
            <text x="165" y="60" fill="#e2e8f0" fontSize="7" fontWeight="black" textAnchor="middle">BOX OFFICE (수어대면)</text>

            {/* Barrier free desk right */}
            <rect x="230" y="25" width="90" height="55" rx="6" fill="#152620" stroke="#10b981" strokeWidth="1.5" />
            <text x="275" y="45" fill="#10b981" fontSize="8" fontWeight="black" textAnchor="middle">촉지도 & 음성존</text>
            <text x="275" y="58" fill="#6ee7b7" fontSize="7" fontWeight="bold" textAnchor="middle">종합 수어가이드 겸용</text>

            {/* Lobby / waiting area */}
            <rect x="115" y="85" width="205" height="90" rx="8" fill="#12131a" stroke="#222530" strokeWidth="1.5" />
            <text x="217" y="115" fill="#94a3b8" fontSize="9.5" fontWeight="bold" textAnchor="middle">중앙 대합 광장 (Lounge)</text>
            <text x="217" y="130" fill="#64748b" fontSize="7.5" fontWeight="medium" textAnchor="middle">휠체어 정차 주차 베이 5개소 설치완료</text>

            {/* Elevator symbol bottom left */}
            <rect x="20" y="140" width="80" height="40" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <text x="60" y="164" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">🛗 승강기 1호기</text>
          </g>
        );

      case 3:
        return (
          <g>
            <rect x="10" y="10" width="320" height="190" rx="14" fill="#0a0a0c" stroke="#27272a" strokeWidth="2.5" />
            
            {/* Left tower base */}
            <rect x="15" y="20" width="80" height="160" rx="10" fill="#141416" stroke="#3f3f46" strokeWidth="2" />
            <line x1="15" y1="70" x2="95" y2="70" stroke="#27272a" />
            <line x1="15" y1="120" x2="95" y2="120" stroke="#27272a" />
            <text x="55" y="45" fill="#a1a1aa" fontSize="8" fontWeight="black" textAnchor="middle">MAIN 본관 타워</text>
            <text x="55" y="100" fill="#71717a" fontSize="7" fontWeight="medium" textAnchor="middle">연결 대기 로비</text>

            {/* Right tower base */}
            <rect x="245" y="20" width="80" height="160" rx="10" fill="#141416" stroke="#3f3f46" strokeWidth="2" />
            <line x1="245" y1="70" x2="325" y2="70" stroke="#27272a" />
            <line x1="245" y1="120" x2="325" y2="120" stroke="#27272a" />
            <text x="285" y="45" fill="#a1a1aa" fontSize="8" fontWeight="black" textAnchor="middle">별관 시네마동</text>
            <text x="285" y="100" fill="#71717a" fontSize="7" fontWeight="medium" textAnchor="middle">입장 티켓 게이트</text>

            {/* Connecting Bridge Corridor in center */}
            <rect x="95" y="65" width="150" height="70" fill="#0e1726" stroke="#1d4ed8" strokeWidth="2" />
            {/* Railing stripes */}
            <line x1="95" y1="70" x2="245" y2="70" stroke="#60a5fa" strokeWidth="2" />
            <line x1="95" y1="130" x2="245" y2="130" stroke="#60a5fa" strokeWidth="2" />
            
            {/* Safety Anti-slip yellow pattern markings */}
            <line x1="110" y1="70" x2="120" y2="130" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />
            <line x1="135" y1="70" x2="145" y2="130" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />
            <line x1="160" y1="70" x2="170" y2="130" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />
            <line x1="185" y1="70" x2="195" y2="130" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />
            <line x1="210" y1="70" x2="220" y2="130" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />
            <line x1="235" y1="70" x2="245" y2="130" stroke="#fbbf24" strokeWidth="1" opacity="0.4" />

            <text x="170" y="98" fill="#93c5fd" fontSize="9.5" fontWeight="black" textAnchor="middle">실외 안심 연결 브릿지</text>
            <text x="170" y="112" fill="#fbbf24" fontSize="7.5" fontWeight="semibold" textAnchor="middle">우천 시 고마찰 패드 부착 완비</text>
          </g>
        );

      case 4:
      default:
        return (
          <g>
            <rect x="10" y="10" width="320" height="190" rx="14" fill="#0e0a0d" stroke="#4c273a" strokeWidth="2.5" />
            {/* Grid */}
            <line x1="10" y1="50" x2="330" y2="50" stroke="#2d1320" strokeDasharray="3,3" />
            <line x1="10" y1="100" x2="330" y2="100" stroke="#2d1320" strokeDasharray="3,3" />
            <line x1="10" y1="150" x2="330" y2="150" stroke="#2d1320" strokeDasharray="3,3" />

            {/* Stage area front */}
            <rect x="40" y="20" width="260" height="35" rx="6" fill="#2d1320" stroke="#f43f5e" strokeWidth="2.5" />
            <text x="170" y="42" fill="#f43f5e" fontSize="10" fontWeight="black" textAnchor="middle">MAIN AUDITORIUM STAGE (메인 무대)</text>

            {/* Left Side corridor */}
            <rect x="20" y="65" width="45" height="120" rx="6" fill="#141215" stroke="#2c303d" strokeWidth="1.2" />
            <text x="42" y="110" fill="#a0aec0" fontSize="7" fontWeight="bold" textAnchor="middle" transform="rotate(-90, 42, 110)">◀ 피난 대피 보도</text>

            {/* Right Side corridor */}
            <rect x="275" y="65" width="45" height="120" rx="6" fill="#141215" stroke="#2c303d" strokeWidth="1.2" />
            <text x="297" y="110" fill="#a0aec0" fontSize="7" fontWeight="bold" textAnchor="middle" transform="rotate(90, 297, 110)">피난 대피 보도 ▶</text>

            {/* Seating curve concentric path lines */}
            <path d="M 80,85 Q 170,105 260,85" stroke="#4c1e30" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 80,110 Q 170,130 260,110" stroke="#4c1e30" strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 80,135 Q 170,155 260,135" stroke="#4c1e30" strokeWidth="5" fill="none" strokeLinecap="round" />

            {/* Special Wheelchair Seats dedicated bay */}
            <rect x="110" y="145" width="120" height="35" rx="6" fill="#0d2621" stroke="#059669" strokeWidth="1.8" />
            <text x="170" y="160" fill="#34d399" fontSize="8" fontWeight="black" textAnchor="middle">♿ 교통약자 동반 휠체어석</text>
            <text x="170" y="172" fill="#a7f3d0" fontSize="6.5" fontWeight="bold" textAnchor="middle">장애인 안심 특별 전용 공간 (4석 보유)</text>
          </g>
        );
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

      {/* SECTION: 실시간 현장 혼잡도 분석 (Live Crowd Density Telemetry) */}
      <div className="hc-card rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4 text-left shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <span className="text-[9px] bg-cyan-500/15 text-[#00E5FF] border border-cyan-500/30 px-2.5 py-1 rounded font-black tracking-widest uppercase hc-badge inline-block animate-pulse">
              LIVE DATA RADAR
            </span>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2 font-sans">
              <Users className="w-5 h-5 text-[#00E5FF]" />
              실시간 현장 혼잡도 및 통제 차단 분석
            </h3>
            <p className="text-xs text-slate-400 font-semibold font-sans">
              출발지 지하철 승차 터널구간부터 최접점 객석 진입로까지 통제 가능한 실시간 혼잡도입니다.
            </p>
          </div>

          <button
            onClick={handleRefreshCongestion}
            className="px-3.5 py-2.5 bg-[#121214] hover:bg-slate-800 text-[#00E5FF] border border-[#00E5FF]/30 hover:border-[#00E5FF]/60 rounded-xl text-[10.5px] font-black transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap self-end sm:self-center auto-cols-max shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#00E5FF]" />
            실시간 현황 갱신
          </button>
        </div>

        {/* Live Congestion section list */}
        <div className="space-y-3 pt-1">
          {congestionList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleAreaClick(item.area, item.level, item.density, item.desc)}
              className={`p-3.5 rounded-2xl border bg-gradient-to-r ${item.color} ${item.borderColor} hover:opacity-90 transition-all cursor-pointer space-y-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded font-mono font-black text-slate-400 border border-slate-850 uppercase">
                    {item.id.toUpperCase()}
                  </span>
                  <span className="text-[11.5px] font-extrabold text-white tracking-tight">
                    {item.area}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-[10.5px] font-black ${item.textCol}`}>
                    {item.text}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-[11px] font-mono font-black text-white">
                    {item.density}%
                  </span>
                </div>
              </div>

              {/* Progress bar and helper subtext */}
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div
                    style={{ width: `${item.density}%` }}
                    className={`h-full transition-all duration-500 rounded-full ${
                      item.level === 'crowded' ? 'bg-rose-500' :
                      item.level === 'normal' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                  />
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-sans font-bold leading-normal">
                  <p className="line-clamp-1">{item.desc}</p>
                  <p className="text-[#00E5FF] hover:underline whitespace-nowrap shrink-0">TTS 가이드 🔊</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-[#0b0c10] rounded-xl border border-slate-850/90 text-left">
          <p className="text-[10px] text-zinc-400 font-sans font-bold leading-relaxed">
            💡 카드를 터치하면 구역별 밀집 현황과 휠체어 회전반경 가이드를 음성으로 안내합니다.
          </p>
        </div>
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
        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850">
          <p className="text-[10px] text-slate-400 leading-normal font-sans text-center font-bold">
            💡 버튼을 누르면 건물 3D 정밀 도면 뷰어가 전체 화면으로 실행됩니다.
          </p>
        </div>
      </div>

      {/* FULLSCREEN IMMERSIVE TAKE-OVER 3D DIGITAL-TWIN VIEW */}
      {is3DActive && (
        <div className="fixed inset-0 z-50 bg-[#060608] flex flex-col justify-between overflow-hidden text-left">
          
          {/* Top Header Panel */}
          <div className="z-20 flex justify-between items-center bg-[#0d0d10] border-b border-slate-800 px-4 sm:px-6 py-2.5 sm:py-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/20 hidden sm:block">
                <Layers className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  S-MAP 3D 디지털 트윈
                  <span className="text-[8px] sm:text-[9px] bg-cyan-500/15 text-[#00E5FF] border border-cyan-550/30 px-1 py-0.5 rounded font-mono font-bold uppercase tracking-widest animate-pulse">
                    LIVE
                  </span>
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold font-sans mt-0.5 hidden md:block">
                  실시간 보행로 물리 지형 데이터 및 휠체어 전동 회전 반경 통과 여부를 3D 가상 투시하여 검측합니다.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                setIs3DActive(false);
                setIsShowMobileSpecs(false);
                onAnnounce("3D 공간 시뮬레이터를 종료하고 안전 보도 메인 요약도로 복귀했습니다.");
              }}
              className="px-3 py-1.5 bg-rose-950/25 hover:bg-rose-900/40 text-rose-400 border border-rose-500/30 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 shadow select-none"
            >
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>종료</span>
            </button>
          </div>

          {/* Content Panel Layout (horizontal split) */}
          <div className="flex-1 w-full flex flex-col md:flex-row relative overflow-hidden">
            
            {/* Left Sidebar: Controls & Options */}
            <div className="hidden md:flex w-full md:w-64 border-r border-[#1a1a1f] bg-[#0c0c0e] p-5 flex flex-col justify-between shrink-0 space-y-6 overflow-y-auto">
              
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
            <div className="flex-1 relative flex flex-col justify-between bg-[#08080a] p-3 sm:p-4 overflow-hidden select-none">
              
              {/* MOBILE COMPACT FLOATING CONTROLLER FOR S-MAP */}
              <div className="md:hidden z-30 flex flex-col gap-1.5 mt-0.5 px-0.5">
                {/* Floor Selection + View Mode compact bar */}
                <div className="flex flex-wrap gap-2 items-center justify-between bg-slate-900/95 border border-slate-800 p-2 rounded-xl backdrop-blur-sm">
                  {/* Left: Floor Selection */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400 font-black tracking-tighter uppercase mr-1">Floor:</span>
                    <div className="flex gap-1">
                      {[4, 3, 2, 1].map((f) => {
                        const isSelected = selectedFloor === f;
                        return (
                          <button
                            key={f}
                            onClick={() => {
                              setSelectedFloor(f);
                              onAnnounce(`3D 내부 가상 도면: [${f}층 내부 다면 구조]를 변경 투사했습니다.`);
                            }}
                            className={`w-7 h-7 rounded-md font-black text-xs transition-all cursor-pointer flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#00E5FF] text-slate-950 font-black shadow-inner'
                                : 'bg-slate-950 border border-slate-850 text-slate-400 hover:text-white'
                            }`}
                          >
                            {f}F
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: View Mode pills */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-zinc-400 font-black tracking-tighter uppercase mr-0.5">Scan:</span>
                    <div className="flex gap-1">
                      {[
                        { id: 'default', label: '🗺️ 구조' },
                        { id: 'hazard', label: '⚠️ 단차' },
                        { id: 'radius', label: '♿ 회전' },
                      ].map((item) => {
                        const isActive = viewMode === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setViewMode(item.id as any);
                              onAnnounce(`3D 스캔 모드 변경: ${item.label}`);
                            }}
                            className={`px-1.5 py-1 rounded-md text-[9px] font-black transition-all cursor-pointer ${
                              isActive
                                ? 'bg-cyan-900/40 border border-[#00E5FF]/40 text-[#00E5FF] shadow-inner font-extrabold'
                                : 'bg-slate-950 border border-slate-850 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Sub-bar with Floor label name & Spec info sheet toggle */}
                <div className="flex items-center justify-between text-[11px] bg-slate-950/90 border border-slate-900/60 p-2 rounded-xl">
                  <p className="text-zinc-300 font-black text-[10.5px] truncate max-w-[170px] sm:max-w-none">
                    📍 {DETAILED_3D_FLOORS[selectedFloor].title.split('[')[1]?.replace(']', '') || DETAILED_3D_FLOORS[selectedFloor].title}
                  </p>
                  
                  {/* Detailed Spec Toggle Button */}
                  <button
                    onClick={() => {
                      setIsShowMobileSpecs(prev => !prev);
                      onAnnounce("층별 안전 편의시설 상세 보고서를 모바일 인터페이스로 실행했습니다.");
                    }}
                    className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[9px] text-white font-black transition-all cursor-pointer"
                  >
                    {isShowMobileSpecs ? '📋 닫기' : '📋 편의시설 정보'}
                  </button>
                </div>
              </div>
              
              {/* 3D INTERACTIVE CONTROL BAR (Floating overlay with mode toggles) */}
              <div className="absolute top-4 right-4 z-30 flex items-center gap-1 bg-slate-900/95 border border-slate-800 p-1.5 rounded-xl sm:rounded-2xl shadow-2xl backdrop-blur-sm flex-wrap max-w-[280px] sm:max-w-none">
                {/* Drag Mode Toggles */}
                <button
                  onClick={() => {
                    setDragMode('rotate');
                    onAnnounce("마우스 및 터치 드래그 동작을 [3D 각도 회전 모드]로 변경했습니다.");
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                    dragMode === 'rotate' ? 'bg-[#00E5FF] text-slate-950 shadow-md font-bold' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                  title="드래그시 각도 회전"
                >
                  🔄 회전
                </button>
                <button
                  onClick={() => {
                    setDragMode('pan');
                    onAnnounce("마우스 및 터치 드래그 동작을 [도면 평면 이동(Pan) 모드]로 변경했습니다.");
                  }}
                  className={`px-2 py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                    dragMode === 'pan' ? 'bg-cyan-505 text-slate-950 shadow-md font-bold bg-[#00E5FF]' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                  title="드래그시 도면 이동"
                >
                  🖐️ 이동
                </button>

                <div className="w-[1.2px] h-4 bg-slate-850 hidden sm:block"></div>

                {/* Legacy adjustments fallback */}
                <button 
                  onClick={() => setRotationZ(z => z - 15)}
                  className="hidden sm:inline-flex p-1 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black transition-all cursor-pointer"
                  title="좌회전"
                >
                  ↺
                </button>
                <button 
                  onClick={() => setRotationZ(z => z + 15)}
                  className="hidden sm:inline-flex p-1 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black transition-all cursor-pointer"
                  title="우회전"
                >
                  ↻
                </button>
                <button 
                  onClick={() => setRotationX(x => Math.min(x + 10, 80))}
                  className="hidden sm:inline-flex p-1 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black transition-all cursor-pointer"
                  title="더 눕히기"
                >
                  ▲
                </button>
                <button 
                  onClick={() => setRotationX(x => Math.max(x - 10, 20))}
                  className="hidden sm:inline-flex p-1 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black transition-all cursor-pointer"
                  title="더 세우기"
                >
                  ▼
                </button>

                <div className="w-[1.2px] h-4 bg-slate-850 hidden sm:block"></div>

                {/* Zoom hotkeys */}
                <button
                  onClick={() => setScaling(s => Math.min(2.5, s + 0.15))}
                  className="hidden sm:inline-flex p-1.5 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black cursor-pointer"
                  title="확대"
                >
                  ➕
                </button>
                <button
                  onClick={() => setScaling(s => Math.max(0.3, s - 0.15))}
                  className="hidden sm:inline-flex p-1.5 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black cursor-pointer"
                  title="축소"
                >
                  ➖
                </button>

                <div className="w-[1.2px] h-4 bg-slate-855 hidden sm:block"></div>

                {/* Reset State View trigger */}
                <button 
                  onClick={() => {
                    setRotationX(55);
                    setRotationZ(-18);
                    setScaling(0.85);
                    setPanX(0);
                    setPanY(0);
                    onAnnounce("기본 구조 시야각 및 확대/이동 좌표를 완전 초기화했습니다.");
                  }}
                  className="p-1 px-2.5 bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/20 rounded-lg text-[9px] font-black transition-all cursor-pointer"
                  title="기본 시야 복원"
                >
                  리셋
                </button>
              </div>

              {/* Watermark status directly floating on viewport */}
              <div className="hidden sm:flex absolute top-4 left-4 z-30 items-center gap-2 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-xl text-[9px] font-mono font-bold text-slate-400 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="uppercase tracking-widest text-[#00E5FF]">S-MAP BUILDER: INTERACTIVE</span>
              </div>

              {/* Real Canvas Center Display Stage - Bound with drag handlers */}
              <div 
                onMouseDown={handleStageMouseDown}
                onTouchStart={handleStageTouchStart}
                onTouchMove={handleStageTouchMove}
                onTouchEnd={handleStageTouchEnd}
                onWheel={handleStageWheel}
                className={`flex-1 w-full flex items-center justify-center relative overflow-hidden my-4 select-none ${
                  isDragging ? 'cursor-grabbing' : dragMode === 'rotate' ? 'cursor-grab' : 'cursor-move'
                }`}
                style={{ touchAction: 'none' }}
              >
                
                {/* Stylized custom transform wrap bounding all vectors and billboards */}
                <div 
                  style={{ 
                    transform: `perspective(1200px) rotateX(${rotationX}deg) rotateZ(${rotationZ}deg) scale(${scaling}) translate3d(${panX}px, ${panY}px, 0px)`,
                    transformStyle: 'preserve-3d',
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out'
                  }}
                  className="relative w-[340px] h-[210px] rounded-3xl border border-cyan-500/20 bg-slate-950/40 flex items-center justify-center shadow-[0_0_55px_rgba(0,229,255,0.08)]"
                >
                  
                  {/* Neon inner grid overlay */}
                  <div className="absolute inset-0 opacity-[0.22] bg-[linear-gradient(rgba(0,229,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.08)_1px,transparent_1px)] bg-[size:16px_16px] rounded-3xl"></div>

                  {/* Floor watermark text */}
                  <div className="absolute bottom-4 right-5 select-none pointer-events-none font-mono font-black text-[12px] text-[#00E5FF]/20 tracking-wider">
                    {selectedFloor}F PLAN STRUCT
                  </div>

                  {/* Core Custom Blueprint Floor-specific SVG Render */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-5" viewBox="0 0 340 210">
                    {renderFloorPlanBlueprint(selectedFloor)}
                  </svg>

                  {/* SVG glowing route dynamic drawing path */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#00E5FF] fill-none z-10" viewBox="0 0 340 210">
                    {DETAILED_3D_FLOORS[selectedFloor]?.visualPathNodes && (
                      <>
                        <path 
                          d={DETAILED_3D_FLOORS[selectedFloor].visualPathNodes.map((node, idx) => `${idx === 0 ? 'M' : 'L'} ${node.x * 3.4},${node.y * 2.1}`).join(' ')}
                          strokeWidth="4" 
                          strokeLinecap="round" 
                          strokeDasharray={viewMode === 'radius' ? "6,4" : "none"}
                          className={viewMode === 'radius' ? "stroke-emerald-400 animate-pulse" : "stroke-cyan-400/80"} 
                        />
                        <path 
                          d={DETAILED_3D_FLOORS[selectedFloor].visualPathNodes.map((node, idx) => `${idx === 0 ? 'M' : 'L'} ${node.x * 3.4},${node.y * 2.1}`).join(' ')}
                          strokeWidth="1.5" 
                          className="stroke-white/40" 
                        />
                      </>
                    )}
                  </svg>

                  {/* 3D Billboards positioning (Mapped dynamically to each floor's checkpoints) */}
                  {DETAILED_3D_FLOORS[selectedFloor]?.visualPathNodes?.map((node, idx) => {
                    const pX = node.x * 3.4;
                    const pY = node.y * 2.1;
                    return (
                      <div 
                        key={idx}
                        style={{ 
                          left: `${pX}px`, 
                          top: `${pY}px`,
                          transform: `translate(-50%, -50%) rotateX(-${rotationX}deg) rotateZ(-${rotationZ}deg)`
                        }}
                        className="absolute z-25 flex flex-col items-center pointer-events-none select-none transition-transform"
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-white text-[7.5px] font-bold ${
                          node.type === 'elevator' ? 'bg-cyan-550 text-slate-950 animate-pulse' :
                          node.type === 'toilet' ? 'bg-emerald-500 text-white' :
                          node.type === 'hazard' ? 'bg-red-500 text-white animate-bounce' :
                          'bg-[#00E5FF] text-slate-950'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="mt-1 bg-slate-950/95 text-white border border-slate-800 text-[6.5px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                          {node.label}
                        </div>
                      </div>
                    );
                  })}

                  {/* Dynamic Hazard alert bouncing pin centered on actual hazard location */}
                  {viewMode === 'hazard' && (() => {
                    const hNode = DETAILED_3D_FLOORS[selectedFloor]?.visualPathNodes?.find(n => n.type === 'hazard');
                    if (!hNode) return null;
                    const hX = hNode.x * 3.4;
                    const hY = hNode.y * 2.1;
                    return (
                      <div 
                        style={{ 
                          left: `${hX}px`, 
                          top: `${hY}px`,
                          transform: `translate(-50%, -100%) rotateX(-${rotationX}deg) rotateZ(-${rotationZ}deg)`
                        }}
                        className="absolute z-35 flex flex-col items-center pointer-events-none"
                      >
                        <div className="bg-red-950/95 text-red-100 border-2 border-red-500 px-3 py-1.5 rounded-2xl shadow-[0_0_24px_rgba(239,68,68,0.5)] flex flex-col items-center text-center animate-bounce">
                          <AlertTriangle className="w-4 h-4 text-red-400 mb-0.5" />
                          <span className="text-[7.5px] font-black uppercase text-red-400 tracking-wider">위험 요철물 탐지</span>
                          <span className="text-[9px] font-black text-white whitespace-nowrap mt-0.5 leading-none">
                            {DETAILED_3D_FLOORS[selectedFloor].hazards.split('특정요철:')[1] || DETAILED_3D_FLOORS[selectedFloor].hazards.substring(0, 30)}
                          </span>
                        </div>
                        <div className="w-0.5 h-6 bg-red-500 border-dashed border-r border-red-400"></div>
                        <div className="w-6 h-6 rounded-full border-2 border-red-500 bg-red-500/20 flex items-center justify-center animate-ping">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Circular visual turning radius marker */}
                  {viewMode === 'radius' && (() => {
                    const rNode = DETAILED_3D_FLOORS[selectedFloor]?.visualPathNodes?.[1] || { x: 50, y: 50 };
                    const rX = rNode.x * 3.4;
                    const rY = rNode.y * 2.1;
                    return (
                      <div 
                        style={{ 
                          left: `${rX}px`, 
                          top: `${rY}px`,
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
                            ♿ 회전반경 1.4m 안전검측
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                </div>

              </div>

              {/* Viewport helper info banner */}
              <div className="text-[10px] font-mono text-slate-400 bg-slate-950/80 p-2 border border-slate-900 rounded-2xl text-center leading-relaxed max-w-lg mx-auto w-full z-10 flex flex-col sm:flex-row items-center justify-center gap-2">
                <span>
                  💡 <strong>화면 드래그:</strong> {dragMode === 'rotate' ? '각도 회전' : '도면 이동'} | <strong>휠/핀치:</strong> 확대·축소
                </span>
              </div>

              {/* MOBILE COMPACT DETAIL SHEET OVERLAY */}
              <AnimatePresence>
                {isShowMobileSpecs && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="md:hidden absolute bottom-12 left-3 right-3 z-40 bg-slate-950/95 border border-[#00E5FF]/40 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 backdrop-blur-md text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="flex items-center gap-1.5 ">
                        <span className="text-[10px] bg-cyan-500/20 text-[#00E5FF] px-2 py-0.5 rounded font-black font-sans uppercase">
                          {selectedFloor}F 편의시설 정보
                        </span>
                      </div>
                      <button
                        onClick={() => setIsShowMobileSpecs(false)}
                        className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3 overflow-y-auto max-h-[160px] pr-1">
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">구역 정보</h5>
                        <p className="text-[11px] text-zinc-300 font-extrabold leading-relaxed">
                          {DETAILED_3D_FLOORS[selectedFloor].desc}
                        </p>
                      </div>

                      <div className="border-t border-slate-900 pt-2 space-y-2">
                        <div className="text-left space-y-0.5">
                          <p className="text-[10px] font-black text-blue-400 flex items-center gap-1">
                            <span>🚻</span>
                            <span>배리어프리 편의 화장실</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold leading-normal">{DETAILED_3D_FLOORS[selectedFloor].toilet}</p>
                        </div>

                        <div className="text-left space-y-0.5">
                          <p className="text-[10px] font-black text-cyan-400 flex items-center gap-1">
                            <span>🛗</span>
                            <span>승강설비 및 수직 리프트</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold leading-normal">{DETAILED_3D_FLOORS[selectedFloor].elevator}</p>
                        </div>

                        <div className="text-left space-y-0.5">
                          <p className="text-[10px] font-black text-amber-500 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>주의 필요 지면 요철</span>
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold leading-normal">{DETAILED_3D_FLOORS[selectedFloor].hazards}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Right Sidebar: Real Specification & Checklist */}
            <div className="hidden md:flex w-full md:w-80 border-l border-[#1a1a1f] bg-[#0c0c0e] p-5 flex flex-col justify-start space-y-4 overflow-y-auto shrink-0">
              
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
