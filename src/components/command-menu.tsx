'use client'

import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowRight,
  FileText,
  Globe,
  LayoutDashboard,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Laptop,
  Languages,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { useSearch } from '@/context/search-provider'
import { useProcessing } from '@/lib/processing-context'
import { useTheme } from '@/lib/theme-context'
import { useI18n } from '@/lib/i18n-context'

export function CommandMenu() {
  const { open, setOpen } = useSearch()
  const router = useRouter()
  const { setTheme } = useTheme()
  const { setLocale } = useI18n()
  const { setUpgradeOpen } = useProcessing()

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search…' />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading='Navigation'>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <LayoutDashboard />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/history'))}>
            <Activity />
            <span>Applications</span>
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/cv-builder'))}>
            <FileText />
            <span>CV Builder</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings'))}>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading='Actions'>
          <CommandItem onSelect={() => runCommand(() => setUpgradeOpen(true))}>
            <Sparkles />
            <span>Upgrade plan</span>
            <ArrowRight className='ms-auto' />
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
            <Globe />
            <span>Back to landing page</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading='Theme'>
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun />
            <span>Light</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon />
            <span>Dark</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <Laptop />
            <span>System</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading='Language'>
          <CommandItem onSelect={() => runCommand(() => setLocale('id'))}>
            <Languages />
            <span>Bahasa Indonesia</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocale('en'))}>
            <Languages />
            <span>English</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
