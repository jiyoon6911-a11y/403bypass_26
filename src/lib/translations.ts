import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ko' | 'en' | 'ja' | 'zh';

// Translation dictionaries mapping direct Korean strings to custom languages
export const TRANSLATIONS: Record<string, Record<Exclude<Language, 'ko'>, string>> = {
  // Navigation / Tabs
  "홈": { en: "Home", ja: "ホーム", zh: "首页" },
  "안내맵": { en: "Guide Map", ja: "ガイドマップ", zh: "导航图" },
  "매칭예약": { en: "Matching", ja: "マッチング", zh: "配对预约" },
  "나의티켓": { en: "My Tickets", ja: "マイチケット", zh: "我的门票" },
  "마이": { en: "My Page", ja: "マイページ", zh: "个人空间" },
  "접근성센터": { en: "Accessibility Center", ja: "アクセシビリティセンター", zh: "无障碍中心" },

  // SettingsModal (전산센터)
  "글자 및 구성 요소 확대 비율": { en: "Text & Component Scale Rate", ja: "文字・コンポーネント拡大率", zh: "文字及组件放大比例" },
  "크기 작게": { en: "Small", ja: "小", zh: "缩小" },
  "최대 확대": { en: "Maximum", ja: "最大", zh: "最大" },
  "완벽 고대비 흑백 모드": { en: "High Contrast B&W Mode", ja: "高コントラスト白黒モード", zh: "高对比度黑白模式" },
  "배경을 완전한 검은색(#000000)으로 전환해 저시력 시각 가시도 보호": { 
    en: "Switch background to pure black to protect low-vision visibility", 
    ja: "弱視者の視認性を保護するために背景を完全な黒（#000000）に切り替える", 
    zh: "将背景转换为纯黑色 (#000000) 以保护低视力人群的可见度" 
  },
  "앱 언어 변환": { en: "App Language Settings", ja: "アプリの言語設定", zh: "应用语言设置" },
  "화면 테마 설정": { en: "Screen Appearance", ja: "画面テーマ設定", zh: "屏幕色彩外观" },
  "기기 설정 자동 맞춤": { en: "System / Auto", ja: "システム設定に同期", zh: "自动随系统主题" },
  "다크 모드": { en: "Dark Mode", ja: "ダークモード", zh: "深色模式" },
  "라이트 모드": { en: "Light Mode", ja: "ライトモード", zh: "浅色模式" },
  "한국어": { en: "Korean (한국어)", ja: "韓国語 (한국어)", zh: "韩语 (한국어)" },
  "영어": { en: "English (영어)", ja: "英語 (영어)", zh: "英语 (영어)" },
  "일본어": { en: "Japanese (일본어)", ja: "日本語 (일본어)", zh: "日语 (일본어)" },
  "중국어": { en: "Chinese (중국어)", ja: "中国語 (중국어)", zh: "中文 (중국어)" },

  // Home Tab
  "실시간 혼잡 통계": { en: "Real-time Crowd Stats", ja: "リアルタイム混雑統計", zh: "实时拥挤度统计" },
  "동행 매니저": { en: "Escort Manager", ja: "同行マネージャー", zh: "同行经理" },
  "안심 예약": { en: "Safe Booking", ja: "あんしん予約", zh: "安心预约" },
  "자막안경": { en: "Subtitle Glass", ja: "字幕メガネ", zh: "字幕眼镜" },
  "대여": { en: "Rental", ja: "レンタル", zh: "租赁" },
  "대여신청": { en: "Rent", ja: "レンタルを申請", zh: "申请租赁" },
  "전동휠체어": { en: "Wheelchair", ja: "車椅子", zh: "轮椅" },
  "보행 지원": { en: "Mobility", ja: "歩行支援", zh: "步行支持" },
  "무장벽 통합 시야 검측": { en: "Barrier-Free View Inspector", ja: "バリアフリー統合視野検知", zh: "无障碍集成视线检测" },
  "수원시 22°C": { en: "Suwon 22°C", ja: "水原市 22°C", zh: "水原市 22°C" },
  "오늘의 관람 날씨": { en: "Today's Weather", ja: "本日の観覧天気", zh: "今日观演天气" },
  "배리어프리 지수 양호 🟢": { en: "Barrier-Free Index: Good 🟢", ja: "バリアフリー指数 良好 🟢", zh: "无障碍指数 良好 🟢" },
  "무장벽제 투어": { en: "Barrier-Free Tour", ja: "バリアフリーツアー", zh: "无障碍之旅" },
  "공연 목록": { en: "Show Catalog", ja: "公演カタログ", zh: "演出目录" },
  "총": { en: "Total", ja: "計", zh: "共" },
  "개의 맞춤 공연 목록": { en: "personalized shows found", ja: "個のパーソナライズされた公演", zh: "个个性化演出推荐" },
  "태그 필터": { en: "Tag Filter", ja: "タグフィルター", zh: "标签过滤" },
  "인기": { en: "Popular", ja: "人気", zh: "热门" },
  "관람가이드": { en: "View Guide", ja: "観覧ガイド", zh: "看剧指南" },
  "상세보기": { en: "View Details", ja: "詳細を見る", zh: "查看详情" },

  // Mobility Tab
  "화면 드래그:": { en: "Drag Screen:", ja: "画面ドラッグ:", zh: "拖动画面:" },
  "각도 회전": { en: "Rotate Angle", ja: "角度回転", zh: "角度旋转" },
  "도면 이동": { en: "Pan Map", ja: "図面移動", zh: "移动图面" },
  "휠/핀치:": { en: "Wheel/Pinch:", ja: "ホイール/ピンチ:", zh: "滚轮/捏合:" },
  "확대·축소": { en: "Zoom In/Out", ja: "拡大・縮小", zh: "放大/缩小" },
  "층별 안내": { en: "Floor Guide", ja: "階別案内", zh: "楼层指南" },
  "엘리베이터 위치 정보": { en: "Elevators", ja: "エレベーターの位置", zh: "电梯位置" },
  "장애물 감지 스캔": { en: "Obstacle Detector", ja: "障害物検知", zh: "障碍物检测" },
  "휠체어 반경 점검": { en: "Radius Checker", ja: "回転半径チェック", zh: "旋转半径检测" },
  "버튼을 누르면 건물 3D 정밀 도면 뷰어가 전체 화면으로 실행됩니다.": {
    en: "Click the button to open the full-screen 3D schematic floor viewer.",
    ja: "ボタンを押すと、全画面表示の3D精密フロアビューアが起動します。",
    zh: "点击按钮以全屏打开 3D 精密平面图浏览器。"
  },
  "카드를 터치하면 구역별 밀집 현황과 휠체어 회전반경 가이드를 음성으로 안내합니다.": {
    en: "Touch area cards to receive spoken voice navigation on congestion and wheelchair turning guidelines.",
    ja: "カードをタッチすると、エリアごশের混雑状況や車椅子回転ガイドが音声で案内されます。",
    zh: "轻触卡片可听取关于拥挤情况及轮椅转向半径要求的语音导航。"
  },
  "디지털 트윈 3D 구조 시물레이터": { en: "Digital Twin 3D Simulator", ja: "デジタルツイン 3Dシミュレーター", zh: "数字孪生 3D 系统" },
  "실시간 AI 안내 카메라 켜기": { en: "Turn on AI Guidance Camera", ja: "AI障害物検知カメラを起動", zh: "启动 AI 避障摄像机" },

  // Tickets Tab / Reservation Tab
  "나의 예매 목록": { en: "My Booked Shows", ja: "マイ予約リスト", zh: "我的已预订演出" },
  "매칭 예약": { en: "Booking Safe Matching", ja: "予約マッチング", zh: "安心预约配对" },
  "동행 매칭": { en: "Escort Matching", ja: "同行マッチング", zh: "同行人配对" },
  "안경 신청": { en: "Smart Glass Rent", ja: "スマートメガネのレンタル", zh: "智能眼镜租赁" },
  "예약 내역이 없습니다.": { en: "No reservations found.", ja: "予約履歴がありません。", zh: "暂无预约记录。" },
  "티켓 추가 등록": { en: "Add External Ticket", ja: "外部チケット追加", zh: "添加外部门票" },
  "외부 예매처 티켓 연동 (시뮬레이터)": { en: "Sync External Booking Agency Ticket", ja: "外部予約サイトのチケット連携", zh: "同步外部订票平台门票" },
  "인터파크, YES24 등 타사에서 예매한 내역을 연동하여 모바일 자막 안경 및 휠체어 전용 편의 설정을 구성합니다.": {
    en: "Connect external tickets from Interpark or YES24 to seamlessly configure smart subtitle glasses or physical mobility help configurations.",
    ja: "Interpark や YES24 などの外部チケットを連携して、スマート字幕メガネや車椅子移動用の便利オプションを設定します。",
    zh: "同步大麦、猫眼等外部门票以无缝配置智能字幕眼镜或轮椅出行便利选项。"
  },

  // Profile Tab
  "배리어프리 한줄평 및 이용자 교류 게시판": { en: "Feedback & Community", ja: "アクセシビリティ掲示板", zh: "无障碍反馈与社区交流" },
  "리뷰 쓰기": { en: "Write Review", ja: "レビューを書く", zh: "写评价" },
  "팔로잉": { en: "Following", ja: "フォロー中", zh: "已关注" },
  "로그아웃 및 서비스 종료": { en: "Log out and exit service", ja: "ログアウトしてサービスを終了", zh: "退出登录并关闭服务" },
  "ID를 터치하면 상대방을 팔로우하여 안전 등급을 구독합니다.": {
    en: "Tap ID to follow other users and check their barrier-free ratings.",
    ja: "IDをタッチすると、相手をフォローしてアクセシビリティ評価を購読できます。",
    zh: "轻触 ID 可关注对方并订阅其发布的信息等级。"
  },
  "다른 회원과의 소통과 식별을 위해 가입 후 고유 ID는 변경하실 수 없습니다.": {
    en: "For safety/identification across the network, user ID cannot be altered afterwards.",
    ja: "ユーザーの識別と安全のため、登録後のユーザーIDは変更できません。",
    zh: "为确保用户识别与安全，注册后的用户 ID 无法更改。"
  },

  // Interactive phone helper on launcher
  "알림 센터 수신": { en: "Notification Received", ja: "通知を受信", zh: "收到系统通知" },
  "비상 전산 상담국 연동 상태 점검": { en: "Checking emergency tech line status", ja: "緊急連絡ラインのステータスチェック中", zh: "正在检测紧急热线状态" },
  "안내:": { en: "Guide:", ja: "案内:", zh: "指南:" },
  "접근성 센터 설정": { en: "Open Accessibility Panel", ja: "アクセシビリティ設定を開く", zh: "打开无障碍设置" },
  "403 BYPASS 앱을 구동합니다. 전산 인프라 및 단말 보안 상태를 점검 중입니다.": {
    en: "Booting 403 BYPASS app. Checking digital credentials and infrastructure security...",
    ja: "403 BYPASSアプリを起動しています。ネットワーク安全性をチェック中...",
    zh: "正在启动 403 BYPASS。正在检查设备安全及基础网络..."
  },
  "403 BYPASS 앱 구동 완료. 안전 식별 및 우회 통행 로그인 시스템을 기동합니다.": {
    en: "403 BYPASS app launched successfully. Powering up identity bypass logins.",
    ja: "403 BYPASSの起動が完了しました。セキュリティ対応ログインシステムを稼働します。",
    zh: "403 BYPASS 启动成功。正在加载身份凭证安全登录入口。"
  }
};

export const SIDEBAR_TRANSLATIONS: Record<string, Record<Exclude<Language, 'ko'>, string>> = {
  "무장벽 모빌리티": { en: "Barrier-Free Mobility", ja: "バリアフリーモビリティ", zh: "无障碍移动出行" },
  "모두가 불편함 없이 공연을 즐길 수 있도록 돕는 배리어프리 공연 관람 서비스입니다.": {
    en: "A barrier-free performance attendance service helping everyone enjoy shows without any discomfort.",
    ja: "誰も가 不便なく公演を楽しめるようサポートする、바리아프리 공연 관람 서비스입니다.",
    zh: "在无人阻碍下帮助所有观演者舒适享受演出的无障碍观演辅助服务。"
  },
  "주요 기능": {
    en: "Key Features",
    ja: "主要機能",
    zh: "主要功能"
  },
  "3D 공연장 안내지도": {
    en: "3D Venue Schematic Guide",
    ja: "3D公演場案内マップ",
    zh: "3D馆场向导地图"
  },
  "AR 길 안내": {
    en: "AR Routing Directory",
    ja: "ARルート案内",
    zh: "AR实景转弯导航"
  },
  "실시간 혼잡 정보 확인": {
    en: "Live Crowd Congestion Info",
    ja: "リアルタイム混雑情報の確認",
    zh: "实时人流拥挤度查询"
  },
  "동행 지원 기능": {
    en: "Companion Support Matching",
    ja: "同行・付き添い支援機能",
    zh: "同伴出行陪同功能"
  },
  "360도 공연장 미리보기": {
    en: "360° Inside-Venue Preview",
    ja: "360度公演場プレビュー",
    zh: "360度场馆全景预览"
  },
  "AR 자막안경 기능": {
    en: "AR Smart Subtitle Glasses",
    ja: "AR字幕メガネ機能",
    zh: "AR智能字幕眼镜功能"
  },
  "다양한 기능을 직접 체험해 보세요.": {
    en: "Please feel free to experience various features in person.",
    ja: "多彩な機能を直接体験してみてください。",
    zh: "尽情亲自体验多重无障碍功能。"
  },
  "사용법 안내": {
    en: "How to Experience",
    ja: "使用案内",
    zh: "使用指南"
  },
  "스마트폰 화면 중앙의 403 BYPASS 아이콘을 눌러 체험을 시작합니다.": {
    en: "Press the 403 BYPASS icon in the center of the mobile screen to begin.",
    ja: "スマートフォン画面中央の 403 BYPASS アイコンを押して体験を開始します。",
    zh: "点击智能手机屏幕中央的 403 BYPASS 图标以开始体验。"
  },
  "원하는 기능을 선택하여 자유롭게 체험해 보세요.": {
    en: "Select any feature you want and experience it freely.",
    ja: "お好みの機能を選択して、自由に体験してみてください。",
    zh: "自主选择所需的功能并开始自由体验。"
  },
  "오른쪽의 접근성 센터에서 글자 크기와 화면 설정을 조절할 수 있습니다.": {
    en: "Adjust font scales and appearance properties via the Accessibility Center on the right.",
    ja: "右側のアクセシビリティセンターで、文字サイズや画面テーマ設定を調整できます。",
    zh: "您可通过右侧的无障碍中心来调节字体尺寸和屏幕色彩外观。"
  },
  "모두를 만족시키는 배리어프리 공연 관람 지원 플랫폼입니다. 3D 안내맵, 실시간 혼잡 통계, 동행 매니징, 그리고 AR 자막안경 제어 모듈을 인터랙티브하게 체험해 보세요.": {
    en: "A barrier-free show attendance support system designed for everyone. Interactively experience 3D routing floor guides, live overcrowding statistics, secure manager escorts, and customized subtitle glasses controls.",
    ja: "すべての人にご満足いただけるバリアフリー公演観覧支援プラットフォームです。3D案内マップ、リアルタイム混雑統計、同行管理、그리고 AR字幕メガネ制御モジュール을 インタラクティブに体験してください。",
    zh: "为所有人提供无障碍演艺观摩支持服务。交互式体验 3D 平面指南、实时人流拥挤度统计、专属同伴陪同预约以及智能 AR 字幕眼镜控制服务。"
  },
  "📲 사용법 안내": { en: "📲 Guide & Instructions", ja: "📲 使用案内", zh: "📲 使用说明" },
  "스마트폰 화면 중앙의": { en: "Touch the center of the mobile screen on ", ja: "スマートフォン画面中央の ", zh: "轻触智能手机屏幕中央的 " },
  "앱 아이콘을 터치하여 실행시킵니다.": { en: "app icon to trigger execution.", ja: " アプリのアイコンをタップすると実行されます。", zh: " 应用程序图标即可运行该软件。" },
  "기기 하단의 메인": { en: "Touch the main bottom ", ja: "機器下部のメイン ", zh: "轻触设备下方的 " },
  "영역을 터치해 다시 폰 홈 화면으로 언제든 나갈 수 있습니다.": {
    en: " capsule bar to exit and return to the phone launcher home screen at any time.",
    ja: " 領域를 탭해서, 언제든 端末홈 화면으로 돌아올 수 있습니다.",
    zh: " 条区域可随时退出应用并返回手机主屏幕。"
  },
  "앱 구동 후 우측의": { en: "After app launch, utilize the ", ja: "アプリ起動後は右側の ", zh: "启动应用后，可使用右侧的" },
  "를 이용해 가변 텍스트 크기 스케일을 조절해 보실 수 있습니다.": {
    en: " configuration widget on the bottom, enabling flexible text scale configurations.",
    ja: " 를 사용하여 가변 텍스트크기를 조정하실 수 있습니다.",
    zh: " 控件来自由调节字体大小和显示比例。"
  },
  "홈 화면으로 나가려면 터치하세요": { en: "Touch to return to home screen", ja: "タッチしてホーム画面に戻る", zh: "轻触返回主屏幕" },
  "💡 클릭 시 모바일 홈 화면으로 탈출합니다": {
    en: "💡 Click here to return to mobile home launcher screen",
    ja: "💡 クリックすると端末홈 화면으로 복귀합니다",
    zh: "💡 点击此处返回手机桌面"
  },
  "보행 안내맵": { en: "3D Map Guide", ja: "歩行案内マップ", zh: "导航展示" },
  "예약 매칭": { en: "Book Escort", ja: "付き添い予約", zh: "预约配对" },
  "안심 렌즈": { en: "Safety Lens", ja: "안심 렌즈", zh: "辅助镜头" },
  "비상 전산 상담국 연결 준비 완료 상태입니다.": { en: "Emergency support registry is active.", ja: "緊急サポートライン接続が準備完了しました。", zh: "紧急技术服务热线已准备就绪。" },
  "S-MAP 실시간 3D 도면 기능은 403 BYPASS 앱 실행 후 [안내맵] 탭에서 구동할 수 있습니다.": {
    en: "S-MAP 3D floor schematic model is available under the [Guide Map] tab after initiating the 403 BYPASS app.",
    ja: "S-MAP 3Dレイアウトは, 403 BYPASSアプリ起動後, [ガイドマップ]タブにて稼働できます。",
    zh: "S-MAP 3D 平面指南需在启动 403 BYPASS 后进入 [导航图] 选项卡中进行体验。"
  },
  "1대1 매니저 동행 및 수어 상담 안심 예약은 403 BYPASS 앱을 먼저 실행하고 신청해 주십시오.": {
    en: "1:1 specialized escort matched bookings must be requested through our primary 403 BYPASS software dashboard.",
    ja: "1:1マンツーマン付き添い予約は、403 BYPASSアプリを先に起動してから申請してください。",
    zh: "一对一配同引导服务需在启动 403 BYPASS 后进入对应界面进行预订。"
  },
  "실시간 카메라 장애물 탐소 센싱 장치는 403 BYPASS 앱 내 전용 카메라 스코프에서 즉치 구동 전송됩니다.": {
    en: "Realtime camera-based obstacle detector sensor scoping becomes live from the camera module of the 430 BYPASS utility.",
    ja: "リアルタイム障害物認識カメラセンサーは, 403 BYPASSアプリ内のカメラタブから即時起動できます。",
    zh: "实时智能摄像头避障扫感模块须在 403 BYPASS 应用内相应的摄像组建中启用。"
  },
  "실시간 무장벽 예술 포럼 채널은 현재 점검 동화 중입니다.": {
    en: "Our direct real-time accessible art forum channel is currently under server maintenance.",
    ja: "現在、リアルタイムバリアフリーフォーラム는 サーバーメンテナンス中です。",
    zh: "实时无障碍艺术研讨频道目前正处于服务器维护中。"
  },
  "서포터 1대1 무벽 안심 메신저 보드가 승인 준비 중입니다.": {
    en: "1:1 barrier-free messaging system validation is being authorized by administration.",
    ja: "サポーター1:1チャットボードの承認를 適用中です。",
    zh: "一对一无障碍安心即时通信聊天正在等待权限下发。"
  }
};

// Merge dictionaries
Object.assign(TRANSLATIONS, SIDEBAR_TRANSLATIONS);

export const HOMETAB_TRANSLATIONS: Record<string, Record<Exclude<Language, 'ko'>, string>> = {
  // Genres & tag translations
  "전체": { en: "All", ja: "すべて", zh: "全部" },
  "뮤지컬": { en: "Musical", ja: "ミュージカル", zh: "音乐剧" },
  "연극": { en: "Play", ja: "演劇", zh: "话剧" },
  "콘서트": { en: "Concert", ja: "コンサート", zh: "演唱会" },
  "휠체어석": { en: "Wheelchair Seat", ja: "車椅子席", zh: "轮椅席" },
  "경사로통행": { en: "Ramps", ja: "スロープ通行", zh: "坡道通行" },
  "휠체어동행": { en: "Wheelchair Escort", ja: "車椅子同行", zh: "轮椅同行" },
  "자막제공": { en: "Subtitles Provided", ja: "字幕提供", zh: "提供字幕" },
  "한국어자막": { en: "Korean Subtitles", ja: "韓国語字幕", zh: "韩语字幕" },
  "문자안내": { en: "Text Guides", ja: "文字案内", zh: "文字指南" },
  "스크린자막": { en: "Screen Captions", ja: "スクリーン字幕", zh: "屏幕字幕" },
  "수어통역": { en: "Sign Language", ja: "手話通訳", zh: "手语翻译" },
  "음성해설": { en: "Audio Description", ja: "音声解説", zh: "语音描述" },
  "음향증폭루프": { en: "Audio Loop", ja: "音響増幅ループ", zh: "助听 Loop" },
  "VR연동": { en: "VR Connected", ja: "VR連動", zh: "VR 联动" },

  // Home Tab main UI
  "휠체어 접근": { en: "Wheelchair Access", ja: "車椅子アクセス", zh: "轮椅通道" },
  "자막 제공": { en: "Captions Provided", ja: "字幕提供", zh: "提供字幕" },
  "음성 해설": { en: "Audio Captions", ja: "音声解説", zh: "语音解说" },
  "수어 통역": { en: "Sign Translations", ja: "手話翻訳", zh: "手语翻译" },
  "어떤 공연을 찾으시나요?": { en: "What performance are you looking for?", ja: "どのような公演をお探しですか？", zh: "您在寻找什么演出？" },
  "🎯 나를 위한 맞춤 공연 추천": { en: "🎯 Curated Recommendations For You", ja: "🎯 あなたに最適なおすすめ公演", zh: "🎯 为您量身定制的演出推荐" },
  "최적 매칭 중": { en: "Matching Optimized", ja: "最適マッチング中", zh: "匹配度高" },
  "현재 등록하신 관심 장르와 지향 편의 수단 기준에 부합히 작동 예정된 무장벽 공연이 아직 없습니다. 선호 조건을 다른 조합으로 넓혀보세요!": {
    en: "No barrier-free curated performances found matching your active filter choices yet. Let's widen the filter properties!",
    ja: "登録されたお気に入りジャンルと移動手段に一致するバリアフリー公演はまだありません。条件を広げてみてください！",
    zh: "暂无符合您所选 관심 类别和无障碍条件的专门推荐演出。请尝试放宽筛选条件以查看更多。"
  },
  "맞춤 장애인 지원 완비 공연 목록": { en: "Barrier-Free Verified Performance List", ja: "バリアフリー認証済み公演リスト", zh: "无障碍认证演出一览" },
  "선택하신 조건에 부합하는 공연정보가 없습니다.": { en: "No matching performances found.", ja: "該当する公演情報が見つかりませんでした。", zh: "未找到符合条件的演出信息。" },
  "전체 조건으로 필터 리셋": { en: "Reset filters", ja: "フィルターをリセット", zh: "重置筛选条件" },
  "무벽안심지수": { en: "Safety Rating", ja: "バリアフリー指数", zh: "无障碍安心指数" },
  "개 매칭": { en: "Matches Found", ja: "件マッチング", zh: "场演出匹配" },
  "공식 홍보대사": { en: "Official Supporter", ja: "公式アンバサダー", zh: "官方宣传大使" },
  "403 서포터즈": { en: "403 Supporter", ja: "403サポーターズ", zh: "403 志愿者" },
  "1기 대모집!": { en: "1st Term Recruiting!", ja: "1期生 大募集！", zh: "首期火热招募！" },
  "접근성 리뷰하고 리워드 받자": { en: "Review Accessibility & Earn Perks", ja: "アクセシビリティを評価して特典をゲット", zh: "撰写无障碍测评 赢取多重好礼" },
  "지원완료 ♿": { en: "Applied ♿", ja: "応募完了 ♿", zh: "已申请 ♿" },
  "지원하기": { en: "Apply Now", ja: "応募する", zh: "立即参与" },

  // Interactive feedback
  "예술 장르 필터를": { en: "Art genre filter set to ", ja: "芸術ジャンルフィルターを ", zh: "演艺门类过滤设为 " },
  "예술 군으로 성공적으로 재정합하였습니다.": { en: " category.", ja: " 芸術群へ正常に切り替えました。", zh: " 类别。" },
  "무장벽 태그 필터를 해제하여 전체 목록으로 원복하였습니다.": {
    en: "Cleared barrier-free tag filter.",
    ja: "バリアフリータグフィルターを解除して全体リストに戻しました。",
    zh: "已取消无障碍标签过滤，恢复完整列表展示。"
  },
  "지원 가능 조건으로 공연을 필터링합니다.": {
    en: " filtering conditions applied.",
    ja: " 支援可能な条件で公演をフィルタリングします。",
    zh: " 筛选条件已应用。"
  },
  "403 바이패스 서포터즈 1기 참여 원서 접수가 완료되었습니다. 무장벽 가이드 뱃지가 마이페이지에 자동 배포됩니다.": {
    en: "403 Bypass Supporters registration successful. An exclusive Helper Badge has been delivered to your My Page logs dashboard.",
    ja: "403バイパスサポーターズ1期生へのご応募ありがとうございます。プロフィールのマイページにバリアフリーバッジが自動配布されます。",
    zh: "403无障碍志愿者首期申请成功！专属专属无障碍向导徽章已发放至您的个人中心卡包。"
  },
  "실시간 보행 음성 보이스 탐색 엔진을 로드하고 있습니다.": {
    en: "Loading live walking audio description navigator engine...",
    ja: "リアルタイム歩行音声ガイダンスエンジンをロード中...",
    zh: "正在加载实时步行语音辅助导航引擎..."
  },
  "검색 필터를 초기화해 전체 공연 목록으로 환원했습니다.": {
    en: "Cleared search filters to retrieve overall options list.",
    ja: "検索条件をリセットし、すべての公演リストを再表示しました。",
    zh: "已重置搜索条件，返回完整演出列表。"
  }
};

Object.assign(TRANSLATIONS, HOMETAB_TRANSLATIONS);

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ko',
  setLanguage: () => {},
  t: (text) => text,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bypass_app_language');
    return (saved as Language) || 'ko';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bypass_app_language', lang);
  };

  // Safe robust translation finder
  const t = (text: string): string => {
    if (language === 'ko') return text;
    
    // Exact match lookup
    const trimmed = text.trim();
    if (TRANSLATIONS[trimmed] && TRANSLATIONS[trimmed][language]) {
      return TRANSLATIONS[trimmed][language];
    }

    // Substring fallback or fuzzy/fallback match
    for (const key of Object.keys(TRANSLATIONS)) {
      if (trimmed.includes(key)) {
        const replacement = TRANSLATIONS[key][language];
        return trimmed.replace(key, replacement);
      }
    }
    
    return text;
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t } },
    children
  );
};

export const useTranslation = () => useContext(LanguageContext);
