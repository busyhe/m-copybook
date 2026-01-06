'use client'

import { useCopybookStore } from '@/hooks/use-copybook-store'
import { CopybookSettings, CharacterData } from '@/types/copybook'
import { GridCell } from './grid-cell'
import { StrokeOrder } from './stroke-order'

function CharacterBlock({
  char,
  settings,
  isFirstChar
}: {
  char: CharacterData
  settings: CopybookSettings
  isFirstChar: boolean
}) {
  const { traceCount, insertEmptyCol, rowSpacing, showPinyin, showStroke, gridSize } = settings

  // Cells per row logic
  const mainCells = []

  // 1. Character itself
  mainCells.push({ char: char.char, isTrace: false, isFirst: isFirstChar })

  // 2. Traces
  for (let i = 0; i < traceCount; i++) {
    mainCells.push({ char: char.char, isTrace: true, isFirst: false })
  }

  // 3. Empty col if enabled
  if (insertEmptyCol) {
    mainCells.push({ char: undefined, isTrace: false, isFirst: false })
  }

  // 4. Fill to 8 cells
  while (mainCells.length < 8) {
    mainCells.push({ char: undefined, isTrace: false, isFirst: false })
  }

  const cellSize = gridSize * 3.78

  return (
    <div className="flex flex-col mb-6" style={{ marginBottom: rowSpacing * 3.78 }}>
      {/* 1. Stroke Order Row via hanzi-writer */}
      {showStroke && char.char && (
        <div className="flex mb-2 min-h-10">
          <StrokeOrder
            char={char.char}
            size={cellSize * 0.5}
            strokeColor="#ef4444"
            className="border border-gray-100 rounded p-1 bg-slate-50/30"
          />
        </div>
      )}

      {/* 2. Pinyin Row */}
      {showPinyin && (
        <div className="flex">
          {mainCells.map((cell, i) => (
            <div key={`pinyin-${i}`} className="relative flex flex-col items-center">
              <GridCell
                settings={settings}
                gridTypeOverride="pinyin"
                style={{ height: 24, marginLeft: i === 0 ? 0 : -1 }}
                borderConfig={{
                  top: true,
                  bottom: false,
                  left: i === 0,
                  right: true
                }}
              />
              {i === 0 && char.selectedPinyin && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600 font-medium">
                  {char.selectedPinyin}
                </div>
              )}
              {i === 1 && char.selectedPinyin && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300 font-medium font-kai opacity-50">
                  {char.selectedPinyin}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. Main Grid Row */}
      <div className="flex">
        {mainCells.map((cell, i) => (
          <GridCell
            key={`main-${i}`}
            character={cell.char}
            settings={settings}
            gridTypeOverride={settings.gridType}
            isTrace={cell.isTrace}
            style={{ marginLeft: i === 0 ? 0 : -1 }}
            borderConfig={{
              top: !showPinyin,
              bottom: true,
              left: i === 0,
              right: true
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function CopybookPreview() {
  const { settings, characters } = useCopybookStore()

  const renderRows = () => {
    if (characters.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <p className="text-slate-400 text-sm">请在右侧输入框中输入要练习的汉字</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col">
        {characters.map((char, charIdx) => (
          <CharacterBlock key={charIdx} char={char} settings={settings} isFirstChar={charIdx === 0} />
        ))}

        {/* Empty blocks for standard layout if enabled */}
        {settings.insertEmptyRow && characters.length > 0 && (
          <CharacterBlock char={{ char: '', pinyin: [], selectedPinyin: '' }} settings={settings} isFirstChar={false} />
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-100/50 p-10 min-h-0 custom-scrollbar shadow-inner">
      <div
        className="mx-auto bg-white shadow-xl min-h-[1122px] w-[794px]"
        style={{
          padding: `${settings.pageMargin[0]}px ${settings.pageMargin[1]}px ${settings.pageMargin[2]}px ${settings.pageMargin[3]}px`
        }}
      >
        {renderRows()}
      </div>
    </div>
  )
}
