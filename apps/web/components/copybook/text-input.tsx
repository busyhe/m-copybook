'use client'
import React from 'react'
import { useCopybookStore } from '@/hooks/use-copybook-store'
import { Textarea } from '@workspace/ui/components/textarea'

export function TextInput() {
  const { inputText, setInputText } = useCopybookStore()

  return (
    <div className="bg-secondary/60 rounded-lg p-4">
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="输入汉字..."
          value={inputText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
          className="flex-1 min-w-40"
        />
      </div>
    </div>
  )
}
