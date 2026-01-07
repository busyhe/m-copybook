'use client'

import { useRef, useEffect, useState } from 'react'
import { useCopybookStore } from '@/hooks/use-copybook-store'
import { RenderEngine } from '@/lib/canvas/render-engine'
import HanziWriter from 'hanzi-writer'

export function CopybookPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [engine, setEngine] = useState<RenderEngine | null>(null)
  const [strokeDataMap, setStrokeDataMap] = useState<Record<string, string[]>>({})

  const { settings, characters } = useCopybookStore()

  // Initialize engine
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const newEngine = new RenderEngine(canvas, settings)
    setEngine(newEngine)
  }, [settings]) // Re-init if high-level settings change (optional, usually engine handles updateSettings)

  // Load stroke data
  useEffect(() => {
    // Check if we need to load anything
    const needsLoad = characters.some((c) => c.char && !strokeDataMap[c.char])

    if (needsLoad) {
      const fetchStrokes = async () => {
        const charMap: Record<string, string[]> = {}

        // Find chars that strictly need loading
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

  // Re-draw ...

  // Re-draw when settings or characters change
  useEffect(() => {
    if (!engine || !containerRef.current) return

    // Update settings in engine
    engine.updateSettings(settings)

    // A4 dimensions definition
    // const containerWidth = 794
    // const containerHeight = 1123

    engine.clear()

    const { gridSize, rowSpacing, pageMargin, showPinyin, showStroke, insertEmptyRow } = settings

    // Convert margin mm to px
    const mt = engine.mmToPx(pageMargin[0])
    // const mr = engine.mmToPx(pageMargin[1])
    const ml = engine.mmToPx(pageMargin[3])

    const cellSizePx = engine.mmToPx(gridSize)
    const rowSpacingPx = engine.mmToPx(rowSpacing)

    // Calculate dynamic layout
    // A4 width is 210mm. Content width = 210 - marginL - marginR
    const contentWidthMm = 210 - pageMargin[1] - pageMargin[3]
    const contentWidthPx = engine.mmToPx(contentWidthMm)

    // Calculate max cells per row
    const maxCells = Math.floor(contentWidthPx / cellSizePx)

    // Pinyin height
    const pinyinHeightPx = cellSizePx * 0.5

    // Stroke order height
    const strokeHeightPx = cellSizePx * 0.5

    // Draw each character block
    // Drawing cursor
    let currentY = mt
    const startX = ml

    characters.forEach((charData, index) => {
      // Calculate block height
      let blockHeight = cellSizePx // Main grid
      if (showPinyin) blockHeight += pinyinHeightPx
      if (showStroke) blockHeight += strokeHeightPx
      blockHeight += rowSpacingPx

      // Prepare cells row
      const cells: { char?: string; isTrace?: boolean; isFirst?: boolean; isEmpty?: boolean }[] = []

      // 1. Main char
      cells.push({ char: charData.char, isTrace: false, isFirst: true })

      // 2. Traces - Auto fill rest of logic
      const cellsToFill = maxCells - 1
      for (let i = 0; i < cellsToFill; i++) {
        cells.push({ char: charData.char, isTrace: true })
      }

      // Draw Block
      let localY = currentY

      // 1. Draw Stroke Order
      if (showStroke) {
        // Aligned with main cells: 2 stroke steps per cell width
        const maxSteps = maxCells * 2

        for (let s = 0; s < maxSteps; s++) {
          const sx = startX + s * strokeHeightPx

          // Draw rect for stroke box
          engine.drawGrid(sx, localY, strokeHeightPx, strokeHeightPx, 'rect')

          if (charData.char && strokeDataMap[charData.char]) {
            const strokes = strokeDataMap[charData.char]!
            if (s < strokes.length) {
              const preStrokes = strokes.slice(0, s)
              const currentStroke = strokes[s]

              // Gray strokes
              engine.drawStroke(preStrokes, sx, localY, strokeHeightPx, strokeHeightPx, '#9ca3af')
              // Red stroke
              if (currentStroke) {
                engine.drawStroke([currentStroke], sx, localY, strokeHeightPx, strokeHeightPx, '#ef4444')
              }
            }
          }
        }
        localY += strokeHeightPx
      }

      // 2. Draw Pinyin
      if (showPinyin) {
        cells.forEach((cell, i) => {
          const cx = startX + i * cellSizePx

          // Draw Pinyin Grid
          engine.drawGrid(cx, localY, cellSizePx, pinyinHeightPx, 'pinyin')

          // Draw Pinyin Text
          // Show pinyin for main char AND traces (if not empty filler)
          if (cell.char && charData.selectedPinyin && !cell.isEmpty) {
            engine.drawText(charData.selectedPinyin, cx, localY, cellSizePx, pinyinHeightPx, {
              color: cell.isTrace ? '#97A2B6' : '#000000',
              fontSize: cellSizePx * 0.4,
              fontFamily: 'serif'
            })
          }
        })
        localY += pinyinHeightPx
      }

      // 3. Draw Main Grid
      cells.forEach((cell, i) => {
        const cx = startX + i * cellSizePx

        // Grid
        engine.drawGrid(cx, localY, cellSizePx, cellSizePx, settings.gridType)

        // Character
        if (cell.char && !cell.isEmpty) {
          engine.drawText(cell.char, cx, localY, cellSizePx, cellSizePx, {
            color: cell.isTrace ? settings.traceColor : settings.highlightFirst ? '#000000' : settings.traceColor
          })
        }
      })

      // Advance Y
      currentY += blockHeight

      // Draw empty row if needed
      if (insertEmptyRow && index < characters.length - 1) {
        currentY += blockHeight
      }
    })
  }, [settings, characters, engine, strokeDataMap])

  // Wait, RenderEngine needs to support non-square grids for Pinyin if we want it perfect.
  // And drawText needs explicit fontSize vs boxSize.

  return (
    <div className="flex-1 overflow-auto bg-slate-100/50 p-10 min-h-0 custom-scrollbar">
      <div ref={containerRef} className="mx-auto bg-white shadow-xl min-h-[1122px] w-[794px] relative">
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} width={794} height={1123} />
      </div>
    </div>
  )
}
