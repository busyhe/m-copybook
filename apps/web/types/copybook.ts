// Copybook configuration settings
export interface CopybookSettings {
  // Display controls
  showStroke: boolean // Show stroke order
  showPinyin: boolean // Show pinyin
  highlightFirst: boolean // Highlight first character
  insertEmptyRow: boolean // Insert empty row
  insertEmptyCol: boolean // Insert empty column

  // Grid settings
  gridType: 'tian' | 'mi' | 'hui' | 'none' // Tian/Mi/Hui/None
  gridSize: number // Grid size in mm
  rowSpacing: number // Row spacing in mm
  pageMargin: [number, number, number, number] // [top, right, bottom, left] in mm

  // Font settings
  fontFamily: string // Font family
  fontWeight: 'normal' | 'bold' // Font weight
  fontSize: number // Font size percentage (0-100)
  verticalOffset: number // Vertical offset percentage (-100 to 100)

  // Trace settings
  traceCount: number // Number of trace cells
  traceColor: string // Trace color (hex)
  lineColor: string // Grid line color (hex)
}

// Character data with pinyin info
export interface CharacterData {
  char: string
  pinyin: string[] // All possible pinyin readings
  selectedPinyin: string // Currently selected pinyin
}

// Default settings
export const defaultSettings: CopybookSettings = {
  showStroke: true,
  showPinyin: true,
  highlightFirst: true,
  insertEmptyRow: false,
  insertEmptyCol: false,

  gridType: 'tian',
  gridSize: 17,
  rowSpacing: 2,
  pageMargin: [10, 10, 10, 10],

  fontFamily: '楷体',
  fontWeight: 'normal',
  fontSize: 75,
  verticalOffset: 0,

  traceCount: 2,
  traceColor: '#97A3B6',
  lineColor: '#677489'
}
