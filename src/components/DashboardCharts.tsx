'use client'

import React from 'react'

interface SnapshotData {
  id: string
  name: string
  follower_count: number
  created_at: string
}

interface DashboardChartsProps {
  snapshots: SnapshotData[]
}

export function DashboardCharts({ snapshots }: DashboardChartsProps) {
  // Sort oldest to newest for the chart timeline
  const chronological = [...snapshots].reverse()

  if (chronological.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] rounded-xl border border-white/5 bg-slate-950/20 backdrop-blur-sm p-6 text-center">
        <p className="text-sm text-gray-400 font-sans max-w-sm">
          Not enough data to plot a growth trend. Create at least two snapshots to visualize follower charts.
        </p>
      </div>
    )
  }

  // Chart setup
  const paddingX = 50
  const paddingY = 30
  const width = 600
  const height = 220

  const counts = chronological.map((s) => s.follower_count)
  const minVal = Math.min(...counts)
  const maxVal = Math.max(...counts)
  const valRange = maxVal - minVal || 10 // avoid division by zero

  const points = chronological.map((s, index) => {
    const x = paddingX + (index / (chronological.length - 1)) * (width - paddingX * 2)
    // Invert y so higher values are closer to the top
    const y = height - paddingY - ((s.follower_count - minVal) / valRange) * (height - paddingY * 2)
    return { x, y, name: s.name, count: s.follower_count }
  })

  // Build SVG path strings
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`

  return (
    <div className="w-full overflow-hidden font-sans">
      <div className="relative w-full overflow-x-auto pb-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-[220px]">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="rgba(255, 255, 255, 0.08)"
          />

          {/* Fill Area */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line Path */}
          <path
            d={linePath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point Markers */}
          {points.map((p, i) => (
            <g key={i} className="group/dot cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="6"
                fill="#05070f"
                stroke="#6366f1"
                strokeWidth="2.5"
                className="transition-all hover:r-8"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="12"
                fill="#6366f1"
                fillOpacity="0"
                className="hover:fill-opacity-10 hover:r-14 transition-all"
              />
              {/* Tooltip on marker hover */}
              <title>{`${p.name}: ${p.count.toLocaleString()} followers`}</title>
            </g>
          ))}

          {/* Y Axis Labels (Min / Max) */}
          <text
            x={paddingX - 10}
            y={paddingY + 4}
            fill="#9ca3af"
            fontSize="10"
            textAnchor="end"
            fontWeight="600"
          >
            {maxVal.toLocaleString()}
          </text>
          <text
            x={paddingX - 10}
            y={height - paddingY + 4}
            fill="#9ca3af"
            fontSize="10"
            textAnchor="end"
            fontWeight="600"
          >
            {minVal.toLocaleString()}
          </text>

          {/* X Axis Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 10}
              fill="#6b7280"
              fontSize="9"
              textAnchor="middle"
              className="max-w-[50px] truncate"
            >
              {p.name.length > 8 ? `${p.name.substring(0, 7)}...` : p.name}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}
