import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'

export function AppShell() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Navigation */}
      <MobileNav />

      {/* Main App Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
