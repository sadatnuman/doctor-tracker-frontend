import { Apple, Baby, Bone, Brain, Droplets, Hand, HeartPulse, Ribbon, ScanLine, Smile, Stethoscope, Wind } from "lucide-react"

const ICONS: Record<string, typeof HeartPulse> = {
  Cardiology: HeartPulse,
  Dermatology: Hand,
  Endocrinology: Droplets,
  Gastroenterology: Apple,
  "General Medicine": Stethoscope,
  Neurology: Brain,
  Oncology: Ribbon,
  Orthopedics: Bone,
  Pediatrics: Baby,
  Psychiatry: Smile,
  Pulmonology: Wind,
  Radiology: ScanLine,
}

export function SpecialtyIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Stethoscope
  return <Icon aria-hidden className={className} />
}
