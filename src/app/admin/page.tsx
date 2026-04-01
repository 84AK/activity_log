'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, LayoutDashboard, BookOpen, MessageSquare, 
  Plus, Search, LogOut, Loader2, Send, X, 
  Trash2, Edit2, BarChart3, Database, Filter,
  ChevronRight, Calendar, Users, Star, ArrowLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Models
type LogEntry = {
  id: string;
  week: string; // Date string (YYYY-MM-DD)
  team: string; // Team description (e.g. "Agency Simulation")
  author: string;
  prompt: string;
  link: string;
  summary: string;
  score: string;
  model: string;
  date: string;
};

type ResourceEntry = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
};

const PROXY_URL = "/api/proxy";

export default function AdminPortal() {
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Dashboard State
  const [activeTab, setActiveTab] = useState<"logs" | "resources">("resources");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [resources, setResources] = useState<ResourceEntry[]>([]);
  const [filterText, setFilterText] = useState("");

  // Modal State
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resourceFormData, setResourceFormData] = useState({
    title: "",
    content: ""
  });

  // Selected Log for detail
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  useEffect(() => {
    setMounted(true);
    // Check session
    const authStatus = sessionStorage.getItem("admin_auth");
    const savedPassword = sessionStorage.getItem("admin_pass");
    if (authStatus === "true" && savedPassword) {
      setIsAuthorized(true);
      setPassword(savedPassword);
      refreshData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setLogs(data.data || []);
      }
      if (res.ok && data.resources) {
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("비밀번호를 입력하세요.");
      return;
    }
    setIsLoggingIn(true);
    setError("");

    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "login", 
          username: "admin", 
          password: password 
        })
      });
      const data = await res.json();
      if (res.ok && data.role === "admin") {
        setIsAuthorized(true);
        sessionStorage.setItem("admin_auth", "true");
        sessionStorage.setItem("admin_pass", password);
        refreshData();
      } else {
        setError(data.message || "권한이 없습니다.");
      }
    } catch (err) {
      setError("서버 응답이 없습니다.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    sessionStorage.removeItem("admin_auth");
    sessionStorage.removeItem("admin_pass");
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("정말 이 자료를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "deleteResource", 
          id, 
          password: password 
        })
      });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      alert("삭제 실패");
    }
  };

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editMode ? "editResource" : "createResource",
          id: editMode ? editId : undefined,
          ...resourceFormData,
          author: "admin",
          password: password
        })
      });
      if (res.ok) {
        setIsResourceModalOpen(false);
        refreshData();
      }
    } catch (err) {
      alert("처리 중 에러 발생");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResourceEditModal = (resource: ResourceEntry) => {
    setEditMode(true);
    setEditId(resource.id);
    setResourceFormData({ title: resource.title, content: resource.content });
    setIsResourceModalOpen(true);
  };

  if (!mounted) return null;

  // Render Login View
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-inter selection:bg-purple-500/30">
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-500/20">
            <Lock className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">관리자 포털</h1>
          <p className="text-white/40 text-sm mb-8">액티비티 로그 통합 관리 및 자료실 제어</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/30 group-focus-within:text-purple-400 transition-colors">
                <Database size={18} />
              </div>
              <input 
                type="password" placeholder="관리자 패스워드"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-white/20"
              />
            </div>
            {error && <p className="text-red-400 text-xs text-left px-2">{error}</p>}
            <button 
              type="submit" disabled={isLoggingIn}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <ChevronRight size={20} />}
              대시보드 입장
            </button>
          </form>

          <a href="/" className="inline-flex items-center gap-2 mt-8 text-white/30 hover:text-white text-sm transition-colors">
            <ArrowLeft size={14} /> 메인 페이지로 돌아가기
          </a>
        </motion.div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-inter selection:bg-purple-500/30">
      
      {/* Sidebar/Navigation */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-black/40 backdrop-blur-md border-b border-white/5 z-40 px-8 flex justify-between items-center overflow-x-hidden">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/10">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight leading-none">ADMIN DASHBOARD</h2>
            <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-semibold italic">AKLABS Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut size={18} /> 로그아웃
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-28 pb-12 px-8 max-w-[1600px] mx-auto min-h-screen">
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Dashboard Header / Stats */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Overview</h1>
                <p className="text-white/40 text-sm">실습 기록 현황 및 자료실 관리</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={refreshData}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors text-xs font-bold"
                >
                  데이터 새로고침
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                  <Users size={20} />
                </div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Total Practice History</p>
                <h3 className="text-3xl font-bold mt-1">{logs.length}</h3>
              </div>
              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl">
                <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                  <Database size={20} />
                </div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Total Shared Resources</p>
                <h3 className="text-3xl font-bold mt-1">{resources.length}</h3>
              </div>
              <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl">
                <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
                  <Star size={20} />
                </div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Average Activity Score</p>
                <h3 className="text-3xl font-bold mt-1">
                  {(logs.reduce((acc, log) => acc + Number(log.score || 0), 0) / (logs.length || 1)).toFixed(1)} / 5
                </h3>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10 p-8 rounded-[32px] overflow-hidden relative group h-full">
             <div className="relative z-10">
               <h3 className="text-xl font-bold mb-4">관리자 안내사항</h3>
               <p className="text-white/60 text-sm leading-relaxed mb-6">
                 이 공간에서는 실습 자료를 등록하고 학생들의 활동 내역을 전역적으로 관리할 수 있습니다. 마크다운 형식을 적극 활용하여 자료의 가독성을 높여주세요.
               </p>
               <div className="space-y-3">
                 <div className="flex items-center gap-3 text-xs text-white/50 bg-black/40 px-4 py-3 rounded-2xl border border-white/5">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   실습 요약은 마크다운을 지원합니다.
                 </div>
                 <div className="flex items-center gap-3 text-xs text-white/50 bg-black/40 px-4 py-3 rounded-2xl border border-white/5">
                   <div className="w-2 h-2 rounded-full bg-blue-500" />
                   자료실 삭제는 복구가 불가능합니다.
                 </div>
               </div>
             </div>
             <BarChart3 className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 opacity-40 group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* Tab Selection */}
          <div className="col-span-12 mt-4">
             <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 w-fit">
               <button 
                onClick={() => setActiveTab("resources")}
                className={`px-8 py-3 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${activeTab === "resources" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white/60"}`}
               >
                 <BookOpen size={18} /> 자료실 관리
               </button>
               <button 
                onClick={() => setActiveTab("logs")}
                className={`px-8 py-3 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${activeTab === "logs" ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white/60"}`}
               >
                 <MessageSquare size={18} /> 실습 모니터링
               </button>
             </div>
          </div>

          {/* Main Area based on Tab */}
          <div className="col-span-12">
            <AnimatePresence mode="wait">
              {activeTab === "resources" ? (
                <motion.div 
                  key="res" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input 
                        type="text" placeholder="자료 검색..."
                        value={filterText} onChange={e => setFilterText(e.target.value)}
                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => {
                        setEditMode(false);
                        setResourceFormData({ title: "", content: "" });
                        setIsResourceModalOpen(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-purple-600/20"
                    >
                      <Plus size={20} /> 자료 새로 만들기
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.filter(r => r.title.includes(filterText)).map((res) => (
                      <div key={res.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex flex-col group hover:border-purple-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                           <h4 className="text-xl font-bold text-white leading-tight line-clamp-2">{res.title}</h4>
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => openResourceEditModal(res)} className="p-2 bg-white/10 rounded-lg hover:bg-purple-500 transition-colors">
                               <Edit2 size={14} />
                             </button>
                             <button onClick={() => handleDeleteResource(res.id)} className="p-2 bg-white/10 rounded-lg hover:bg-red-500 transition-colors">
                               <Trash2 size={14} />
                             </button>
                           </div>
                        </div>
                        <div className="flex-1 text-sm text-white/40 line-clamp-4 leading-relaxed mb-6">
                          {res.content}
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-white/5 text-[10px] text-white/30 font-bold tracking-widest uppercase">
                          <span>{res.date}</span>
                          <span>{res.author}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden"
                >
                  <div className="p-6 border-b border-white/5 flex gap-4 overflow-x-auto custom-scrollbar whitespace-nowrap">
                    <button className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs">전체 팀</button>
                    <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-xs text-white/50">최신순</button>
                    <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-xs text-white/50">별점 높은 순</button>
                  </div>
                  <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                          <th className="p-6 font-bold text-white/40 uppercase tracking-widest text-[10px]">날짜</th>
                          <th className="p-6 font-bold text-white/40 uppercase tracking-widest text-[10px]">작성자</th>
                          <th className="p-6 font-bold text-white/40 uppercase tracking-widest text-[10px]">내용 요약</th>
                          <th className="p-6 font-bold text-white/40 uppercase tracking-widest text-[10px]">별점</th>
                          <th className="p-6 font-bold text-white/40 uppercase tracking-widest text-[10px]">관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                            <td className="p-6">
                              <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold border border-blue-500/10 whitespace-nowrap">{log.week}</span>
                            </td>
                            <td className="p-6 font-bold text-white/80">{log.author}</td>
                            <td className="p-6">
                              <p className="line-clamp-1 text-white/50">{log.summary}</p>
                            </td>
                            <td className="p-6">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={10} className={i < Number(log.score || 5) ? "fill-amber-400 text-amber-400" : "text-white/10"} />
                                ))}
                              </div>
                            </td>
                            <td className="p-6">
                               <button 
                                onClick={() => setSelectedLog(log)}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all"
                               >
                                 상세 보기
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Resource Input Modal */}
      <AnimatePresence>
        {isResourceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
             <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden flex flex-col max-h-[90vh]"
             >
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-2xl font-black italic tracking-tighter">RESOURCE MACHINE</h2>
                  <button onClick={() => setIsResourceModalOpen(false)} className="text-white/30 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                   <form id="res-form" onSubmit={handleResourceSubmit} className="space-y-8">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Title</label>
                        <input 
                          type="text" required placeholder="자료 제목"
                          value={resourceFormData.title} onChange={e => setResourceFormData({ ...resourceFormData, title: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-[20px] p-6 text-xl font-bold focus:ring-2 focus:ring-purple-500 outline-none border-dashed transition-all"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1 flex justify-between">
                          <span>Content Object</span>
                          <span className="text-purple-400">Markdown Supported</span>
                        </label>
                        <textarea 
                          required rows={12} placeholder="자료 상세 내용을 적어주세요..."
                          value={resourceFormData.content} onChange={e => setResourceFormData({ ...resourceFormData, content: e.target.value })}
                          className="w-full bg-black/40 border border-white/10 rounded-[32px] p-8 text-white/80 focus:ring-2 focus:ring-purple-500 outline-none resize-none font-mono text-sm leading-relaxed border-dashed transition-all"
                        />
                     </div>
                   </form>
                </div>
                <div className="p-8 border-t border-white/10 bg-black/40 flex justify-end gap-4">
                   <button 
                   type="button" onClick={() => setIsResourceModalOpen(false)}
                   className="px-8 py-3 rounded-2xl text-white/40 font-bold hover:bg-white/5 transition-colors"
                   >
                     취소
                   </button>
                   <button 
                   type="submit" form="res-form" disabled={isSubmitting}
                   className="px-12 py-3 bg-white text-black font-black rounded-2xl hover:bg-purple-50 transition-all flex items-center gap-2"
                   >
                     {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                     {editMode ? "변경 사항 저장" : "새 자료 시스템 업로드"}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div 
             initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
             className="w-full max-w-4xl bg-white/[0.03] border border-white/10 rounded-[40px] overflow-hidden flex flex-col max-h-[90vh]"
            >
               <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center font-bold">
                     {selectedLog.team}
                   </div>
                   <div>
                     <h2 className="text-xl font-bold">{selectedLog.author}님의 실습 기록</h2>
                     <p className="text-[10px] text-white/30 uppercase tracking-widest">{selectedLog.date} • {selectedLog.model || "Unknown Model"}</p>
                   </div>
                 </div>
                 <button onClick={() => setSelectedLog(null)} className="text-white/30 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                   <X size={24} />
                 </button>
               </div>
               <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
                 <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 block">Prompt System</h3>
                   <div className="p-8 rounded-[32px] bg-black/40 border border-white/5 prose prose-invert prose-blue max-w-none prose-pre:bg-black/60 prose-pre:border-white/10 text-sm md:text-base leading-relaxed">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedLog.prompt}
                     </ReactMarkdown>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-4 block">Summary & Insight</h3>
                   <div className="p-8 rounded-[32px] bg-black/40 border border-white/5 prose prose-invert prose-emerald max-w-none text-sm md:text-base leading-relaxed">
                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedLog.summary}
                     </ReactMarkdown>
                   </div>
                 </div>

                 {selectedLog.link && (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-4 block">Link Attachment</h3>
                      <div className="p-2 border border-white/10 rounded-[32px] overflow-hidden">
                        {/* 이미지 형태 링크라면 노출 */}
                        {(selectedLog.link.includes(".png") || selectedLog.link.includes(".jpg") || selectedLog.link.includes(".webp") || selectedLog.link.includes("drive.google.com")) && (
                           <div className="w-full h-auto bg-black/20 rounded-[24px] overflow-hidden">
                             <img src={selectedLog.link} alt="Log Result" className="w-full h-auto object-contain" />
                           </div>
                        )}
                        <a href={selectedLog.link} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-6 text-blue-400 font-bold hover:bg-white/5 transition-colors">
                          <Plus size={20} /> 실습 결과물 원본 경로 접속하기
                        </a>
                      </div>
                    </div>
                 )}
               </div>
               <div className="p-8 border-t border-white/10 bg-black/40 text-center">
                  <button onClick={() => setSelectedLog(null)} className="px-12 py-3 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all">
                    확인 완료 - 닫기
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
