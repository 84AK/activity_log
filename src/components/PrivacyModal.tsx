"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, Calendar, Info, X, FileText } from "lucide-react"

type PrivacyModalProps = {
  isOpen: boolean
  onClose: () => void
  onToggleDoNotShowToday: (checked: boolean) => void
}

export default function PrivacyModal({ isOpen, onClose, onToggleDoNotShowToday }: PrivacyModalProps) {
  const [isChecked, setIsChecked] = useState(false)

  const handleConfirm = () => {
    onToggleDoNotShowToday(isChecked)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden flex flex-col max-h-[85vh] border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-600/10 to-transparent flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <ShieldCheck className="text-blue-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">개인정보 수집 및 이용 안내</h2>
                <p className="text-xs text-white/50">안전한 서비스 이용을 위해 확인이 필요합니다.</p>
              </div>
            </div>

            {/* Content (Bento Style) */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 text-left flex-1">
              
              {/* Purpose & Items */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-blue-300 flex items-center gap-1.5">
                  <FileText size={16} /> 1. 수집 목적 및 항목
                </h3>
                <div className="space-y-2 text-sm text-white/80 leading-relaxed">
                  <p>• <strong>수집 목적</strong>: 학습 이력 관리 및 로그인 인증</p>
                  <p>• <strong>수집 항목</strong>: <span className="text-emerald-400 font-medium">아이디(ID), 비밀번호 (필수)</span></p>
                  <div className="mt-1 p-2 bg-blue-500/5 rounded-lg border border-blue-500/10 flex items-start gap-2">
                    <Info size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-200/80">본 서비스는 주민번호, 이름, 이메일 등 불필요한 개인정보를 수집하지 않습니다.</p>
                  </div>
                </div>
              </div>

              {/* Retention */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-purple-300 flex items-center gap-1.5">
                  <Calendar size={16} /> 2. 보유 및 이용 기간
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  • <strong>보유 기간</strong>: <strong className="text-purple-300">회원 탈퇴 시까지</strong> (목적 달성 후 즉시 파기)
                </p>
              </div>

              {/* Under 14 Notice */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2">
                <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
                  <Info size={16} strokeWidth={2.5} /> ⚠️ 만 14세 미만 이용자 안내
                </h3>
                <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                  만 14세 미만 아동 가입 시 <strong className="text-amber-300">법정대리인의 동의</strong>가 필요합니다. 동의 없는 계정은 이용이 제한될 수 있습니다.
                </p>
              </div>

              <p className="text-center text-xs text-white/40 pt-2">
                상세 내용은 하단의 <strong>'개인정보 처리방침'</strong> 링크를 통해 확인 가능합니다.
              </p>
            </div>

            {/* Footer / Actions */}
            <div className="p-6 border-t border-white/10 bg-black/30 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-sm text-white/60 group-hover:text-white transition-colors">오늘 하루 보지 않기</span>
                </label>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
              >
                확인 및 닫기
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
