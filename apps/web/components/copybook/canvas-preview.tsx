'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useCopybookStore } from '@/hooks/use-copybook-store'
import { RenderEngine } from '@/lib/canvas/render-engine'
import HanziWriter from 'hanzi-writer'
import { CharacterData, CopybookSettings } from '@/types/copybook'
import { fontPinyin } from '@/lib/fonts'

interface PageCanvasProps {
  chars: CharacterData[]
  pageNumber: number
  totalPages: number
  settings: CopybookSettings
  strokeDataMap: Record<string, string[]>
}

function PageCanvas({ chars, pageNumber, totalPages, settings, strokeDataMap }: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [engine, setEngine] = useState<RenderEngine | null>(null)

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

    // 2. Draw active characters
    chars.forEach((charData) => {
      let localY = currentY

      if (showStroke) {
        const maxSteps = maxCells * 2
        for (let s = 0; s < maxSteps; s++) {
          const sx = startX + s * strokeHeightPx
          engine.drawGrid(sx, localY, strokeHeightPx, strokeHeightPx, 'rect')
          if (charData.char && strokeDataMap[charData.char]) {
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
          if (charData.selectedPinyin) {
            engine.drawText(charData.selectedPinyin, cx, localY - 2, cellSizePx, pinyinHeightPx, {
              color: isTrace ? '#97A2B6' : '#000000',
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
        if (charData.char) {
          engine.drawText(charData.char, cx, localY, cellSizePx, cellSizePx, {
            color: isTrace ? settings.traceColor : settings.highlightFirst ? '#000000' : settings.traceColor
          })
        }
      }

      currentY += rowUnitHeight
    })

    // 3. Fill remaining rows with empty grids to stay centered
    const rowsToFill = totalPossibleRows - chars.length
    for (let r = 0; r < rowsToFill; r++) {
      let localFillY = currentY

      if (showStroke) {
        const maxSteps = maxCells * 2
        for (let s = 0; s < maxSteps; s++) {
          engine.drawGrid(startX + s * strokeHeightPx, localFillY, strokeHeightPx, strokeHeightPx, 'rect')
        }
        localFillY += strokeHeightPx
      }

      if (showPinyin) {
        for (let i = 0; i < maxCells; i++) {
          engine.drawGrid(startX + i * cellSizePx, localFillY, cellSizePx, pinyinHeightPx, 'pinyin')
        }
        localFillY += pinyinHeightPx
      }

      for (let i = 0; i < maxCells; i++) {
        engine.drawGrid(startX + i * cellSizePx, localFillY, cellSizePx, cellSizePx, settings.gridType)
      }

      currentY += rowUnitHeight
    }

    // Draw Page Number
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
  }, [engine, chars, pageNumber, totalPages, settings, strokeDataMap])

  return (
    <div className="mx-auto bg-white shadow-xl aspect-[210/297] w-full max-w-[794px] relative mb-4 lg:mb-8 last:mb-0 print-page-break">
      <canvas ref={canvasRef} className="copybook-page-canvas block w-full h-auto" width={794} height={1123} />
    </div>
  )
}

export function CopybookPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [strokeDataMap, setStrokeDataMap] = useState<Record<string, string[]>>({})

  const { settings, characters } = useCopybookStore()

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
        {pages.map((pageChars: CharacterData[], idx: number) => (
          <PageCanvas
            key={idx}
            chars={pageChars}
            pageNumber={idx + 1}
            totalPages={pages.length}
            settings={settings}
            strokeDataMap={strokeDataMap}
          />
        ))}
      </div>
    </div>
  )
}
