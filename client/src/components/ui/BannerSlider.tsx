import { useState, useEffect, type ReactNode } from 'react'

interface Slide {
  id: number
  tag: string
  title: string
  desc: string
  bg: string
  tagColor: string
  titleColor: string
  descColor: string
  iconBg: string
  icon: ReactNode
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: 'Promotion',
    title: 'Whey Protein Gold Standard',
    desc: '20% off for GymGUY members this week only',
    bg: 'bg-[#EEEDFE]',
    tagColor: 'text-[#534AB7]',
    titleColor: 'text-[#26215C]',
    descColor: 'text-[#534AB7]',
    iconBg: 'bg-[#CECBF6]',
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="16" width="28" height="10" rx="5" fill="#534AB7"/>
        <rect x="2" y="19" width="5" height="4" rx="2" fill="#7F77DD"/>
        <rect x="33" y="19" width="5" height="4" rx="2" fill="#7F77DD"/>
      </svg>
    ),
  },
  {
    id: 2,
    tag: 'Challenge',
    title: 'May Monthly Challenge',
    desc: 'Run 100km in 30 days and earn an exclusive badge',
    bg: 'bg-[#E1F5EE]',
    tagColor: 'text-[#0F6E56]',
    titleColor: 'text-[#04342C]',
    descColor: 'text-[#0F6E56]',
    iconBg: 'bg-[#9FE1CB]',
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="14" stroke="#0F6E56" strokeWidth="2.5"/>
        <path d="M14 20l5 5 8-8" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 3,
    tag: 'New Product',
    title: 'Resistance Band Pro Set',
    desc: 'Build strength at any level — home or gym',
    bg: 'bg-[#FAEEDA]',
    tagColor: 'text-[#854F0B]',
    titleColor: 'text-[#412402]',
    descColor: 'text-[#854F0B]',
    iconBg: 'bg-[#FAC775]',
    icon: (
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
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
    <div className={`relative rounded-2xl overflow-hidden mb-6 ${s.bg} transition-colors duration-300`}>
      <div className="flex items-center px-6 py-5 gap-5">

        {/* Text */}
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/50 mb-2 ${s.tagColor}`}>
            {s.tag}
          </span>
          <p className={`text-sm font-semibold leading-snug mb-1 truncate ${s.titleColor}`}>
            {s.title}
          </p>
          <p className={`text-xs leading-relaxed line-clamp-2 ${s.descColor}`}>
            {s.desc}
          </p>
        </div>

        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
          {s.icon}
        </div>

      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 pb-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCur(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === cur ? 'w-4 bg-gray-500' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => setCur(c => (c - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-gray-500 text-xs transition-colors"
      >
        ←
      </button>
      <button
        onClick={() => setCur(c => (c + 1) % SLIDES.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/60 hover:bg-white flex items-center justify-center text-gray-500 text-xs transition-colors"
      >
        →
      </button>
    </div>
  )
}