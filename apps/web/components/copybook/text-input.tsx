'use client'

import { useCopybookStore } from '@/hooks/use-copybook-store'
import { Input } from '@workspace/ui/components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover'
import { ChevronDown } from 'lucide-react'

export function TextInput() {
  const { inputText, setInputText, characters, setPinyin } = useCopybookStore()

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-wrap items-start gap-2">
        {/* Character blocks with pinyin selection */}
        {characters.map((char, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {/* Pinyin with dropdown for multi-pronunciation */}
            {char.pinyin.length > 1 ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-sm text-gray-500 hover:text-primary flex items-center gap-0.5 cursor-pointer">
                    {char.selectedPinyin}
                    <ChevronDown className="size-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" align="start">
                  <div className="space-y-1">
                    {char.pinyin.map((py) => (
                      <button
                        key={py}
                        className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-accent ${
                          py === char.selectedPinyin ? 'bg-accent' : ''
                        }`}
                        onClick={() => setPinyin(idx, py)}
                      >
                        {py}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <span className="text-sm text-gray-500">{char.selectedPinyin}</span>
            )}
            {/* Character display */}
            <span className="text-2xl">{char.char}</span>
          </div>
        ))}

        {/* Input field */}
        <Input
          placeholder="输入汉字..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 min-w-40"
        />
      </div>
    </div>
  )
}
