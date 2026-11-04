'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isNavLink, type NavCollapsible, type NavGroup as NavGroupProps, type NavLink } from './types'

export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {title ? <SidebarGroupLabel>{title}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${isNavLink(item) ? item.url : 'group'}`

          if (isNavLink(item)) {
            return <SidebarMenuLink key={key} item={item} pathname={pathname} />
          }

          return (
            <SidebarMenuCollapsible
              key={key}
              item={item}
              pathname={pathname}
              state={state}
              isMobile={isMobile}
            />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function isActivePath(pathname: string, url: string) {
  const path = url.split('#')[0] || '/'
  if (path === '/') return pathname === '/'
  if (path === '/dashboard') return pathname === '/dashboard'
  return pathname === path || pathname.startsWith(`${path}/`)
}

function NavBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Badge className={cn('rounded-full px-1.5 py-0 text-[10px] font-medium', className)}>
      {children}
    </Badge>
  )
}

function SidebarMenuLink({ item, pathname }: { item: NavLink; pathname: string }) {
  const { setOpenMobile } = useSidebar()
  const isActive = isActivePath(pathname, item.url)

  const content = (
    <>
      {item.icon ? <item.icon /> : null}
      <span>{item.title}</span>
      {item.badge ? <NavBadge className='ms-auto'>{item.badge}</NavBadge> : null}
    </>
  )

  if (item.disabled) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton disabled tooltip={item.title}>
          {content}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  if (item.external) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.title}>
          <a href={item.url} target='_blank' rel='noopener noreferrer' onClick={() => setOpenMobile(false)}>
            {content}
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {content}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarMenuCollapsible({
  item,
  pathname,
  state,
  isMobile,
}: {
  item: NavCollapsible
  pathname: string
  state: 'expanded' | 'collapsed'
  isMobile: boolean
}) {
  const { setOpenMobile } = useSidebar()
  const isActive = item.items.some((sub) => isActivePath(pathname, sub.url))

  if (state === 'collapsed' && !isMobile) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={item.title} isActive={isActive}>
              {item.icon ? <item.icon /> : null}
              <span>{item.title}</span>
              <ChevronRight className='ms-auto' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='start' side='right' sideOffset={8} className='min-w-56'>
            <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.items.map((sub) => (
              <DropdownMenuItem key={sub.url} asChild>
                <Link href={sub.url} onClick={() => setOpenMobile(false)}>
                  {sub.icon ? <sub.icon /> : null}
                  {sub.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible asChild defaultOpen={isActive} className='group/collapsible'>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isActive}>
            {item.icon ? <item.icon /> : null}
            <span>{item.title}</span>
            {item.badge ? <NavBadge>{item.badge}</NavBadge> : null}
            <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((sub) => {
              const subActive = isActivePath(pathname, sub.url)
              return (
                <SidebarMenuSubItem key={sub.url}>
                  <SidebarMenuSubButton asChild isActive={subActive}>
                    <Link href={sub.url} onClick={() => setOpenMobile(false)}>
                      {sub.icon ? <sub.icon /> : null}
                      <span>{sub.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
