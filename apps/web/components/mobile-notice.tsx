'use client'

import { Laptop, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function MobileNotice() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if it's mobile width initially and on resize
    const checkMobile = () => {
      setIsVisible(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isVisible) return null

  return (
    <div className="lg:hidden bg-blue-50 border-b border-blue-100 px-4 py-3 relative">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <Laptop className="size-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900">建议使用 PC 电脑端访问</p>
          <p className="text-xs text-blue-700 mt-0.5">电脑端预览和设置体验更佳，支持打印导出 PDF</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-blue-100 rounded-md transition-colors">
          <X className="size-4 text-blue-400" />
        </button>
      </div>
    </div>
  )
}
