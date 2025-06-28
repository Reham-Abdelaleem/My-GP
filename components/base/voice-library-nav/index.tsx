'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import {
  RiMicFill,
  RiMicLine,
} from '@remixicon/react'
import classNames from '@/utils/classnames'

type VoiceLibraryNavProps = {
  className?: string
}

const VoiceLibraryNav = ({
  className,
}: VoiceLibraryNavProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const activated = selectedSegment === 'voice-library'

  return (
    <Link href="/voice-library" className={classNames(
      className, 'group',
      activated && 'bg-white shadow-md',
      activated ? 'text-primary-600' : 'text-gray-500 hover:bg-gray-200',
    )}>
      {
        activated
          ? <RiMicFill className='mr-2 w-4 h-4' />
          : <RiMicLine className='mr-2 w-4 h-4' />
      }
      {t('Voice Library') || 'Voice Library'}
    </Link>
  )
}

export default VoiceLibraryNav
