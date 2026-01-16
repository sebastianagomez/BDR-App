import clsx from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    noPadding?: boolean
}

export function Card({ children, className, noPadding = false, ...props }: CardProps) {
    return (
        <div
            className={clsx('bg-white rounded-lg shadow-sm border border-slate-200', className)}
            {...props}
        >
            <div className={clsx(!noPadding && 'p-6')}>
                {children}
            </div>
        </div>
    )
}

export function CardHeader({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={clsx('px-6 py-4 border-b border-slate-100', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode, className?: string }) {
    return <h3 className={clsx('text-lg font-semibold text-slate-900', className)}>{children}</h3>
}
