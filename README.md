# m-copybook

A modern Chinese calligraphy copybook (字帖) generator built with Next.js 15 and Turborepo. Create custom practice sheets with pinyin, stroke orders, and various grid styles.

[中文文档](./README_zh.md)

## ✨ Features

- ✍️ **Stroke Order Support** - Visualizing character stroke order using `hanzi-writer`.
- 🔤 **Pinyin Integration** - Automatically generate pinyin for Chinese characters using `pinyin-pro`.
- 📏 **Customizable Grids** - Support for various grid types: Tian (田), Mi (米), Hui (回), or none.
- � **Flexible Styling** - Customize font family (Kai, Song, Hei), font size, weight, and colors.
- � **Layout Control** - Adjust grid size, row spacing, and vertical offsets.
- � **Multi-page PDF/PNG Export** - Export your practice sheets to high-quality PDF or PNG files.
- � **Next.js 15 & Turbopack** - Built on the latest Next.js version with ultra-fast development.
- 🏗️ **Turborepo** - High-performance monorepo architecture.

## 🏗️ Project Structure

```
m-copybook/
├── apps/
│   └── web/                 # Next.js main application
│       ├── app/            # App Router pages
│       ├── components/     # Application-level components (Copybook, UI)
│       └── hooks/          # Custom hooks (Zustand store)
├── packages/
│   ├── ui/                 # Shared UI component library
│   ├── eslint-config/      # Shared ESLint configuration
│   └── typescript-config/  # Shared TypeScript configuration
└── ...
```

## 🛠️ Tech Stack

### Frontend & Framework

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Zustand** - State management

### Calligraphy & Linguistics

- **hanzi-writer** - Character stroke order rendering
- **pinyin-pro** - Pinyin generation
- **jspdf** - PDF generation

### Styling

- **Tailwind CSS 4** - Modern CSS framework
- **Radix UI** - Headless components
- **Lucide React** - Icon library

### Development Tools

- **Turborepo** - Monorepo build tool
- **pnpm** - Package manager
- **Lefthook** - Git hooks

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- pnpm >= 10

### Installation

```bash
# Clone the project
git clone <your-repo-url>
cd m-copybook

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Build project
pnpm build
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📋 Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | Start development server |
| `pnpm build`     | Build all packages       |
| `pnpm lint`      | Run ESLint checks        |
| `pnpm typecheck` | TypeScript type checking |

## 📄 License

[MIT License](LICENSE)
