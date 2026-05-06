import type { ReactNode } from 'react'

type BadgeVariant = 'purple' | 'teal' | 'amber' | 'coral' | 'gray' | 'green' | 'red'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClass: Record<BadgeVariant, string> = {
  purple: 'bg-[#EEEDFE] text-[#3C3489]',
  teal:   'bg-[#E1F5EE] text-[#085041]',
  amber:  'bg-[#FAEEDA] text-[#633806]',
  coral:  'bg-[#FAECE7] text-[#712B13]',
  gray:   'bg-[#F1EFE8] text-[#444441]',
  green:  'bg-[#EAF3DE] text-[#27500A]',
  red:    'bg-[#FCEBEB] text-[#791F1F]',
}

const DIFFICULTY_COLOR: Record<number, BadgeVariant> = {
  1: 'teal', 2: 'green', 3: 'amber', 4: 'coral', 5: 'red',
}

const GOAL_COLOR: Record<string, BadgeVariant> = {
  weight_loss: 'teal', muscle_gain: 'purple', strength: 'amber',
  endurance: 'green', flexibility: 'coral', general_health: 'gray',
}

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span className={[
      'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium leading-none',
      variantClass[variant], className,
    ].join(' ')}>
      {children}
    </span>
  )
}

export function DifficultyBadge({ level }: { level: number }) {
  return <Badge variant={DIFFICULTY_COLOR[level] ?? 'gray'}>ระดับ {level}</Badge>
}

export function GoalBadge({ goal }: { goal: string }) {
  return <Badge variant={GOAL_COLOR[goal] ?? 'gray'}>{goal.replace(/_/g, ' ')}</Badge>
}

export function StatusBadge({ status }: { status: 'active' | 'done' | 'upcoming' }) {
  const map = {
    active:   { variant: 'teal'  as BadgeVariant, label: 'active' },
    done:     { variant: 'gray'  as BadgeVariant, label: 'done' },
    upcoming: { variant: 'amber' as BadgeVariant, label: 'upcoming' },
  }
  const { variant, label } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

export default Badge
