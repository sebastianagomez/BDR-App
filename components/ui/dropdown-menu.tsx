'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
    isOpen: boolean
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}>({
    isOpen: false,
    setIsOpen: () => { },
})

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
            <div className="relative inline-block text-left" ref={dropdownRef}>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

export const DropdownMenuTrigger = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)
    return (
        <button onClick={() => setIsOpen(!isOpen)} className={className}>
            {children}
        </button>
    )
}

export const DropdownMenuContent = ({ children, align = 'end', className }: { children: React.ReactNode, align?: 'start' | 'end', className?: string }) => {
    const { isOpen } = React.useContext(DropdownMenuContext)
    if (!isOpen) return null
    return (
        <div className={cn("absolute z-50 mt-2 w-56 rounded-md border border-slate-200 bg-white shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2", align === 'end' ? 'right-0' : 'left-0', className)}>
            <div className="p-1">{children}</div>
        </div>
    )
}

export const DropdownMenuItem = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
    const { setIsOpen } = React.useContext(DropdownMenuContext)
    return (
        <button
            onClick={(e) => {
                onClick?.()
                setIsOpen(false)
                e.stopPropagation()
            }}
            className={cn("relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)}
        >
            {children}
        </button>
    )
}
