"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Filter, Calendar, Users, MessageSquare, Plus, Link, Send, X,
  Loader2, Edit2, Trash2, KeyRound, LogOut, UserPlus, LogIn,
  Eye, EyeOff, ExternalLink, Info, Image as ImageIcon,
  ChevronRight, Home, Settings, BookOpen, Share2, Book
} from "lucide-react"

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// 개인정보 관련 컴포넌트 추가
import PrivacyModal from "@/components/PrivacyModal"
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal"
import Footer from "@/components/Footer"

type LogEntry = {
  id: string
  week: string
  team: string
  author: string
  prompt: string
  link: string
  summary: string
  date: string
  score?: string
  model?: string
}

type ResourceEntry = {
  id: string
  title: string
  content: string
  author: string
  date: string
}

const WEEKS = ["전체", "1주차", "2주차", "3주차", "4주차", "5주차"]

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  // View Navigation State: 'home' | 'auth' | 'dashboard'
  const [viewState, setViewState] = useState<"home" | "auth" | "dashboard">("home")
  const [dashboardTab, setDashboardTab] = useState<"logs" | "resources">("logs")

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [password, setPassword] = useState("")
  const [userRole, setUserRole] = useState<"student" | "admin">("student")
  const [authError, setAuthError] = useState("")
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [showPassword, setShowPassword] = useState(false)

  // Data State
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [resources, setResources] = useState<ResourceEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Filter State
  const [filterWeek, setFilterWeek] = useState("전체")

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false)
  
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState("")

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    week: new Date().toISOString().split('T')[0], // 기본값을 오늘 날짜로 설정
    prompt: "",
    link: "",
    summary: "",
    score: "5",
    model: "Gemini 1.5 Pro"
  })

  // Resource Form State
  const [resourceFormData, setResourceFormData] = useState({
    title: "",
    content: "" // 마크다운 본문
  })

  // Toast State
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // 개인정보 모달 관련 상태
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false)

  // 상세 보기 모달 상태
  const [selectedEntry, setSelectedEntry] = useState<LogEntry | ResourceEntry | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const PROXY_URL = '/api/proxy'

  const handleToggleDoNotShowToday = (checked: boolean) => {
    if (checked) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0) // 자정 기준
      localStorage.setItem("hidePrivacyModalUntil", tomorrow.toISOString())
    } else {
      localStorage.removeItem("hidePrivacyModalUntil")
    }
  }

  const refreshData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    setIsRefreshing(true)
    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getAllData" })
      })
      if (res.ok) {
        const result = await res.json()
        
        // 1. Logs 업데이트 및 캐싱
        if (Array.isArray(result.logs)) {
          const mappedLogs = result.logs.map((item: any) => ({
            id: item.id || item.ID || "",
            week: item.week || item.Week || "",
            team: item.team || item.Team || "",
            author: item.author || item.Author || "",
            prompt: item.prompt || item.Prompt || "",
            link: item.link || item.Link || "",
            summary: item.summary || item.Summary || "",
            date: item.date || item.Date || "",
            score: item.score || item.Score || "",
            model: item.model || item.Model || ""
          })).sort((a: any, b: any) => Number(b.id || 0) - Number(a.id || 0))
          
          setLogs(mappedLogs)
          localStorage.setItem("vibe_logs_cache", JSON.stringify(mappedLogs))
        }

        // 2. Resources 업데이트 및 캐싱
        if (Array.isArray(result.resources)) {
          const sortedResources = result.resources.sort((a: any, b: any) => Number(b.id || 0) - Number(a.id || 0))
          setResources(sortedResources)
          localStorage.setItem("vibe_resources_cache", JSON.stringify(sortedResources))
        }
      }
    } catch (e) {
      console.error("Failed to refresh data", e)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // 호환성을 위해 기존 함수들을 refreshData로 연결
  const fetchLogs = () => refreshData()
  const fetchResources = () => refreshData()

  useEffect(() => {
    setMounted(true)
    
    // 1. 캐시 데이터 먼저 로드 (SWR)
    const cachedLogs = localStorage.getItem("vibe_logs_cache")
    const cachedResources = localStorage.getItem("vibe_resources_cache")
    
    if (cachedLogs) {
      setLogs(JSON.parse(cachedLogs))
      setIsLoading(false) // 캐시가 있으면 일단 로딩 해제
    }
    
    if (cachedResources) {
      setResources(JSON.parse(cachedResources))
    }

    // 2. 백그라운드에서 최신 데이터 패치
    refreshData(!cachedLogs) // 캐시가 없으면 로딩 인디케이터 표시

    // 개인정보 모달 노출 여부 체크
    const hideUntil = localStorage.getItem("hidePrivacyModalUntil")
    if (!hideUntil || new Date(hideUntil) < new Date()) {
       setIsPrivacyModalOpen(true)
    }
  }, []) // viewState나 dashboardTab 변경 시 캐시를 사용하므로 매번 fetch할 필요 없음

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userName.trim() || !password.trim()) {
      setAuthError("아이디와 비밀번호를 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: authMode,
          username: userName,
          password: password
        })
      })

      const data = await res.json()
      if (res.ok && !data.error) {
        if (authMode === "signup") {
          showToast("회원가입 성공! 로그인해 주세요.", "success")
          setAuthMode("login")
          setAuthError("")
        } else {
          setUserRole(data.role || "student")
          setIsLoggedIn(true)
          
          if (data.role === "admin") {
            sessionStorage.setItem("admin_auth", "true")
            sessionStorage.setItem("admin_pass", password)
          }

          setViewState("dashboard")
          showToast(`${userName}님, 환영합니다!`, "success")
          setAuthError("")
        }
      } else {
        setAuthError(data.error || "인증에 실패했습니다.")
        showToast(data.error || "인증에 실패했습니다.", "error")
      }
    } catch (err) {
      console.error(err)
      setAuthError("서버 통신 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName("")
    setPassword("")
    sessionStorage.removeItem("admin_auth")
    sessionStorage.removeItem("admin_pass")
    setViewState("home")
    setDashboardTab("logs")
    showToast("로그아웃 되었습니다.", "success")
  }

  const openCreateModal = () => {
    if (dashboardTab === "logs") {
      setEditMode(false)
      setEditId("")
      setFormData({ 
        week: new Date().toISOString().split('T')[0], 
        prompt: "", 
        link: "", 
        summary: "",
        score: "5",
        model: ""
      })
      setIsModalOpen(true)
    }
  }

  const openEditModal = (log: LogEntry) => {
    setEditMode(true)
    setEditId(log.id)
    setFormData({
      week: log.week || new Date().toISOString().split('T')[0],
      prompt: log.prompt,
      link: log.link,
      summary: log.summary,
      score: log.score || "5",
      model: log.model || "Gemini 1.5 Pro"
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        action: editMode ? "edit" : "create",
        id: editMode ? editId : undefined,
        author: userName,
        password: password,
        ...formData,
      }

      const dbRes = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const resData = await dbRes.json()

      if (dbRes.ok && !resData.error) {
        await fetchLogs()
        setIsModalOpen(false)
        showToast(editMode ? "기록이 성공적으로 수정되었습니다." : "새 기록이 성공적으로 추가되었습니다.", "success")
      } else {
        showToast(resData.error || "데이터 저장에 실패했습니다.", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("오류가 발생했습니다.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== "admin") return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        action: editMode ? "editResource" : "createResource",
        id: editMode ? editId : undefined,
        author: userName,
        password: password,
        title: resourceFormData.title,
        content: resourceFormData.content
      };

      const dbRes = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const resData = await dbRes.json()

      if (dbRes.ok && !resData.error) {
        await refreshData()
        setIsResourceModalOpen(false)
        showToast(editMode ? "자료가 성공적으로 수정되었습니다." : "자료가 성공적으로 등록되었습니다.", "success")
      } else {
        showToast(resData.error || "자료 처리에 실패했습니다.", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("오류가 발생했습니다.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openResourceEditModal = (res: ResourceEntry) => {
    setEditMode(true)
    setEditId(res.id)
    setResourceFormData({
      title: res.title,
      content: res.content
    })
    setIsResourceModalOpen(true)
  }

  const handleDelete = async (id: string, type: "log" | "resource" = "log") => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return

    try {
      const action = type === "log" ? "delete" : "deleteResource";
      const dbRes = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, password })
      })
      const resData = await dbRes.json()

      if (dbRes.ok && !resData.error) {
        if (type === "log") {
          await fetchLogs()
          showToast("기록이 성공적으로 삭제되었습니다.", "success")
        } else {
          await fetchResources()
          showToast("자료가 성공적으로 삭제되었습니다.", "success")
        }
      } else {
        showToast(resData.error || "비밀번호가 일치하지 않거나 권한이 없습니다.", "error")
      }
    } catch (err) {
      console.error(err)
      showToast("삭제 중 오류가 발생했습니다.", "error")
    }
  }

  if (!mounted) return null

  // Derived state: 권한에 따른 리스트 표시
  const authorizedLogs = userRole === "admin" ? logs : logs.filter(l => l.author === userName)

  const filteredLogs = authorizedLogs.filter(log => {
    if (filterWeek !== "전체" && log.week !== filterWeek) return false
    return true
  })

  const isImageLink = (url: string) => /\.(jpeg|jpg|gif|png|webp)$/i.test(url)

  // --- RENDERING VIEWS ---

  // 1. Home View (Landing)
  const renderHomeView = () => (
    <div className="max-w-6xl mx-auto space-y-12 py-10 px-4">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-2">
          AI & Marketing Portal v2.0
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
          AI 실습 및 마케팅 <span className="text-gradient">통합 포털</span>
        </h1>
        <p className="text-[var(--color-agency-muted)] text-lg md:text-xl max-w-2xl mx-auto">
          팀별 주차별 활동을 기록하고 차세대 마케팅 전략을 실험해보세요.
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-none md:grid-rows-2 gap-6">

        {/* Main: Team Practice Log */}
        <motion.div
          whileHover={{ y: -5 }}
          onClick={() => setViewState(isLoggedIn ? "dashboard" : "auth")}
          className="md:col-span-4 md:row-span-1 glass-panel p-8 rounded-3xl group cursor-pointer border border-white/10 relative overflow-hidden bg-gradient-to-br from-blue-600/20 to-indigo-900/20"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <Calendar className="text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">AI 실습 활동 기록 시스템</h2>
              <p className="text-white/60 text-lg leading-relaxed">
                매주 진행되는 팀별 프로젝트와 프롬프트 실험 결과를 기록하세요.<br />
                동료들의 성과를 확인하고 자신의 성장을 추적할 수 있습니다.
              </p>
            </div>
            <div className="flex items-center gap-2 text-blue-400 font-bold mt-8 group-hover:gap-4 transition-all">
              {isLoggedIn ? "대시보드 바로가기" : "로그인 후 입장하기"} <ChevronRight size={20} />
            </div>
          </div>
          <div className="absolute top-0 right-0 p-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
            <Users size={180} />
          </div>
        </motion.div>

        {/* Sellstagram Link */}
        <motion.div
          whileHover={{ y: -5 }}
          className="md:col-span-2 md:row-span-1 glass-panel p-8 rounded-3xl border border-white/10 flex flex-col justify-between group cursor-pointer relative overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-900/20"
          onClick={() => window.open("https://sellstagram.vercel.app/", "_blank")}
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 mb-6">
              <ImageIcon className="text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight flex items-center gap-2">
              셀스타그램 <ExternalLink size={18} />
            </h2>
            <p className="text-white/50 text-base">
              최신 트렌드를 반영한 가상 마케팅 시뮬레이션 앱입니다. SNS 전략을 수립하고 실습하세요.
            </p>
          </div>
          <div className="absolute -bottom-4 -right-4 text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
            <Share2 size={120} />
          </div>
        </motion.div>

        {/* Guide 1: Google Drive */}
        <motion.div
          className="md:col-span-3 md:row-span-1 glass-panel p-8 rounded-3xl border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Share2 size={20} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">이미지/파일 업로드 가이드</h3>
          </div>
          <div className="space-y-4 text-sm text-white/60">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs border border-white/10">1</span>
              <p>구글 드라이브에 공유할 이미지나 파일을 업로드합니다.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs border border-white/10">2</span>
              <p>마우스 우클릭 &gt; <strong className="text-emerald-400">공유</strong> &gt; '링크가 있는 모든 사용자'가 <strong className="text-emerald-400">뷰어/편집자</strong>로 볼 수 있게 설정합니다.</p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs border border-white/10">3</span>
              <p>링크 복사를 눌러 나온 URL을 본 앱의 '결과물 첨부' 칸에 붙여넣으면 끝!</p>
            </div>
          </div>
        </motion.div>

        {/* Guide 2: App Usage */}
        <motion.div
          className="md:col-span-3 md:row-span-1 glass-panel p-8 rounded-3xl border border-white/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
              <BookOpen size={20} className="text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white">앱 사용 꿀팁</h3>
          </div>
          <div className="space-y-4 text-sm text-white/60">
            <div className="flex gap-3 items-start">
              <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p>프롬프트는 <strong className="text-white">Shift+Enter</strong>를 사용해 가독성 좋게 여러 줄로 작성할 수 있습니다.</p>
            </div>
            <div className="flex gap-3 items-start">
              <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p>작성한 글은 <strong className="text-white">본인</strong> 또는 <strong className="text-white">관리자</strong>만 수정/삭제할 수 있어 안전합니다.</p>
            </div>
            <div className="flex gap-3 items-start">
              <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p>오른쪽 상단의 <strong className="text-white">필터</strong>를 활용해 특정 주차나 우리 팀의 글만 모아 보세요.</p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center text-white/30 text-xs tracking-widest uppercase py-8"
      >
        Designed for Excellence • 2026 AI Learning Project
      </motion.div>
    </div>
  )

  // 2. Auth View (Login/Signup)
  const renderAuthView = () => (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative">
      <button
        onClick={() => setViewState("home")}
        className="absolute top-0 left-0 flex items-center gap-2 text-white/40 hover:text-white transition-colors"
      >
        <Home size={18} /> 홈으로 돌아가기
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="glass-panel w-full max-w-md p-8 rounded-2xl flex flex-col items-center border border-white/10 shadow-2xl shadow-blue-900/20"
      >
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
          {authMode === "login" ? <KeyRound size={28} className="text-blue-400" /> : <UserPlus size={28} className="text-emerald-400" />}
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {authMode === "login" ? "AI팀 실습 로그인" : "AI팀 실습 회원가입"}
        </h1>
        <p className="text-[var(--color-agency-muted)] mb-8 text-center text-sm">
          {authMode === "login"
            ? "저장된 아이디와 비밀번호로 접속해주세요."
            : "새로운 아이디와 비밀번호를 설정하여 가입해주세요."}
        </p>

        {/* Auth Mode Toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-6 w-full border border-white/5">
          <button
            onClick={() => { setAuthMode("login"); setAuthError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${authMode === "login" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
          >
            <LogIn size={14} /> 로그인
          </button>
          <button
            onClick={() => { setAuthMode("signup"); setAuthError(""); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${authMode === "signup" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
          >
            <UserPlus size={14} /> 회원가입
          </button>
        </div>

        <form onSubmit={handleAuthAction} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider pl-1">아이디 (ID)</label>
            <input
              type="text" required placeholder="아이디 입력"
              value={userName} onChange={e => setUserName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-white/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider pl-1">비밀번호 (Password)</label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"} required placeholder="비밀번호 입력"
                value={password} onChange={e => { setPassword(e.target.value); setAuthError(""); }}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-12 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-white/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {authError && <p className="text-red-400 text-sm pl-1 pt-1">{authError}</p>}

          <button disabled={isSubmitting} type="submit" className={`w-full py-3.5 rounded-xl text-white font-bold transition-all mt-4 shadow-lg active:scale-95 flex items-center justify-center gap-2 ${authMode === "login"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20"
            : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20"
            }`}>
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (authMode === "login" ? <LogIn size={18} /> : <UserPlus size={18} />)}
            {authMode === "login" ? "로그인하기" : "가입 완료하기"}
          </button>
        </form>
      </motion.div>
    </div>
  )

  // 3. Dashboard View
  const renderDashboardView = () => (
    <div className="space-y-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--color-agency-border)] pb-6"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => setViewState("home")}
              className="mt-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/40 hover:text-white"
              title="홈으로"
            >
              <Home size={20} />
            </button>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                {dashboardTab === "logs" ? (
                  <>실습 <span className="text-gradient">활동 대시보드</span></>
                ) : (
                  <>수업 <span className="text-gradient hover-gradient">자료실</span></>
                )}
              </h1>
              <div className="flex items-center gap-3 text-[var(--color-agency-muted)] text-lg">
                <span>접속 중: <strong className="text-blue-300">{userName}</strong>님</span>
                {userRole === "admin" && <span className="text-xs font-bold text-amber-900 bg-amber-400 px-2 py-0.5 rounded-md">ADMIN</span>}
                <AnimatePresence>
                  {isRefreshing && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-1.5 text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-tighter"
                    >
                      <Loader2 size={10} className="animate-spin" />
                      <span>Syncing</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex bg-white/5 p-1 rounded-xl w-full max-w-sm border border-white/5">
            <button
              onClick={() => setDashboardTab("logs")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${dashboardTab === "logs" ? "bg-white/10 text-white shadow-lg" : "text-white/50 hover:text-white/80"}`}
            >
              <MessageSquare size={16} /> 실습 기록
            </button>
            <button
              onClick={() => setDashboardTab("resources")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${dashboardTab === "resources" ? "bg-white/10 text-white shadow-lg" : "text-white/50 hover:text-white/80"}`}
            >
              <Book size={16} /> 자료실
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {dashboardTab === "logs" ? (
            <button
              onClick={openCreateModal}
              className="flex-1 md:flex-none glass-panel glass-panel-hover px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-white bg-blue-600/20 shadow-lg shadow-blue-500/10"
            >
              <Plus size={18} /> 새 기록
            </button>
          ) : userRole === "admin" ? (
            <button
              onClick={openCreateModal}
              className="flex-1 md:flex-none glass-panel glass-panel-hover px-5 py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-white bg-purple-600/20 shadow-lg shadow-purple-500/10"
            >
              <Plus size={18} /> 자료 등록
            </button>
          ) : null}

          {userRole === "admin" && (
            <a
              href="/admin"
              className="glass-panel glass-panel-hover px-4 py-3 rounded-xl text-white font-bold bg-gradient-to-r from-purple-600 to-blue-600 flex items-center gap-2 shadow-lg hover:shadow-purple-500/20 transition-all border border-white/10"
            >
              <Settings size={18} /> <span className="hidden md:inline">관리자 화면 이동</span>
            </a>
          )}

          <button
            onClick={handleLogout}
            className="glass-panel glass-panel-hover px-4 py-3 rounded-xl text-white/70 hover:text-white bg-white/5 border border-white/10 flex items-center gap-2"
          >
            <LogOut size={18} /> <span className="hidden md:inline">로그아웃</span>
          </button>
        </div>
      </motion.header>

      {/* Main Content Areas */}
      {dashboardTab === "logs" ? (
        <>
          {/* Filter Bar (Logs only) */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 items-center bg-[var(--color-agency-bg)]/50 p-4 rounded-2xl border border-[var(--color-agency-border)] backdrop-blur-md"
          >
            <div className="flex items-center gap-2 text-white font-medium pl-2">
              <Filter size={18} className="text-blue-400" /> 필터:
            </div>

            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <select
                value={filterWeek} onChange={(e) => setFilterWeek(e.target.value)}
                className="glass-panel px-4 py-2 rounded-lg bg-transparent text-white border-white/10 outline-none w-full md:w-40"
              >
                {WEEKS.map(w => <option key={w} className="bg-gray-900">{w}</option>)}
              </select>
            </div>

            {userRole === "admin" && (
              <div className="ml-auto text-xs text-white/40 border border-white/10 px-3 py-1 rounded-full bg-black/20 hidden md:block">
                관리자 권한으로 모든 사용자의 기록이 표시됩니다.
              </div>
            )}
          </motion.div>

          {/* Logs Grid */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <Calendar className="w-8 h-8 text-white/40" />
              </div>
              <h2 className="text-2xl text-white font-semibold">조건에 맞는 기록이 없습니다</h2>
              <p className="text-[var(--color-agency-muted)]">새로운 실습 기록을 남겨보세요.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id || index}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                  onClick={() => { setSelectedEntry(log); setIsDetailModalOpen(true); }}
                  className="glass-panel glass-panel-hover rounded-2xl overflow-hidden border border-white/5 flex flex-col group cursor-pointer"
                >
                  {/* Card Content */}
                  <div className="p-6 flex flex-col h-full space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400 font-bold">
                          {log.author?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{log.author}</p>
                          <p className="text-[10px] text-white/40 mt-0.5 tracking-tighter uppercase font-medium">{log.date || "날짜정보 없음"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < Number(log.score || 5) ? "bg-amber-400 shadow-sm shadow-amber-400/50" : "bg-white/10"}`} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 text-left">
                      <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                        <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                          <Share2 size={10} /> Prompt
                        </h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(log.prompt);
                            showToast("프롬프트가 복사되었습니다!");
                          }}
                          className="text-[10px] bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-2 py-0.5 rounded border border-white/10 transition-colors"
                        >
                          복사
                        </button>
                      </div>
                      <div className="relative max-h-[80px] overflow-hidden">
                        <div className="prose prose-invert prose-xs opacity-80 break-words line-clamp-3">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {log.prompt || "프롬프트 내용 없음"}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col min-h-0 text-left">
                      <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={12} /> 실습 요약
                      </h4>
                      <div className="relative flex-1 min-h-[60px] max-h-[100px] overflow-hidden">
                        <div className="prose prose-invert prose-xs text-[var(--color-agency-muted)] leading-relaxed line-clamp-4 break-words">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {log.summary || "등록된 요약이 없습니다."}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                       <div className="flex gap-2">
                         <button 
                           onClick={(e) => { e.stopPropagation(); setSelectedEntry(log); setIsDetailModalOpen(true); }}
                           className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-medium transition-all"
                         >
                           전체 내용 보기
                         </button>
                         {(log.author === userName || userRole === "admin") && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); openEditModal(log); }}
                             className="px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-blue-300 text-xs font-medium transition-all"
                           >
                             수정
                           </button>
                         )}
                       </div>

                      {log.link && (
                        <div className="pt-2 border-t border-white/5 text-left">
                          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                            <Link size={14} /> 결과물 첨부
                          </h4>

                          {isImageLink(log.link) ? (
                            <div className="w-full h-24 rounded-lg overflow-hidden border border-white/10 relative group-hover:border-purple-500/30 transition-colors">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={log.link} alt="첨부 결과물" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <a href={log.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors text-xs border border-blue-500/20">
                              <Link size={14} />
                              <span className="truncate">{log.link}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Resources List */
        <div className="space-y-6">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : resources.length === 0 ? (
            <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <Book className="w-8 h-8 text-white/40" />
              </div>
              <h2 className="text-2xl text-white font-semibold">등록된 자료가 없습니다</h2>
              <p className="text-[var(--color-agency-muted)]">
                {userRole === "admin" ? "새로운 자료를 등록하여 학생들과 공유해보세요." : "자료가 등록될 때까지 기다려주세요."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {resources.map((resource, index) => (
                <motion.div
                  key={resource.id || index}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                  onClick={() => { setSelectedEntry(resource); setIsDetailModalOpen(true); }}
                  className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group relative border-purple-500/20 cursor-pointer"
                >
                  {/* Action Buttons removed - Managed in /admin */}

                  <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent text-left">
                    <h3 className="text-xl font-bold text-white mb-2">{resource.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span className="flex items-center gap-1"><Info size={12} /> {resource.author}</span>
                      <span>•</span>
                      <span>{resource.date}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                      <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                        <BookOpen size={10} /> Content
                      </h4>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(resource.content);
                          showToast("내용이 복사되었습니다!");
                        }}
                        className="text-[10px] bg-white/5 hover:bg-white/10 text-white/50 hover:text-white px-2 py-0.5 rounded border border-white/10 transition-colors"
                      >
                        복사
                      </button>
                    </div>
                    <div className="relative max-h-[120px] overflow-hidden text-left">
                       <div className="prose prose-invert prose-purple max-w-none text-sm
                          prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
                          prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-2
                          prose-strong:text-white prose-strong:font-bold
                          prose-ul:list-disc prose-ul:pl-4
                        ">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {resource.content}
                        </ReactMarkdown>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#0a0a0a]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <main className="min-h-screen p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto overflow-x-hidden">

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewState}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {viewState === "home" && renderHomeView()}
          {viewState === "auth" && renderAuthView()}
          {viewState === "dashboard" && renderDashboardView()}
        </motion.div>
      </AnimatePresence>

      {/* Input Form Modal (Logs) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-2xl font-semibold text-white">{editMode ? "실습 기록 수정" : "새 실습 활동 기록"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar">
                <form id="record-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm text-blue-200 flex items-center gap-2">
                    <Users size={16} /> <strong>{userName}</strong>님으로 작성 진행 중
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-white/70 flex items-center gap-1 text-left">실습 날짜 (Date)</label>
                      <div className="relative group">
                        <input
                          id="practice-date-input"
                          type="date" required
                          value={formData.week} onChange={e => setFormData({ ...formData, week: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pr-10 text-white focus:ring-2 focus:ring-blue-500 outline-none hover:border-white/20 transition-colors [&::-webkit-calendar-picker-indicator]:hidden"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const dateInput = document.getElementById('practice-date-input') as HTMLInputElement;
                            if (dateInput && 'showPicker' in HTMLInputElement.prototype) {
                              dateInput.showPicker();
                            }
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
                        >
                          <Calendar size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-1">실습 만족도 (Score: 1-5)</label>
                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star} type="button"
                          onClick={() => setFormData({ ...formData, score: star.toString() })}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${Number(formData.score) >= star ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : "text-white/30 hover:text-white/50"}`}
                        >
                          {star}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/10 text-left">
                    <label className="text-sm font-medium text-white/70 flex items-center gap-1">사용한 프롬프트 <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 uppercase">Markdown</span></label>
                    <textarea
                      required placeholder="이번 실습에 사용한 핵심 프롬프트를 적어주세요. 마크다운 형식을 지원합니다." rows={4}
                      value={formData.prompt} onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-white/20 resize-none font-mono text-sm leading-relaxed custom-scrollbar"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium text-white/70">결과물 이미지/영상 링크 URL</label>
                    <input
                      type="url" placeholder="https://..."
                      value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-white/20 transition-colors"
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium text-white/70 flex justify-between items-center">
                      <span>실습 내용 및 결과 요약</span>
                      <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/40 uppercase">Markdown</span>
                    </label>
                    <textarea
                      required placeholder="이번 주 배운 내용과 결과를 통해 얻은 점을 생생하게 설명해주세요. 마크다운을 지원하며 목록 카드에 요약되어 표시됩니다." rows={4}
                      value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-white/20 resize-none custom-scrollbar"
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                <button
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit" form="record-form" disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {editMode ? "수정 완료" : "기록 저장"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resource Modal removed - Managed in /admin */}

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={`fixed bottom-8 left-1/2 z-[60] px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl backdrop-blur-md border ${toast.type === "success"
              ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/30"
              : "bg-red-500/20 text-red-100 border-red-500/30"
              }`}
          >
            {toast.type === "success" ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center">
                <X className="w-4 h-4 text-red-300" />
              </div>
            )}
            <span className="font-medium text-sm md:text-base whitespace-nowrap">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail View Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="glass-panel w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border-white/10"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${'title' in selectedEntry ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                    {'title' in selectedEntry ? <BookOpen size={20} /> : <MessageSquare size={20} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {'title' in selectedEntry ? selectedEntry.title : `${selectedEntry.author}님의 실습 기록`}
                    </h2>
                    <p className="text-xs text-white/40 mt-1">
                      {selectedEntry.date} • {selectedEntry.author}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsDetailModalOpen(false)} className="text-white/30 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 bg-black/20">
                {'prompt' in selectedEntry && (
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 text-left">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">실습 만족도 (Score)</p>
                      <p className="text-amber-400 font-bold flex items-center gap-1">
                        {selectedEntry.score || "5"} / 5
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                    {'content' in selectedEntry ? "내용" : "사용된 프롬프트"}
                  </h3>
                  <div className="glass-panel p-6 rounded-2xl bg-white/[0.02] border-white/5 prose prose-invert prose-blue max-w-none prose-pre:bg-black/50 prose-pre:border-white/10 text-sm md:text-base">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {'prompt' in selectedEntry ? selectedEntry.prompt : selectedEntry.content}
                    </ReactMarkdown>
                  </div>
                  {'prompt' in selectedEntry && (
                     <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedEntry.prompt);
                          showToast("프롬프트가 복사되었습니다!");
                        }}
                        className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                     >
                       <Share2 size={14} /> 프롬프트 복사하기
                     </button>
                  )}
                </div>

                {'summary' in selectedEntry && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                      실습 요약 및 결과
                    </h3>
                    <div className="glass-panel p-6 rounded-2xl bg-white/[0.02] border-white/5 prose prose-invert prose-blue max-w-none prose-pre:bg-black/50 prose-pre:border-white/10 text-sm md:text-base text-left">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedEntry.summary}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                {('link' in selectedEntry) && selectedEntry.link && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
                      결과물 링크
                    </h3>
                    {isImageLink(selectedEntry.link) ? (
                      <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedEntry.link} alt="Detail" className="w-full h-auto object-contain max-h-[500px] bg-black/40" />
                      </div>
                    ) : (
                      <a href={selectedEntry.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-all border border-blue-500/20 group">
                        <ExternalLink size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-medium truncate">{selectedEntry.link}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end gap-3">
                {('prompt' in selectedEntry) && (selectedEntry.author === userName || userRole === "admin") && (
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      openEditModal(selectedEntry as LogEntry)
                    }}
                    className="px-8 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold transition-all border border-blue-500/30"
                  >
                    수정하기
                  </button>
                )}
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 개인정보 관련 모달 */}
      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
        onToggleDoNotShowToday={handleToggleDoNotShowToday} 
      />
      <PrivacyPolicyModal 
        isOpen={isPrivacyPolicyModalOpen} 
        onClose={() => setIsPrivacyPolicyModalOpen(false)} 
      />

      {/* 푸터 상시 노출 */}
      <Footer onShowPolicy={() => setIsPrivacyPolicyModalOpen(true)} />

    </main>
  )
}
