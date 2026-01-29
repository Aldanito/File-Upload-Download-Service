import React from 'react'
import { twMerge } from 'tailwind-merge'

type ButtonVariants = 'primary' | 'default' | 'textButton'
type ButtonSizes = 'xs' | 'sm' | 'base' | 'lg' | 'xl'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & Partial<{
    variant: ButtonVariants
    size: ButtonSizes
    disabled: boolean
    icon: {
        icon: React.ReactNode
        className?: string
        orientation?: 'left' | 'right'
    }
}>

const buttonVariants: Record<ButtonVariants, string> = {
    default: "border-primary text-primary hover:border-primary-hover hover:bg-primary-hover/5",
    primary: "border-primary bg-primary text-light hover:bg-primary-hover",
    textButton: 'border-transparent bg-transparent text-primary',
}

const buttonSizes: Record<ButtonSizes, string> = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'default',
    size = 'base',
    disabled = false,
    className = '',
    icon = undefined,
    ...props
}: ButtonProps) => {
    return (
        <button
            className={
                twMerge(
                    'p-1 py-2 border rounded-lg min-w-fit w-40 transition-colors duration-200',
                    buttonVariants[variant],
                    buttonSizes[size],
                    className
                )}

            disabled={disabled}
            {...props}
        >
            {icon ? (
                <div className='flex gap-2 items-center justify-center'>
                    <div className={twMerge(
                        'h-6',
                        icon.className,
                        icon.orientation === 'left' ? 'order-first' : 'order-last',
                    )}>
                        {icon.icon}
                    </div>
                    {props.children && (
                        <div>
                            {props.children}
                        </div>
                    )}

                </div>
            ) : (
                props.children
            )}
        </button >
    )
}