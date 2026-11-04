'use client'

import { RotateCcw, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { useLayout } from '@/context/layout-provider'
import { useTheme, type ThemeMode } from '@/lib/theme-context'
import { cn } from '@/lib/utils'

const themes: { value: ThemeMode; label: string; bg: string }[] = [
  { value: 'light', label: 'Light', bg: 'bg-[#f7f7f5]' },
  { value: 'dark', label: 'Dark', bg: 'bg-[#0a0a0c]' },
  { value: 'system', label: 'System', bg: 'bg-gradient-to-br from-[#f7f7f5] to-[#0a0a0c]' },
]

export function ConfigDrawer() {
  const { themeMode, setTheme } = useTheme()
  const { variant, setVariant, collapsible, setCollapsible, resetLayout } = useLayout()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='size-8' title='Theme settings'>
          <Settings2 className='size-4' />
          <span className='sr-only'>Theme settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className='flex flex-col gap-0 overflow-y-auto sm:max-w-md'>
        <SheetHeader className='text-start'>
          <SheetTitle>Customize dashboard</SheetTitle>
          <SheetDescription>
            Tune the appearance and layout to make the dashboard feel like yours.
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 space-y-6 px-4 pb-4'>
          <section className='space-y-3'>
            <Label className='text-xs uppercase tracking-wide text-muted-foreground'>Theme</Label>
            <RadioGroup
              value={themeMode}
              onValueChange={(value) => setTheme(value as ThemeMode)}
              className='grid grid-cols-3 gap-3'
            >
              {themes.map((t) => (
                <Label
                  key={t.value}
                  htmlFor={`theme-${t.value}`}
                  className={cn(
                    'cursor-pointer rounded-lg border p-2 transition-colors hover:bg-accent',
                    themeMode === t.value && 'border-primary ring-2 ring-primary/20'
                  )}
                >
                  <div className={cn('mb-2 flex h-16 items-end rounded-md border p-2', t.bg)}>
                    <div className='h-1.5 w-8 rounded-full bg-primary' />
                  </div>
                  <div className='flex items-center gap-1.5 text-xs font-medium'>
                    <RadioGroupItem id={`theme-${t.value}`} value={t.value} className='size-3' />
                    {t.label}
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </section>

          <Separator />

          <section className='space-y-3'>
            <Label className='text-xs uppercase tracking-wide text-muted-foreground'>
              Sidebar variant
            </Label>
            <RadioGroup
              value={variant}
              onValueChange={(value) => setVariant(value as typeof variant)}
              className='grid grid-cols-3 gap-3'
            >
              {(['sidebar', 'floating', 'inset'] as const).map((value) => (
                <Label
                  key={value}
                  htmlFor={`variant-${value}`}
                  className={cn(
                    'cursor-pointer rounded-lg border p-2 capitalize transition-colors hover:bg-accent',
                    variant === value && 'border-primary ring-2 ring-primary/20'
                  )}
                >
                  <div className='mb-2 flex h-12 gap-1 rounded-md border p-1.5'>
                    <div className='w-4 rounded-sm bg-muted-foreground/30' />
                    <div className='flex-1 rounded-sm bg-muted/60' />
                  </div>
                  <div className='flex items-center gap-1.5 text-xs font-medium'>
                    <RadioGroupItem id={`variant-${value}`} value={value} className='size-3' />
                    {value}
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </section>

          <section className='space-y-3'>
            <Label className='text-xs uppercase tracking-wide text-muted-foreground'>
              Sidebar behavior
            </Label>
            <RadioGroup
              value={collapsible}
              onValueChange={(value) => setCollapsible(value as typeof collapsible)}
              className='space-y-2'
            >
              {[
                { value: 'icon', label: 'Collapse to icons', desc: 'Keep navigation visible as icons.' },
                { value: 'offcanvas', label: 'Off-canvas', desc: 'Slide the sidebar fully away.' },
                { value: 'none', label: 'Always expanded', desc: 'Never collapse the sidebar.' },
              ].map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`collapsible-${option.value}`}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent',
                    collapsible === option.value && 'border-primary ring-2 ring-primary/20'
                  )}
                >
                  <RadioGroupItem
                    id={`collapsible-${option.value}`}
                    value={option.value}
                    className='mt-0.5'
                  />
                  <div>
                    <p className='text-sm font-medium'>{option.label}</p>
                    <p className='text-xs text-muted-foreground'>{option.desc}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </section>
        </div>

        <SheetFooter className='border-t pt-4'>
          <Button variant='outline' onClick={resetLayout} className='w-full'>
            <RotateCcw className='size-4' /> Reset layout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
