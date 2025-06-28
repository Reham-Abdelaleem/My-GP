'use client'
import React, { useEffect, useState } from 'react'
import { Switch as OriginalSwitch } from '@headlessui/react'
import classNames from '@/utils/classnames'

type SwitchProps = {
  onChange?: (value: boolean) => void
  size?: 'sm' | 'md' | 'lg' | 'l'
  defaultValue?: boolean
  disabled?: boolean
  className?: string
}

const Switch = ({ onChange, size = 'md', defaultValue = false, disabled = false, className }: SwitchProps) => {
  const [enabled, setEnabled] = useState(defaultValue)
  
  useEffect(() => {
    setEnabled(defaultValue)
  }, [defaultValue])

  const wrapStyle = {
    lg: 'h-8 w-16',
    l: 'h-7 w-14',
    md: 'h-7 w-14',
    sm: 'h-6 w-12',
  }

  const circleStyle = {
    lg: 'h-6 w-6',
    l: 'h-5 w-5',
    md: 'h-5 w-5',
    sm: 'h-4 w-4',
  }

  const translateLeft = {
    lg: 'translate-x-8',
    l: 'translate-x-7',
    md: 'translate-x-7',
    sm: 'translate-x-6',
  }

  const textStyle = {
    lg: 'text-xs font-bold tracking-wide',
    l: 'text-xs font-bold tracking-wide',
    md: 'text-xs font-bold tracking-wide',
    sm: 'text-[10px] font-bold tracking-wide',
  }

  return (
    <OriginalSwitch
      checked={enabled}
      onChange={(checked: boolean) => {
        if (disabled)
          return
        setEnabled(checked)
        onChange?.(checked)
      }}
      className={classNames(
        wrapStyle[size],
        enabled ? 'bg-green-500' : 'bg-red-500',
        'relative inline-flex items-center flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
        disabled ? '!opacity-50 !cursor-not-allowed' : '',
        className,
      )}
    >
      {/* النص داخل الـ Switch - يظهر في الجانب المقابل للدائرة */}
      <span 
        className={classNames(
          textStyle[size],
          enabled 
            ? 'absolute left-1 top-0 bottom-0 flex items-center text-white pointer-events-none select-none uppercase'
            : 'absolute right-1 top-0 bottom-0 flex items-center text-white pointer-events-none select-none uppercase',
        )}
        style={{ letterSpacing: '0.3px' }}
      >
        {enabled ? 'ON' : 'OFF'}
      </span>
      
      {/* الدائرة المتحركة */}
      <span
        aria-hidden="true"
        className={classNames(
          circleStyle[size],
          enabled ? translateLeft[size] : 'translate-x-1',
          'pointer-events-none inline-block transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out z-10',
        )}
      />
    </OriginalSwitch>
  )
}

export default React.memo(Switch)