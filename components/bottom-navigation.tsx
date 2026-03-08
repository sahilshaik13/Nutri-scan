'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Camera, Clock, BookOpen, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/scan', label: 'Scan', icon: Camera },
  { href: '/history', label: 'History', icon: Clock },
  { href: '/insights', label: 'Insights', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
]

export function BottomNavigation() {
  const pathname = usePathname()

  // Don't show nav on auth pages, onboarding, or guest scan
  const hiddenPaths = ['/auth/', '/onboarding', '/guest-scan', '/']
  if (hiddenPaths.some(path => pathname.startsWith(path)) && pathname !== '/dashboard') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
