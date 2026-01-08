'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useCopybookStore } from '@/hooks/use-copybook-store'
import { RenderEngine } from '@/lib/canvas/render-engine'
import HanziWriter from 'hanzi-writer'
import { CharacterData, CopybookSettings } from '@/types/copybook'
import { fontPinyin } from '@/lib/fonts'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover'

interface PageCanvasProps {
  chars: CharacterData[]
  pageNumber: number
  totalPages: number
  settings: CopybookSettings
  strokeDataMap: Record<string, string[]>
  charStartIndex: number
  setPinyin: (index: number, pinyin: string) => void
}

function PageCanvas({
  chars,
  pageNumber,
  totalPages,
  settings,
  strokeDataMap,
  charStartIndex,
  setPinyin
}: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [engine, setEngine] = useState<RenderEngine | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // Track container size for overlay positioning
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      setContainerSize({ width: container.clientWidth, height: container.clientHeight })
    }
    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Calculate pinyin cell positions for overlay using useMemo
  const pinyinPositions = useMemo(() => {
    if (!engine || !settings.showPinyin || containerSize.width === 0) {
      return []
    }

    const { gridSize, rowSpacing, pageMargin, showPinyin, showStroke, insertEmptyRow } = settings
    const mt = engine.mmToPx(pageMargin[0])
    const mb = engine.mmToPx(pageMargin[2])
    const ml = engine.mmToPx(pageMargin[3])
    const cellSizePx = engine.mmToPx(gridSize)
    const rowSpacingPx = engine.mmToPx(rowSpacing)
    const contentWidthMm = 210 - pageMargin[1] - pageMargin[3]
    const contentWidthPx = engine.mmToPx(contentWidthMm)
    const maxCells = Math.floor(contentWidthPx / cellSizePx)

    const totalRowWidth = maxCells * cellSizePx
    const hOffset = (contentWidthPx - totalRowWidth) / 2

    const pinyinHeightPx = cellSizePx * 0.5
    const strokeHeightPx = cellSizePx * 0.5

    let blockHeight = cellSizePx
    if (showPinyin) blockHeight += pinyinHeightPx
    if (showStroke) blockHeight += strokeHeightPx
    blockHeight += rowSpacingPx
    const rowUnitHeight = insertEmptyRow ? blockHeight * 2 : blockHeight

    const availableHeightPx = engine.mmToPx(297) - mt - mb
    const totalPossibleRows = Math.floor(availableHeightPx / rowUnitHeight)
    const totalGridHeight = totalPossibleRows * rowUnitHeight
    const vOffset = (availableHeightPx - totalGridHeight) / 2

    const startX = ml + hOffset
    const canvasWidth = engine.mmToPx(210)
    const canvasHeight = engine.mmToPx(297)

    const positions: Array<{
      x: number
      y: number
      width: number
      height: number
      charIndex: number
      pinyinOptions: string[]
      selectedPinyin: string
    }> = []

    chars.forEach((charData, localIdx) => {
      if (charData.pinyin.length <= 1) return

      let localY = mt + vOffset + localIdx * rowUnitHeight
      if (showStroke) localY += strokeHeightPx

      const cx = startX
      const pinyinX = (cx / canvasWidth) * containerSize.width
      const pinyinY = (localY / canvasHeight) * containerSize.height
      const pinyinW = (cellSizePx / canvasWidth) * containerSize.width
      const pinyinH = (pinyinHeightPx / canvasHeight) * containerSize.height

      positions.push({
        x: pinyinX,
        y: pinyinY,
        width: pinyinW,
        height: pinyinH,
        charIndex: charStartIndex + localIdx,
        pinyinOptions: charData.pinyin,
        selectedPinyin: charData.selectedPinyin
      })
    })

    return positions
  }, [engine, chars, settings, charStartIndex, containerSize])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const newEngine = new RenderEngine(canvas, settings)
    setEngine(newEngine)
  }, [settings])

  useEffect(() => {
    if (!engine) return
    engine.updateSettings(settings)
    engine.clear()

    const { gridSize, rowSpacing, pageMargin, showPinyin, showStroke, insertEmptyRow } = settings
    const mt = engine.mmToPx(pageMargin[0])
    const mb = engine.mmToPx(pageMargin[2])
    const ml = engine.mmToPx(pageMargin[3])
    const cellSizePx = engine.mmToPx(gridSize)
    const rowSpacingPx = engine.mmToPx(rowSpacing)
    // Calculate dynamic layout
    const contentWidthMm = 210 - pageMargin[1] - pageMargin[3]
    const contentWidthPx = engine.mmToPx(contentWidthMm)
    const maxCells = Math.floor(contentWidthPx / cellSizePx)

    // Calculate horizontal offset for centering
    const totalRowWidth = maxCells * cellSizePx
    const hOffset = (contentWidthPx - totalRowWidth) / 2

    const pinyinHeightPx = cellSizePx * 0.5
    const strokeHeightPx = cellSizePx * 0.5

    // 1. Calculate row unit height and total rows/offset for centering
    let blockHeight = cellSizePx
    if (showPinyin) blockHeight += pinyinHeightPx
    if (showStroke) blockHeight += strokeHeightPx
    blockHeight += rowSpacingPx
    const rowUnitHeight = insertEmptyRow ? blockHeight * 2 : blockHeight

    const availableHeightPx = engine.mmToPx(297) - mt - mb
    const totalPossibleRows = Math.floor(availableHeightPx / rowUnitHeight)
    const totalGridHeight = totalPossibleRows * rowUnitHeight
    const vOffset = (availableHeightPx - totalGridHeight) / 2

    let currentY = mt + vOffset
    const startX = ml + hOffset

    const drawRow = (y: number, charData?: CharacterData) => {
      let localY = y
      const { insertEmptyCol } = settings

      if (showStroke) {
        const totalStrokeWidth = maxCells * 2 * strokeHeightPx
        engine.drawGrid(startX, localY, totalStrokeWidth, strokeHeightPx, 'rect')

        const maxSteps = maxCells * 2
        for (let s = 0; s < maxSteps; s++) {
          const sx = startX + s * strokeHeightPx
          if (charData?.char && strokeDataMap[charData.char]) {
            const strokes = strokeDataMap[charData.char]
            if (strokes && s < strokes.length) {
              const preStrokes = strokes.slice(0, s)
              const currentStroke = strokes[s]
              engine.drawStroke(preStrokes, sx, localY, strokeHeightPx, strokeHeightPx, '#9ca3af')
              if (currentStroke) {
                engine.drawStroke([currentStroke], sx, localY, strokeHeightPx, strokeHeightPx, '#ef4444')
              }
            }
          }
        }
        localY += strokeHeightPx
      }

      if (showPinyin) {
        for (let i = 0; i < maxCells; i++) {
          const cx = startX + i * cellSizePx
          const isTrace = i > 0 // Main char is 0
          engine.drawGrid(cx, localY, cellSizePx, pinyinHeightPx, 'pinyin')

          const isGap = insertEmptyCol && i > 0 && i % 2 !== 0
          const traceIndex = insertEmptyCol ? Math.ceil(i / 2) : i
          const isWithinTrace = i === 0 || traceIndex <= settings.traceCount

          if (!isGap && isWithinTrace && charData?.selectedPinyin) {
            const pinyinColor = isTrace
              ? settings.traceColor
              : settings.highlightFirst
                ? '#000000'
                : settings.traceColor

            engine.drawText(charData.selectedPinyin, cx, localY - 2, cellSizePx, pinyinHeightPx, {
              color: pinyinColor,
              fontSize: cellSizePx * 0.3,
              fontFamily: fontPinyin.style.fontFamily
            })
          }
        }
        localY += pinyinHeightPx
      }

      for (let i = 0; i < maxCells; i++) {
        const cx = startX + i * cellSizePx
        const isTrace = i > 0
        engine.drawGrid(cx, localY, cellSizePx, cellSizePx, settings.gridType)

        const isGap = insertEmptyCol && i > 0 && i % 2 !== 0
        const traceIndex = insertEmptyCol ? Math.ceil(i / 2) : i
        const isWithinTrace = i === 0 || traceIndex <= settings.traceCount

        if (!isGap && isWithinTrace && charData?.char) {
          const charFontSize = cellSizePx * (settings.fontSize / 100)
          const charYOffset = cellSizePx * (settings.verticalOffset / 100)
          const fontMap: Record<string, string> = {
            楷体: '楷体, KaiTi, STKaiti, serif',
            宋体: '宋体, SimSun, STSong, serif',
            黑体: '黑体, SimHei, STHeiti, sans-serif'
          }

          engine.drawText(charData.char, cx, localY + charYOffset, cellSizePx, cellSizePx, {
            color: isTrace ? settings.traceColor : settings.highlightFirst ? '#000000' : settings.traceColor,
            fontFamily: fontMap[settings.fontFamily] || settings.fontFamily,
            fontWeight: settings.fontWeight,
            fontSize: charFontSize
          })
        }
      }
    }

    // 2. Draw active characters
    chars.forEach((charData) => {
      drawRow(currentY, charData)
      if (insertEmptyRow) {
        drawRow(currentY + blockHeight)
      }
      currentY += rowUnitHeight
    })

    // 3. Fill remaining rows with empty grids to stay centered
    const rowsToFill = totalPossibleRows - chars.length
    for (let r = 0; r < rowsToFill; r++) {
      drawRow(currentY)
      if (insertEmptyRow) {
        drawRow(currentY + blockHeight)
      }
      currentY += rowUnitHeight
    }

    // Draw Page Number
    if (settings.showPageNumber) {
      const pageNumText = `- ${pageNumber} / ${totalPages} -`
      const footerY = engine.mmToPx(297) - mb / 2

      // Center alignment calculation
      const pageWidthPx = engine.mmToPx(210)
      engine.drawText(pageNumText, 0, footerY - 10, pageWidthPx, 20, {
        fontSize: 12,
        color: '#94a3b8',
        fontFamily: 'sans-serif',
        textAlign: 'center'
      })
    }
  }, [engine, chars, pageNumber, totalPages, settings, strokeDataMap])

  return (
    <div
      ref={containerRef}
      className="mx-auto bg-white shadow-xl aspect-[210/297] w-full max-w-[794px] relative mb-4 lg:mb-8 last:mb-0 print-page-break overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="copybook-page-canvas block w-full h-auto"
        style={{ width: '100%', height: 'auto' }}
      />
      {/* Polyphone selection overlay */}
      {pinyinPositions.map((pos) => (
        <Popover key={pos.charIndex}>
          <PopoverTrigger asChild>
            <button
              className="absolute cursor-pointer bg-primary/10 hover:bg-primary/20 border border-transparent hover:border-primary/30 rounded transition-colors"
              style={{
                left: pos.x,
                top: pos.y,
                width: pos.width,
                height: pos.height
              }}
              title="点击选择多音字读音"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1" align="start">
            <div className="space-y-1">
              {pos.pinyinOptions.map((py) => (
                <button
                  key={py}
                  className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-accent ${
                    py === pos.selectedPinyin ? 'bg-accent' : ''
                  }`}
                  onClick={() => setPinyin(pos.charIndex, py)}
                >
                  {py}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  )
}

export function CopybookPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [strokeDataMap, setStrokeDataMap] = useState<Record<string, string[]>>({})

  const { settings, characters, setPinyin } = useCopybookStore()

  // 1. Data Loading
  useEffect(() => {
    const needsLoad = characters.some((c) => c.char && !strokeDataMap[c.char])
    if (needsLoad) {
      const fetchStrokes = async () => {
        const charMap: Record<string, string[]> = {}
        const charsToLoad = characters.filter((c) => c.char && !strokeDataMap[c.char])
        await Promise.all(
          charsToLoad.map(async (charData) => {
            if (!charData.char) return
            try {
              const data = await HanziWriter.loadCharacterData(charData.char)
              if (data && data.strokes) {
                charMap[charData.char] = data.strokes
              }
            } catch (err) {
              console.error('Failed to load character data', err)
            }
          })
        )
        if (Object.keys(charMap).length > 0) {
          setStrokeDataMap((prev) => ({ ...prev, ...charMap }))
        }
      }
      if (settings.showStroke) {
        fetchStrokes()
      }
    }
  }, [characters, settings.showStroke, strokeDataMap])

  // 2. Pagination Logic
  const pages = useMemo(() => {
    if (characters.length === 0) return []

    // Use a temporary engine instance for height calculations with CURRENT settings
    const calcEngine = new RenderEngine(null as unknown as HTMLCanvasElement, settings)

    const pagesList: CharacterData[][] = []
    const { gridSize, rowSpacing, pageMargin, showPinyin, showStroke, insertEmptyRow } = settings
    const mt = calcEngine.mmToPx(pageMargin[0])
    const mb = calcEngine.mmToPx(pageMargin[2])
    const cellSizePx = calcEngine.mmToPx(gridSize)
    const rowSpacingPx = calcEngine.mmToPx(rowSpacing)
    const pinyinHeightPx = cellSizePx * 0.5
    const strokeHeightPx = cellSizePx * 0.5

    const maxPageHeight = calcEngine.mmToPx(297) - mt - mb

    let currentPageChars: CharacterData[] = []
    let currentPageHeight = 0

    characters.forEach((char) => {
      let blockHeight = cellSizePx
      if (showPinyin) blockHeight += pinyinHeightPx
      if (showStroke) blockHeight += strokeHeightPx
      blockHeight += rowSpacingPx

      const totalBlockHeight = insertEmptyRow ? blockHeight * 2 : blockHeight

      if (currentPageHeight + totalBlockHeight > maxPageHeight && currentPageChars.length > 0) {
        pagesList.push(currentPageChars)
        currentPageChars = [char]
        currentPageHeight = totalBlockHeight
      } else {
        currentPageChars.push(char)
        currentPageHeight += totalBlockHeight
      }
    })

    if (currentPageChars.length > 0) {
      pagesList.push(currentPageChars)
    }
    return pagesList
  }, [characters, settings])

  return (
    <div className="flex-1 overflow-auto bg-slate-100/50 p-10 min-h-0 custom-scrollbar preview-container">
      <div ref={containerRef} className="flex flex-col items-center">
        {pages.map((pageChars: CharacterData[], idx: number) => {
          // Calculate the start index for this page
          const charStartIndex = pages.slice(0, idx).reduce((acc, p) => acc + p.length, 0)
          return (
            <PageCanvas
              key={idx}
              chars={pageChars}
              pageNumber={idx + 1}
              totalPages={pages.length}
              settings={settings}
              strokeDataMap={strokeDataMap}
              charStartIndex={charStartIndex}
              setPinyin={setPinyin}
            />
          )
        })}
      </div>
    </div>
  )
}
