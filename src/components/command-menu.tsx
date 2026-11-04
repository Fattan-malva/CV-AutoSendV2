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
  const { t, setLocale } = useI18n()
  const { setUpgradeOpen } = useProcessing()

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t.command.placeholder} />
      <CommandList>
        <CommandEmpty>{t.command.noResults}</CommandEmpty>
        <CommandGroup heading={t.command.groupNavigation}>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))}>
            <LayoutDashboard />
            <span>{t.command.dashboard}</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/history'))}>
            <Activity />
            <span>{t.command.applications}</span>
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/cv-builder'))}>
            <FileText />
            <span>{t.command.cvBuilder}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings'))}>
            <Settings />
            <span>{t.command.settings}</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t.command.groupActions}>
          <CommandItem onSelect={() => runCommand(() => setUpgradeOpen(true))}>
            <Sparkles />
            <span>{t.command.upgradePlan}</span>
            <ArrowRight className='ms-auto' />
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
            <Globe />
            <span>{t.command.backToLanding}</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t.command.groupTheme}>
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun />
            <span>{t.command.light}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon />
            <span>{t.command.dark}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <Laptop />
            <span>{t.command.system}</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t.command.groupLanguage}>
          <CommandItem onSelect={() => runCommand(() => setLocale('id'))}>
            <Languages />
            <span>{t.command.bahasaIndonesia}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocale('en'))}>
            <Languages />
            <span>{t.command.english}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
