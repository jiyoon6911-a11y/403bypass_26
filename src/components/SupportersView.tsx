import React, { useState, useEffect } from 'react';
import { ArrowLeft, Award, CheckCircle, Heart, ShieldAlert, Sparkles, Send, ChevronRight, FileText, Calendar, Users } from 'lucide-react';
import { useTranslation } from '../lib/translations';

interface SupportersViewProps {
  onBack: () => void;
  onAnnounce: (msg: string) => void;
  highContrast: boolean;
}

export default function SupportersView({ onBack, onAnnounce, highContrast }: SupportersViewProps) {
  const { t } = useTranslation();
  const [subView, setSubView] = useState<'info' | 'form'>('info');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [motivation, setMotivation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if already applied
  useEffect(() => {
    const isApplied = localStorage.getItem('bypass_supporter_applied');
    if (isApplied) {
      setSubmitted(true);
      const savedForm = localStorage.getItem('bypass_supporter_form');
      if (savedForm) {
        const parsed = JSON.parse(savedForm);
        setName(parsed.name || '');
        setPhone(parsed.phone || '');
        setMotivation(parsed.motivation || '');
      }
    }
  }, []);

  const handleBack = () => {
    if (subView === 'form') {
      setSubView('info');
      onAnnounce(t("403 서포터즈 모집안내 요약 화면으로 복귀하였습니다."));
    } else {
      onBack();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !motivation.trim()) {
      onAnnounce(t("지원자 이름, 연락처 및 지원 동기 항목을 모두 작성해 주세요."));
      alert(t("모든 빈칸을 채워주세요."));
      return;
    }

    setIsSubmitting(true);
    onAnnounce(t("403 서포터즈 1기 지원서를 안전하게 서버에 동기화 전송 중입니다."));

    setTimeout(() => {
      localStorage.setItem('bypass_supporter_applied', 'true');
      const formData = { name, phone, motivation, appliedAt: new Date().toISOString() };
      localStorage.setItem('bypass_supporter_form', JSON.stringify(formData));
      
      // Update the user profile if possible to show "Barrier-free Guide" badge!
      const loggedUserStr = localStorage.getItem('bypass_logged_in_user');
      if (loggedUserStr) {
        try {
          const userObj = JSON.parse(loggedUserStr);
          userObj.role = "403 서포터즈 1기";
          localStorage.setItem('bypass_logged_in_user', JSON.stringify(userObj));
          // Dispatch custom event to let App.tsx know profile or role might have updated
          window.dispatchEvent(new Event('storage'));
        } catch (err) {
          console.error("Error setting supporter badge role:", err);
        }
      }

      setSubmitted(true);
      setIsSubmitting(false);
      onAnnounce(t("축하드립니다! 403 BYPASS 유니버설 서포터즈 1기 신규 신청서가 성공적으로 접수되었습니다. 안내 뱃지가 부여됩니다."));
    }, 1500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{subView === 'form' ? t("이전으로") : t("돌아가기")}</span>
          </button>
          <span className="text-xs text-slate-400 font-mono tracking-wider font-extrabold uppercase">
            {subView === 'form' ? 'Application Form' : 'Supporters Info'}
          </span>
        </div>

        {submitted && (
          <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            {t("발송 완료")}
          </span>
        )}
      </div>

      {subView === 'info' ? (
        /* ================= STEP 1: CAMPAIGN INFO PAGE ================= */
        <div className="space-y-6">
          {/* Main Banner Visual Block */}
          <div className="rounded-3xl bg-gradient-to-br from-[#00E5FF] to-blue-600 p-6 text-slate-950 relative overflow-hidden shadow-xl">
            <div className="absolute right-0 bottom-0 opacity-15 transform translate-x-4 translate-y-4 pointer-events-none">
              <Award className="w-48 h-48" strokeWidth={1.5} />
            </div>
            <span className="inline-block px-2.5 py-0.5 bg-black text-[#00E5FF] text-[9px] font-black rounded uppercase tracking-wider mb-3">
              {t("공식 홍보대사")}
            </span>
            <h1 className="text-2xl font-black tracking-tight leading-none text-black">
              {t("403 서포터즈")}
            </h1>
            <h2 className="text-xl font-bold tracking-tight text-black mt-1">
              {t("1기 대모집")}
            </h2>
            <p className="text-xs font-semibold text-black/85 mt-2.5 leading-relaxed max-w-[280px]">
              {t("배리어 프리를 넘어 유니버설 디자인으로. 장벽 없는 공연 문화를 함께 만들 활동가를 찾습니다.")}
            </p>
          </div>

          {/* Campaign Details Info */}
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-sm font-black text-white px-1 border-l-2 border-[#00E5FF] leading-none uppercase tracking-wide">
                {t("활동 목표 및 목적")}
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl flex gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] font-black text-xs flex items-center justify-center shrink-0 border border-[#00E5FF]/20">
                    1
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white">{t("장벽 없는 인프라 체감")}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                      {t("휠체어 접근성, 스마트 자막, 음성 해설 등 공연장에 마련된 다양한 배리어 프리 시설을 먼저 경험하고 리뷰합니다.")}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/60 border border-slate-850 rounded-2xl flex gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#00E5FF]/10 text-[#00E5FF] font-black text-xs flex items-center justify-center shrink-0 border border-[#00E5FF]/20">
                    2
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white">{t("접근성 데이터 고도화")}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                      {t("공연장까지의 이동 경로, 내부 단차, 시야 정보를 측정하여 403 BYPASS 앱 데이터베이스에 기여합니다.")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Panel */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-black text-white px-1 border-l-2 border-[#00E5FF] leading-none uppercase tracking-wide">
                {t("서포터즈 활동 혜택")}
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-gradient-to-tr from-[#131d35]/60 to-[#0c1221]/80 border border-cyan-500/15 p-3.5 rounded-2xl text-left flex flex-col justify-between space-y-3">
                  <div className="text-cyan-400">
                    <Heart className="w-5 h-5 fill-cyan-400/10" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-white leading-tight">{t("무료 관람 및")}</h4>
                    <h4 className="text-xs font-black text-white leading-tight">{t("활동비 지원")}</h4>
                  </div>
                </div>

                <div className="bg-gradient-to-tr from-[#131d35]/60 to-[#0c1221]/80 border border-cyan-500/15 p-3.5 rounded-2xl text-left flex flex-col justify-between space-y-3">
                  <div className="text-[#00E5FF]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-white leading-tight">{t("활동 증명서 및")}</h4>
                    <h4 className="text-xs font-black text-white leading-tight">{t("공식 굿즈 제공")}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Block to Form */}
          <div className="pt-4 pb-2">
            <button
              onClick={() => {
                setSubView('form');
                onAnnounce(t("403 서포터즈 1기 공식 지원서 작성 및 제출 페이지로 연결합니다."));
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-blue-600 hover:opacity-95 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/15 group active:scale-98"
            >
              <FileText className="w-4.5 h-4.5" />
              <span>{submitted ? t("제출 완료된 지원서 확인 및 수정하기") : t("공식 지원서 작성하러 가기")}</span>
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-2.5 font-medium">
              {t("※ 지원은 대한민국 거주 누구나 차별 없이 참여가 가능합니다.")}
            </p>
          </div>
        </div>
      ) : (
        /* ================= STEP 2: APPLICATION FORM PAGE ================= */
        <div className="space-y-5 animate-fadeIn">
          <div className="hc-card rounded-2xl bg-slate-900 border-2 border-[#00E5FF]/20 p-5 space-y-4 shadow-xl">
            <div className="pb-3 border-b border-slate-850 flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-white tracking-tight uppercase flex items-center gap-1.5">
                  <Award className="w-4.5 h-4.5 text-[#00E5FF]" />
                  {t("403 서포터즈 지원")}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium font-mono">APPLICATION FORM</p>
              </div>
              {submitted && (
                <span className="text-[10.5px] font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {t("접수 완료")}
                </span>
              )}
            </div>

            {submitted ? (
              <div className="space-y-4 py-1">
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-black text-white">{t("지원서가 성공적으로 접수되었습니다")}</h4>
                    <p className="text-[10px] font-medium text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                      {t("입력하신 연락처로 선발 심사 결과와 매뉴얼이 전송될 예정입니다. 대단히 감사드립니다.")}
                    </p>
                  </div>
                </div>

                {/* View Submitted Details */}
                <div className="p-3.5 bg-slate-950/40 border border-slate-850 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-450 font-bold">{t("이름 (성명)")}</span>
                    <span className="text-white font-extrabold">{name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-450 font-bold">{t("연락처")}</span>
                    <span className="text-white font-mono font-bold">{phone}</span>
                  </div>
                  <div className="space-y-1 pt-1 text-left">
                    <span className="text-slate-450 font-bold block">{t("지원 동기")}</span>
                    <p className="text-slate-300 font-medium text-[11px] bg-black/40 p-2.5 rounded-lg leading-normal break-all">
                      {motivation}
                    </p>
                  </div>
                </div>

                {/* Reset or Change View buttons */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(t("지원서를 수정하고 다시 제출하시겠습니까?"))) {
                        setSubmitted(false);
                        localStorage.removeItem('bypass_supporter_applied');
                        onAnnounce(t("기존에 제출한 지원서를 편집 모드로 전환합니다."));
                      }
                    }}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-75 * text-slate-300 font-bold text-xs transition-all cursor-pointer text-center"
                  >
                    {t("지원서 수정하기")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubView('info');
                    }}
                    className="py-2.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 text-[#00E5FF] font-black text-xs transition-all cursor-pointer text-center"
                  >
                    {t("안내내용 다시보기")}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  <p className="text-[10px] text-zinc-350 font-medium leading-relaxed flex gap-1.5 items-start">
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{t("지원서 작성: 입력하신 정보는 서포터즈 선발 목적으로만 활용됩니다.")}</span>
                  </p>
                </div>

                {/* Input: Name */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wide">
                    {t("이름")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("본명을 입력해주세요")}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#070709] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all font-semibold"
                  />
                </div>

                {/* Input: Contact */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wide">
                    {t("연락처")} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className="w-full px-3.5 py-2.5 text-xs bg-[#070709] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all font-mono font-bold"
                  />
                </div>

                {/* Textarea: Motivation */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wide">
                    {t("지원 동기")} <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder={t("403 서포터즈에 지원하게 된 계기와 앞으로의 다짐을 자유롭게 적어주세요.")}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#070709] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all leading-relaxed font-medium resize-none"
                  />
                  <p className="text-[9.5px] text-slate-500 font-medium leading-normal pl-0.5">
                    {t("장애 여부와 관계없이 누구나 지원하실 수 있습니다. 선발 결과는 남겨주신 연락처로 개별 안내됩니다.")}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-blue-600 hover:opacity-95 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? t("제출 처리 중...") : t("작성 완료 및 지원하기")}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
