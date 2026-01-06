'use client'

import { CopybookSettings } from '@/types/copybook'

interface GridCellProps {
  character?: string
  settings: CopybookSettings
  gridTypeOverride?: CopybookSettings['gridType'] | 'pinyin'
  isTrace?: boolean
  className?: string
  style?: React.CSSProperties
  // Border control to avoid double borders
  borderConfig?: {
    top?: boolean
    right?: boolean
    bottom?: boolean
    left?: boolean
  }
}

// Draw grid pattern based on type
function getGridPattern(type: CopybookSettings['gridType'] | 'pinyin', lineColor: string): React.ReactNode {
  const strokeStyle = { stroke: lineColor, strokeWidth: 0.5, strokeDasharray: '4 2' }

  if (type === 'pinyin') {
    return (
      <>
        {/* Four lines for pinyin (四线三格) */}
        <line x1="0" y1="33.3%" x2="100%" y2="33.3%" {...strokeStyle} />
        <line x1="0" y1="66.6%" x2="100%" y2="66.6%" {...strokeStyle} />
      </>
    )
  }

  switch (type) {
    case 'tian':
      return (
        <>
          <line x1="0" y1="50%" x2="100%" y2="50%" {...strokeStyle} />
          <line x1="50%" y1="0" x2="50%" y2="100%" {...strokeStyle} />
        </>
      )
    case 'mi':
      return (
        <>
          <line x1="0" y1="50%" x2="100%" y2="50%" {...strokeStyle} />
          <line x1="50%" y1="0" x2="50%" y2="100%" {...strokeStyle} />
          <line x1="0" y1="0" x2="100%" y2="100%" {...strokeStyle} />
          <line x1="100%" y1="0" x2="0" y2="100%" {...strokeStyle} />
        </>
      )
    case 'hui':
      return <rect x="25%" y="25%" width="50%" height="50%" fill="none" {...strokeStyle} />
    default:
      return null
  }
}

export function GridCell({
  character,
  settings,
  gridTypeOverride,
  isTrace = false,
  className = '',
  style = {},
  borderConfig = { top: true, right: true, bottom: true, left: true }
}: GridCellProps) {
  const { gridType, gridSize, lineColor, fontSize, verticalOffset, traceColor } = settings
  const finalGridType = gridTypeOverride || gridType

  // Calculate cell dimensions
  const cellSize = gridSize * 3.78 // mm to px

  const borderStyles = {
    borderTopWidth: borderConfig.top ? '1px' : '0px',
    borderRightWidth: borderConfig.right ? '1px' : '0px',
    borderBottomWidth: borderConfig.bottom ? '1px' : '0px',
    borderLeftWidth: borderConfig.left ? '1px' : '0px',
    borderColor: '#d1d5db' // gray-300
  }

  return (
    <div
      className={`relative border-solid ${className}`}
      style={{
        width: cellSize,
        height: cellSize,
        ...borderStyles,
        ...style
      }}
    >
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {getGridPattern(finalGridType, lineColor)}
      </svg>

      {/* Character */}
      {character && (
        <div
          className="absolute inset-0 flex items-center justify-center font-kai select-none"
          style={{
            fontSize: `${(cellSize * fontSize) / 100}px`,
            transform: `translateY(${verticalOffset}%)`,
            color: isTrace ? traceColor : settings.highlightFirst ? '#ef4444' : '#1f2937',
            opacity: isTrace ? 0.3 : 1
          }}
        >
          {character}
        </div>
      )}
    </div>
  )
}
