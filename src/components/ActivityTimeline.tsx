import React from 'react'
import { Camera, GitCompare, Download, Trash, Settings, FileText, Calendar } from 'lucide-react'

interface ActivityItem {
  id: string
  action: string
  details: string | null
  created_at: string
}

interface ActivityTimelineProps {
  logs: ActivityItem[]
}

const ACTION_ICONS: Record<string, any> = {
  'Snapshot Created': Camera,
  'Snapshot Deleted': Trash,
  'Snapshot Renamed': Settings,
  'Comparison Generated': GitCompare,
  'Export Created': Download,
  'Profile Updated': Settings,
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-400 font-sans">
        No recent activities logged yet.
      </div>
    )
  }

  return (
    <div className="relative pl-6 border-l border-white/5 space-y-6 font-sans">
      {logs.map((log) => {
        const Icon = ACTION_ICONS[log.action] || FileText
        const date = new Date(log.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })

        return (
          <div key={log.id} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-[35px] top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-900 border border-white/10 text-gray-400 group-hover:border-indigo-500 group-hover:text-indigo-400 transition-colors">
              <Icon className="h-2.5 w-2.5" />
            </div>

            {/* Content card */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {log.action}
                </h4>
                <span className="flex items-center gap-1 text-2xs text-gray-500 font-sans">
                  <Calendar className="h-3 w-3" />
                  {date}
                </span>
              </div>
              {log.details && (
                <p className="text-xs text-gray-400 font-sans leading-normal">
                  {log.details}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
