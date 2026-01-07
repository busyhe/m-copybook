'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { pinyin } from 'pinyin-pro'
import { CopybookSettings, CharacterData, defaultSettings } from '@/types/copybook'

interface CopybookStore {
  // State
  settings: CopybookSettings
  characters: CharacterData[]
  inputText: string

  // Actions
  setSettings: (settings: Partial<CopybookSettings>) => void
  setInputText: (text: string) => void
  setPinyin: (charIndex: number, selectedPinyin: string) => void
}

// Parse text to character data with pinyin
function parseText(text: string): CharacterData[] {
  const chars: CharacterData[] = []

  for (const char of text) {
    // Skip non-Chinese characters
    if (!/[\u4e00-\u9fa5]/.test(char)) continue

    // Get all pinyin readings for the character
    const pinyinResult = pinyin(char, {
      toneType: 'symbol',
      multiple: true,
      type: 'array'
    })

    // Parse pinyin array - handle different return formats
    let pinyinList: string[] = []
    if (typeof pinyinResult === 'string') {
      pinyinList = [pinyinResult]
    } else if (Array.isArray(pinyinResult)) {
      pinyinList = pinyinResult.flat()
    }

    // Remove duplicates
    pinyinList = [...new Set(pinyinList)]

    chars.push({
      char,
      pinyin: pinyinList,
      selectedPinyin: pinyinList[0] || ''
    })
  }

  return chars
}

export const useCopybookStore = create<CopybookStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      inputText: '你好世界，我爱中华人民共和国',
      characters: parseText('你好世界，我爱中华人民共和国'),

      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        })),

      setInputText: (text) =>
        set(() => ({
          inputText: text,
          characters: parseText(text)
        })),

      setPinyin: (charIndex, selectedPinyin) =>
        set((state) => ({
          characters: state.characters.map((char, idx) => (idx === charIndex ? { ...char, selectedPinyin } : char))
        }))
    }),
    {
      name: 'm-copybook-storage'
    }
  )
)
