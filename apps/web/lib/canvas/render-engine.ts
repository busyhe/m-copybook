import { CopybookSettings } from '@/types/copybook'
import HanziWriter from 'hanzi-writer'

export class RenderEngine {
  ctx: CanvasRenderingContext2D | null = null
  settings: CopybookSettings
  width: number = 794 // Default A4 width at 96DPI
  height: number = 1123 // Default A4 height
  dpr: number = 1

  constructor(canvas: HTMLCanvasElement | null, settings: CopybookSettings) {
    this.settings = settings
    this.dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

    // Fixed A4 dimensions at 96 DPI
    this.width = 794
    this.height = 1123

    if (canvas) {
      this.ctx = canvas.getContext('2d')

      // Scale canvas for high DPI
      canvas.width = this.width * this.dpr
      canvas.height = this.height * this.dpr

      this.ctx?.scale(this.dpr, this.dpr)
    }
  }

  updateSettings(settings: CopybookSettings) {
    this.settings = settings
  }

  // Convert mm to pixels based on current canvas width/A4 ratio
  // A4 width is 210mm.
  mmToPx(mm: number): number {
    // We assume the canvas width represents the full page width (210mm)
    // Unless we want to support specific DPI.
    // Let's assume the canvas width maps to 210mm for layout purposes
    const A4_WIDTH_MM = 210
    return (this.width / A4_WIDTH_MM) * mm
  }

  clear() {
    if (!this.ctx) return
    this.ctx.clearRect(0, 0, this.width, this.height)
    // Draw white background
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  drawGrid(
    x: number,
    y: number,
    width: number,
    height: number,
    type: CopybookSettings['gridType'] | 'pinyin' | 'rect'
  ) {
    if (!this.ctx) return
    const { lineColor } = this.settings
    const ctx = this.ctx

    ctx.save()
    ctx.translate(x, y)

    // Draw box border
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, width, height)

    // Draw internal lines
    ctx.beginPath()
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 0.5
    ctx.setLineDash([4, 2]) // dashed

    if (type === 'tian') {
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.moveTo(width / 2, 0)
      ctx.lineTo(width / 2, height)
    } else if (type === 'mi') {
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.moveTo(width / 2, 0)
      ctx.lineTo(width / 2, height)
      ctx.moveTo(0, 0)
      ctx.lineTo(width, height)
      ctx.moveTo(width, 0)
      ctx.lineTo(0, height)
    } else if (type === 'hui') {
      const px = width * 0.25
      const py = height * 0.25
      ctx.rect(px, py, width - px * 2, height - py * 2)
    } else if (type === 'pinyin') {
      const h3 = height / 3
      // Pinyin lines (internal 2 lines)
      ctx.moveTo(0, h3)
      ctx.lineTo(width, h3)
      ctx.moveTo(0, h3 * 2)
      ctx.lineTo(width, h3 * 2)
    }

    ctx.stroke()
    ctx.restore()
  }

  drawText(
    char: string,
    x: number,
    y: number,
    width: number,
    height: number,
    options: {
      color?: string
      fontFamily?: string
      fontSize?: number
      opacity?: number
      fontWeight?: string
      textAlign?: 'left' | 'center' | 'right'
    } = {}
  ) {
    const {
      color = '#000000',
      fontFamily = '楷体, KaiTi, STKaiti',
      fontSize, // If not provided, calculcate from width
      opacity = 1,
      fontWeight = 'normal',
      textAlign = 'center'
    } = options

    if (!this.ctx) return
    const ctx = this.ctx
    ctx.save()
    ctx.translate(x, y)

    // Default Font size based on cell width if not specified
    const finalFontSize = fontSize || width * 0.75

    ctx.font = `${fontWeight} ${finalFontSize}px ${fontFamily}`
    ctx.fillStyle = color
    ctx.globalAlpha = opacity
    ctx.textAlign = textAlign
    ctx.textBaseline = 'middle'

    // Draw in center of the box (depending on alignment)
    let fillX = width / 2
    if (textAlign === 'left') fillX = 0
    if (textAlign === 'right') fillX = width

    ctx.fillText(char, fillX, height / 2)

    ctx.restore()
  }

  drawStroke(strokes: string[], x: number, y: number, width: number, height: number, color: string = '#ef4444') {
    if (!strokes || strokes.length === 0 || !this.ctx) return

    const ctx = this.ctx
    ctx.save()

    // Use HanziWriter's helper to get the correct transform
    // padding: 2 seems appropriate
    const { x: paddingX, y: paddingY, scale } = HanziWriter.getScalingTransform(width, height, 2)

    // transform y = height - paddingY (based on previous testing/docs)
    const translateY = height - paddingY

    ctx.translate(x + paddingX, y + translateY)
    ctx.scale(scale, -scale)

    ctx.fillStyle = color
    strokes.forEach((pathData) => {
      const p = new Path2D(pathData)
      ctx.fill(p)
    })

    ctx.restore()
  }
}
