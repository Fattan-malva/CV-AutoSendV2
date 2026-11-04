'use client'

import Link from 'next/link'
import { ChevronsUpDown, Plus, Sparkles, Zap } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'

type Workspace = {
  name: string
  plan: string
  logo: string
}

export function TeamSwitcher({
  workspace,
  onUpgrade,
}: {
  workspace: Workspace
  onUpgrade: () => void
}) {
  const { isMobile, state } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg border border-sidebar-border bg-sidebar-accent'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src='/icons.png' alt='Ceefy' className='size-5 object-contain' />
              </div>
              <div className='grid flex-1 text-start text-sm leading-tight'>
                <span className='truncate font-semibold'>{workspace.name}</span>
                <span className='truncate text-xs text-muted-foreground'>
                  {workspace.plan} plan
                </span>
              </div>
              <ChevronsUpDown className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>
              Workspaces
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href='/dashboard' className='gap-2 p-2'>
                <div className='flex size-6 items-center justify-center rounded-sm border'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src='/icons.png' alt='' className='size-4 object-contain' />
                </div>
                <div className='grid flex-1 leading-tight'>
                  <span className='text-sm font-medium'>Ceefy</span>
                  <span className='text-xs text-muted-foreground'>{workspace.plan} plan</span>
                </div>
                <Badge variant='secondary' className='text-[10px]'>
                  Active
                </Badge>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onUpgrade} className='gap-2 p-2'>
              <div className='flex size-6 items-center justify-center rounded-sm border bg-primary/10'>
                <Zap className='size-3.5 text-primary' />
              </div>
              <div className='grid flex-1 leading-tight'>
                <span className='text-sm font-medium'>Upgrade workspace</span>
                <span className='text-xs text-muted-foreground'>More analyses & sends</span>
              </div>
              <DropdownMenuShortcut>⌘U</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem className='gap-2 p-2' disabled>
              <div className='flex size-6 items-center justify-center rounded-sm border'>
                <Plus className='size-3.5' />
              </div>
              <span className='text-sm text-muted-foreground'>New workspace</span>
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className='gap-2 p-2'>
              <Link href='/#pricing'>
                <Sparkles className='size-4' />
                <span className='text-sm'>Compare plans</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {state === 'collapsed' ? null : (
          <div className='mt-2 flex items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-2 text-xs'>
            <span className='size-1.5 rounded-full bg-emerald-500' />
            <span className='text-muted-foreground'>All systems operational</span>
          </div>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
