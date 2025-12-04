'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Header() {
  const pathname = usePathname()
  
  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Actions', href: '/actions' },
    { name: 'Settings', href: '/settings' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-midnight-indigo/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-electric-teal shadow-[0_0_15px_rgba(0,224,199,0.5)]" />
          <span className="text-xl font-bold tracking-tight text-frost-white">
            ATG <span className="text-electric-teal">Sentinel</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-electric-teal",
                pathname === item.href ? "text-electric-teal" : "text-frost-white/70"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <appkit-button />
        </div>
      </div>
    </header>
  )
}

