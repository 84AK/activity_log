"use client"

import { motion } from "framer-motion"
import { ExternalLink, ShieldAlert } from "lucide-react"

type FooterProps = {
  onShowPolicy: () => void
}

export default function Footer({ onShowPolicy }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="w-full mt-12 py-8 border-t border-white/5 bg-black/20 backdrop-blur-md"
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left: Copyright */}
        <div className="text-white/40 text-sm tracking-wide">
          © {currentYear} <span className="text-blue-400 font-semibold">AKLabs</span> • Designed for Excellence
        </div>

        {/* Center/Right: Links */}
        <div className="flex items-center gap-6 text-sm">
          <button
            onClick={onShowPolicy}
            className="flex items-center gap-1 text-white/50 hover:text-white transition-colors cursor-pointer group"
          >
            <ShieldAlert size={14} className="group-hover:text-blue-400 transition-colors" />
            <span>개인정보 처리방침</span>
          </button>
          
          <a
            href="https://litt.ly/aklabs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-white/50 hover:text-white transition-colors group"
          >
            <span>아크랩스 바로가기</span>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-blue-400" />
          </a>
        </div>

      </div>
    </motion.footer>
  )
}
