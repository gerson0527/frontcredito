interface ActivityItemProps {
    type: "success" | "info" | "warning"
    title: string
    description: string
    time: string
  }
  
  const colorMap = {
    success: "bg-green-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
  }
  
  export function ActivityItem({ type, title, description, time }: ActivityItemProps) {
    return (
      <div className="flex items-center space-x-4">
        <div className={`w-2 h-2 ${colorMap[type]} rounded-full`}></div>
        <div className="flex-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
    )
  }
  