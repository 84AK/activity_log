"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Shield } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type PrivacyPolicyModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  
  const privacyPolicyContent = `
# 개인정보 처리방침

본 개인정보 처리방침은 **아크랩스(AKLabs) AI 실습 포털**(이하 "서비스")이 이용자의 개인정보를 어떻게 수집, 이용, 보호하는지 안내합니다. 본 서비스는 교육부의 '학습지원 소프트웨어 필수기준'을 준수합니다.

---

## 1. 개인정보의 수집 및 이용 목적
서비스는 다음의 목적을 위해 최소한의 개인정보를 수집 및 이용합니다.
- **학습 이력 관리**: 팀별/주차별 실습 기록 작성 및 관리, 동료 학습 내용 공유.
- **서비스 제공 및 관리**: 이용자 식별, 로그인 인증, 시스템 보안 유지.

## 2. 수집하는 개인정보의 항목
서비스는 회원가입 및 이용 시 아래의 항목을 수집합니다.
- **필수 항목**: 아이디(ID), 비밀번호
- **자동 수집 항목**: 접속 로그, 쿠키 등 내부 통계 데이터

> 본 서비스는 이용자의 이름, 이메일, 전화번호 등 불필요한 개인정보를 수집하지 않는 **데이터 최소화(Data Minimization)** 원칙을 준수합니다.

## 3. 개인정보의 보유 및 이용 기간
- 수집된 개인정보는 **이용자가 회원 탈퇴를 요청하거나 목적이 달성될 때까지** 보유 및 이용됩니다.
- 단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.

## 4. 만 14세 미만 아동의 개인정보 보호
- 본 서비스는 만 14세 미만 아동이 이용할 수 있으며, 이 경우 **법정대리인(부모 등)의 동의** 또는 절차를 거쳐야 합니다.
- 만 14세 미만 아동의 개인정보 수집 시 법정대리인의 관련 권리(열람, 정정, 삭제 등)를 보장합니다.

## 5. 이용자의 권리 및 행사 방법
이용자는 언제든지 자신의 개인정보에 대해 다음의 권리를 행사할 수 있습니다.
1. **열람 및 정정**: 대시보드 내 정보 확인/수정.
2. **삭제 및 처리정지 요구**: 회원 탈퇴 또는 관리자 문의를 통한 조치.
- 권리 행사는 관리자에게 서면, 전자우편 등을 통해 요청하실 수 있으며, 서비스는 지체 없이 처리합니다.

## 6. 개인정보의 기술적/관리적 보호 조치
서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
- **비밀번호 암호화**: 이용자의 비밀번호는 암호화되어 안전하게 관리됩니다.
- **접근 권한 관리**: 인가된 관리자 외 불필요한 접근을 제한합니다.

## 7. 개인정보 보호책임자 및 문의처
서비스 이용 중 발생하는 개인정보 보호 관련 모든 문의는 아래의 책임자에게 연락해 주시기 바랍니다.
- **담당자**: [관리자 성함/팀명 입력 필요]
- **연락처/이메일**: [이메일 등 연락처 입력 필요]

---
*본 방침은 2026년 3월 18일부터 적용됩니다.*
`

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/10"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Shield size={20} className="text-blue-400" /> 상세 개인정보 처리방침
              </h2>
              <button onClick={onClose} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar text-left flex-1 bg-black/20">
              <div className="prose prose-invert prose-purple max-w-none text-sm
                  prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                  prose-headings:text-white prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-6
                  prose-h1:text-xl prose-h2:text-base prose-h3:text-sm
                  prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-4
                  prose-ul:list-disc prose-ul:pl-4 prose-ul:mb-4 prose-ul:text-white/80
                  prose-ol:list-decimal prose-ol:pl-4 prose-ol:mb-4 prose-ol:text-white/80
                  prose-strong:text-white prose-strong:font-bold
                  prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-blue-200
                  prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-white/60 bg-white/5 p-4 rounded-xl border border-white/10 mt-4 mb-4
                ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {privacyPolicyContent}
                </ReactMarkdown>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
