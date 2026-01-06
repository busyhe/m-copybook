'use client'

import { useCopybookStore } from '@/hooks/use-copybook-store'
import { Button } from '@workspace/ui/components/button'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { Slider } from '@workspace/ui/components/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Download, Printer } from 'lucide-react'
import { TextInput } from './text-input'

export function ControlPanel() {
  const { settings, setSettings } = useCopybookStore()

  return (
    <div className="w-80 space-y-4">
      <div className="sticky top-20 space-y-4 max-h-[calc(100vh-120px)] overflow-auto pb-10 no-scrollbar">
        {/* Export/Print buttons */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex gap-2">
          <Button variant="outline" className="flex-1 gap-2 h-9">
            <Download className="size-4" />
            导出
          </Button>
          <Button className="flex-1 gap-2 h-9 bg-[#1e293b] hover:bg-[#1e293b]/90 text-white">
            <Printer className="size-4" />
            打印
          </Button>
        </div>

        {/* Text Input area in Sidebar */}
        <TextInput />

        {/* Settings Groups */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Display Controls */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">显示控制</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="showStroke">显示笔顺</Label>
              <Switch
                id="showStroke"
                checked={settings.showStroke}
                onCheckedChange={(checked) => setSettings({ showStroke: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showPinyin">显示拼音</Label>
              <Switch
                id="showPinyin"
                checked={settings.showPinyin}
                onCheckedChange={(checked) => setSettings({ showPinyin: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="highlightFirst">首字高亮</Label>
              <Switch
                id="highlightFirst"
                checked={settings.highlightFirst}
                onCheckedChange={(checked) => setSettings({ highlightFirst: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="insertEmptyRow">插入空行</Label>
              <Switch
                id="insertEmptyRow"
                checked={settings.insertEmptyRow}
                onCheckedChange={(checked) => setSettings({ insertEmptyRow: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="insertEmptyCol">插入空列</Label>
              <Switch
                id="insertEmptyCol"
                checked={settings.insertEmptyCol}
                onCheckedChange={(checked) => setSettings({ insertEmptyCol: checked })}
              />
            </div>
          </div>

          {/* Grid Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">方格类型</h3>

            <div className="flex items-center justify-between">
              <Label>方格类型</Label>
              <Select
                value={settings.gridType}
                onValueChange={(value) => setSettings({ gridType: value as typeof settings.gridType })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tian">田字格</SelectItem>
                  <SelectItem value="mi">米字格</SelectItem>
                  <SelectItem value="hui">回宫格</SelectItem>
                  <SelectItem value="none">无</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>方格大小</Label>
                <span className="text-sm text-muted-foreground">{settings.gridSize}mm</span>
              </div>
              <Slider
                value={[settings.gridSize]}
                onValueChange={([value]) => setSettings({ gridSize: value })}
                min={10}
                max={30}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>行间距</Label>
                <span className="text-sm text-muted-foreground">{settings.rowSpacing}mm</span>
              </div>
              <Slider
                value={[settings.rowSpacing]}
                onValueChange={([value]) => setSettings({ rowSpacing: value })}
                min={0}
                max={10}
                step={1}
              />
            </div>
          </div>

          {/* Font Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">字体</h3>

            <div className="flex items-center justify-between">
              <Label>字体</Label>
              <Select value={settings.fontFamily} onValueChange={(value) => setSettings({ fontFamily: value })}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="楷体">楷体</SelectItem>
                  <SelectItem value="宋体">宋体</SelectItem>
                  <SelectItem value="黑体">黑体</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>字体粗细</Label>
              <Select
                value={settings.fontWeight}
                onValueChange={(value) => setSettings({ fontWeight: value as typeof settings.fontWeight })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">常规</SelectItem>
                  <SelectItem value="bold">粗体</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>字体大小</Label>
                <span className="text-sm text-muted-foreground">{settings.fontSize}%</span>
              </div>
              <Slider
                value={[settings.fontSize]}
                onValueChange={([value]) => setSettings({ fontSize: value })}
                min={50}
                max={100}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>上下偏移</Label>
                <span className="text-sm text-muted-foreground">{settings.verticalOffset}%</span>
              </div>
              <Slider
                value={[settings.verticalOffset]}
                onValueChange={([value]) => setSettings({ verticalOffset: value })}
                min={-20}
                max={20}
                step={1}
              />
            </div>
          </div>

          {/* Trace Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">描红设置</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>描红数量</Label>
                <span className="text-sm text-muted-foreground">{settings.traceCount}</span>
              </div>
              <Slider
                value={[settings.traceCount]}
                onValueChange={([value]) => setSettings({ traceCount: value })}
                min={0}
                max={10}
                step={1}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>描红颜色</Label>
              <input
                type="color"
                value={settings.traceColor}
                onChange={(e) => setSettings({ traceColor: e.target.value })}
                className="w-8 h-8 border rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>线条颜色</Label>
              <input
                type="color"
                value={settings.lineColor}
                onChange={(e) => setSettings({ lineColor: e.target.value })}
                className="w-8 h-8 border rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
