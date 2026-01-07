'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Logo } from '@/components/logo'

export function MainNav() {
  return (
    <div className="mr-4 md:flex items-center gap-4 lg:gap-6">
      <Link href="/" className="mr-4 flex items-center gap-2">
        <Logo className="size-6 rounded-sm" />
        <span className="font-bold">汉字字帖</span>
      </Link>
      {/* <nav className="flex items-center gap-4 text-sm font-medium">
        <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground/80">
          语文·汉字字帖
          <ChevronDown className="size-3" />
        </Link>
        <Link href="/" className="flex items-center gap-1 transition-colors hover:text-foreground/80">
          英文字帖
          <ChevronDown className="size-3" />
        </Link>
        <Link href="/" className="transition-colors hover:text-foreground/80">
          数字字帖
        </Link>
        <Link href="/" className="transition-colors hover:text-foreground/80">
          拼音字帖
        </Link>
        <Link href="/" className="transition-colors hover:text-foreground/80">
          控笔练习
        </Link>
      </nav> */}
    </div>
  )
}
