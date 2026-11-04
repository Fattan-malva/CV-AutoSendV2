'use client'

import Link from 'next/link'
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getDisplayNameInitials } from '@/lib/utils'

export function ProfileDropdown({
  user,
  plan,
  onLogout,
  onUpgrade,
}: {
  user: { name: string; email: string; avatar?: string }
  plan: string
  onLogout: () => void
  onUpgrade: () => void
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full p-0'>
          <Avatar className='size-8'>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className='text-xs'>
              {getDisplayNameInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-60' align='end' forceMount>
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='flex items-center gap-2 px-1 py-1.5 text-start text-sm'>
            <Avatar className='size-8'>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className='text-xs'>
                {getDisplayNameInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-start text-sm leading-tight'>
              <span className='truncate font-semibold'>{user.name}</span>
              <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onUpgrade}>
            <Sparkles />
            Upgrade to Pro
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/dashboard/settings'>
              <BadgeCheck />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/dashboard/settings'>
              <CreditCard />
              Billing
              <span className='ms-auto text-[10px] uppercase tracking-wide text-muted-foreground'>
                {plan}
              </span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href='/dashboard/settings'>
              <Bell />
              Notifications
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout} variant='destructive'>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
