import { useState, useEffect, type ReactNode } from 'react'

interface Slide {
  id: number
  label: string
  labelColor: string
  title: string
  titleColor: string
  desc: string
  descColor: string
  bg: string
  iconBg: string
  icon: ReactNode
}

const SLIDES: Slide[] = [
  {
    id: 1,
    label: 'โปรโมชัน', labelColor: 'text-[#534AB7]',
    title: 'Whey Protein Gold Standard', titleColor: 'text-[#26215C]',
    desc: 'ลด 20% เฉพาะสมาชิก GymGUY', descColor: 'text-[#534AB7]',
    bg: 'bg-[#EEEDFE]', iconBg: 'bg-[#CECBF6]',
    icon: (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="16" width="28" height="10" rx="5" fill="#534AB7"/>
        <rect x="2" y="19" width="5" height="4" rx="2" fill="#7F77DD"/>
        <rect x="33" y="19" width="5" height="4" rx="2" fill="#7F77DD"/>
      </svg>
    ),
  },
  {
    id: 2,
    label: 'ข่าวสาร', labelColor: 'text-[#0F6E56]',
    title: 'Challenge เดือนพฤษภาคม', titleColor: 'text-[#04342C]',
    desc: 'วิ่ง 100km ภายใน 30 วัน รับ badge พิเศษ', descColor: 'text-[#0F6E56]',
    bg: 'bg-[#E1F5EE]', iconBg: 'bg-[#9FE1CB]',
    icon: (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="14" stroke="#0F6E56" strokeWidth="2.5"/>
        <path d="M14 20l5 5 8-8" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 3,
    label: 'สินค้าใหม่', labelColor: 'text-[#854F0B]',
    title: 'Resistance Band Pro Set', titleColor: 'text-[#412402]',
    desc: 'เสริมกล้ามเนื้อ ใช้ได้ทุกระดับ', descColor: 'text-[#854F0B]',
    bg: 'bg-[#FAEEDA]', iconBg: 'bg-[#FAC775]',
    icon: (
      <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
        <path d="M8 20c0-4 2-7 4-7s4 7 8 7 4-7 8-7 4 3 4 7" stroke="#854F0B" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function BannerSlider() {
  const [cur, setCur] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCur(c => (c + 1) % SLIDES.length), 5500)
    return () => clearInterval(t)
  }, [])

  const s = SLIDES[cur]

  return (
    <div className={`relative rounded-xl overflow-hidden mb-4 h-[120px] ${s.bg} transition-colors duration-300`}>
      <div className="flex items-center h-full px-5 gap-4">
        <div className="flex-1">
          <p className={`text-[10px] font-medium uppercase tracking-wider mb-1 ${s.labelColor}`}>{s.label}</p>
          <p className={`text-base font-medium mb-0.5 ${s.titleColor}`}>{s.title}</p>
          <p className={`text-xs ${s.descColor}`}>{s.desc}</p>
        </div>
        <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
          {s.icon}
        </div>
      </div>

      {/* arrows */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1.5">
        {[-1, 1].map((d, i) => (
          <button
            key={i}
            onClick={() => setCur(c => (c + d + SLIDES.length) % SLIDES.length)}
            className="w-6 h-6 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-600 text-xs transition-colors"
          >
            {d === -1 ? '←' : '→'}
          </button>
        ))}
      </div>

      {/* dots */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCur(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === cur ? 'bg-gray-600 w-3' : 'bg-gray-400/50'}`}
          />
        ))}
      </div>
    </div>
  )
}
