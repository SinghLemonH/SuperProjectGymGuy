import { Button, Input, Modal, Badge, DifficultyBadge, StatsCard, BannerSlider } from './components/ui'
import { useState } from 'react'

export default function App() {
  const [open, setOpen] = useState(false)

  return (
    <div className="p-8 flex flex-col gap-6 max-w-lg">

      <BannerSlider />

      <div className="grid grid-cols-2 gap-3">
        <StatsCard label="BMR" value="1,842" unit="kcal/day" />
        <StatsCard label="Streak" value={12} unit="days" />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button loading>Loading</Button>
      </div>

      <Input label="อีเมล" placeholder="your@email.com" />
      <Input label="มีปัญหา" error="กรุณากรอกข้อมูล" />

      <div className="flex gap-2 flex-wrap">
        <Badge>gray</Badge>
        <DifficultyBadge level={1} />
        <DifficultyBadge level={3} />
        <DifficultyBadge level={5} />
      </div>

      <Button onClick={() => setOpen(true)}>เปิด Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="ทดสอบ Modal"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>ยกเลิก</Button><Button>ตกลง</Button></>}>
        Modal ทำงานได้ปกติ 🎉
      </Modal>

    </div>
  )
}