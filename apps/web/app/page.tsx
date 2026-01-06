import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CopybookPreview, ControlPanel } from '@/components/copybook'

export default function Page() {
  return (
    <div data-wrapper="" className="border-grid flex flex-1 flex-col min-h-svh bg-slate-50/50">
      <SiteHeader />
      <main className="flex flex-1 flex-col container-wrapper">
        <div className="container py-6 flex gap-6 flex-1 min-h-0">
          {/* Left: Copybook preview */}
          <CopybookPreview />

          {/* Right: Control panel with Input */}
          <ControlPanel />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
