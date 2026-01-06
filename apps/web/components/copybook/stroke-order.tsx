'use client'

import { useEffect, useRef } from 'react'
import HanziWriter from 'hanzi-writer'

interface StrokeOrderProps {
  char: string
  size?: number
  strokeColor?: string
  className?: string
}

export function StrokeOrder({ char, size = 40, strokeColor = '#ef4444', className = '' }: StrokeOrderProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || !char) return

    // Clear previous content
    containerRef.current.innerHTML = ''

    const renderStrokeOrder = async () => {
      try {
        // Load target data
        const data = (await HanziWriter.loadCharacterData(char)) as any
        if (!data || !data.strokes) return

        const numStrokes = data.strokes.length

        // Render each step
        for (let i = 0; i < Math.min(numStrokes, 12); i++) {
          const stepDiv = document.createElement('div')
          stepDiv.style.width = `${size}px`
          stepDiv.style.height = `${size}px`
          stepDiv.style.display = 'inline-block'
          stepDiv.style.marginRight = '2px'
          containerRef.current?.appendChild(stepDiv)

          const writer = HanziWriter.create(stepDiv, char, {
            width: size,
            height: size,
            padding: 2,
            strokeColor: strokeColor,
            showOutline: true,
            outlineColor: '#f3f4f6',
            showCharacter: false
          })

          // Show strokes up to i statically by using very high speed
          for (let j = 0; j <= i; j++) {
            ;(writer as any).animateStroke(j, { speed: 100000 })
          }
        }
      } catch (err) {
        console.error('Failed to load character data for stroke order:', err)
      }
    }

    renderStrokeOrder()
  }, [char, size, strokeColor])

  return <div ref={containerRef} className={`flex flex-nowrap overflow-hidden ${className}`} />
}
