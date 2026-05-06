interface StatsCardProps {
  label: string
  value: string | number
  unit?: string
}

export default function StatsCard({ label, value, unit }: StatsCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-medium text-gray-900">
        {value}
        {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </p>
    </div>
  )
}
