'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal } from 'lucide-react'

interface DropdownProps {
    onEdit: () => void
    onDelete: () => void
}

export function ActionDropdown({ onEdit, onDelete }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-400 hover:text-[#00A1E0] p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
                <MoreHorizontal className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 focus:outline-none">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                            onClick={() => {
                                onEdit()
                                setIsOpen(false)
                            }}
                            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 w-full text-left"
                            role="menuitem"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => {
                                if (confirm('Are you sure? This action cannot be undone.')) {
                                    onDelete()
                                    setIsOpen(false)
                                }
                            }}
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-900 w-full text-left"
                            role="menuitem"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
