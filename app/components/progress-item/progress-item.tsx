import { Progress } from "@/components/ui/progress"

interface ProgressItemProps {
  label: string
  current: number
  target: number
  unit?: string
}

export function ProgressItem({ label, current, target, unit = "" }: ProgressItemProps) {
  const percentage = Math.round((current / target) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {unit}
          {current}/{unit}
          {target}
        </span>
      </div>
      <Progress value={percentage} />
    </div>
  )
}
