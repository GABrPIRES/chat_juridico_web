// src/app/dashboard/layout.tsx
import { ReactNode } from 'react'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white px-6 py-4 shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Chat Jurídico</h1>
          <nav className="space-x-4">
            nav
          </nav>
        </div>
      </header>

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
