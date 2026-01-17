'use client'

import { X, Keyboard } from 'lucide-react'

interface ShortcutModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ShortcutModal({ isOpen, onClose }: ShortcutModalProps) {
    if (!isOpen) return null

    const shortcuts = [
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['g', 't'], description: 'Go to Daily Tasks' },
        { keys: ['g', 'c'], description: 'Go to Contacts' },
        { keys: ['g', 'a'], description: 'Go to Accounts' },
        { keys: ['g', 'd'], description: 'Go to Dashboard' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <Keyboard className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-xl font-semibold text-slate-900">Keyboard Shortcuts</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-200/50 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-2">
                    <div className="grid grid-cols-1 divide-y divide-slate-50">
                        {shortcuts.map((shortcut, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors first:rounded-t last:rounded-b">
                                <span className="text-slate-600 font-medium">{shortcut.description}</span>
                                <div className="flex gap-1.5">
                                    {shortcut.keys.map(key => (
                                        <kbd
                                            key={key}
                                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-sm font-semibold text-slate-700 shadow-sm min-w-[2rem] text-center"
                                        >
                                            {key.toUpperCase()}
                                        </kbd>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                        Press <kbd className="font-semibold">ESC</kbd> to close
                    </p>
                </div>
            </div>
        </div>
    )
}
