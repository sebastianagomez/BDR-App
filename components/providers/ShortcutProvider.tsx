'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShortcutModal } from '@/components/ui/ShortcutModal'

export function ShortcutProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [lastKey, setLastKey] = useState<string | null>(null)
    const [lastKeyTime, setLastKeyTime] = useState<number>(0)
    const router = useRouter()

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            // Ignore if input/textarea is focused
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                document.activeElement?.getAttribute('contenteditable') === 'true'
            ) {
                return
            }

            const now = Date.now()

            // Check for '?' (Shift + /)
            if (e.key === '?') {
                e.preventDefault()
                setIsOpen(prev => !prev)
                return
            }

            // Check for Escape
            if (e.key === 'Escape') {
                if (isOpen) {
                    setIsOpen(false)
                    e.preventDefault()
                }
                return
            }

            // Handle two-key sequences (e.g., 'g' then 't')
            // Reset last key if too much time passed (e.g. 1 second)
            if (lastKey && (now - lastKeyTime > 1000)) {
                setLastKey(null)
            }

            if (e.key === 'g') {
                setLastKey('g')
                setLastKeyTime(now)
                return
            }

            if (lastKey === 'g') {
                if (e.key === 't') {
                    router.push('/tasks')
                    setLastKey(null)
                } else if (e.key === 'c') {
                    router.push('/contacts')
                    setLastKey(null)
                } else if (e.key === 'a') {
                    router.push('/accounts')
                    setLastKey(null)
                } else if (e.key === 'd') {
                    router.push('/')
                    setLastKey(null)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [router, isOpen, lastKey, lastKeyTime])

    return (
        <>
            {children}
            <ShortcutModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
