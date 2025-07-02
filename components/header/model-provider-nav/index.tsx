'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'
import {
  RiSettings4Fill,
  RiSettings4Line,
} from '@remixicon/react'
import classNames from '@/utils/classnames'

type ModelProviderNavProps = {
  className?: string
}

const ModelProviderNav = ({
  className,
}: ModelProviderNavProps) => {
  const { t } = useTranslation()
  const selectedSegment = useSelectedLayoutSegment()
  const activated = selectedSegment === 'model-provider'

  return (
    <Link 
      href="/model-provider" 
      className={classNames(
        className, 
        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
        activated && 'bg-components-main-nav-nav-button-bg-active shadow-md',
        activated 
          ? 'text-components-main-nav-nav-button-text-active' 
          : 'text-components-main-nav-nav-button-text hover:bg-components-main-nav-nav-button-bg-hover',
      )}
    >
      {activated ? (
        <RiSettings4Fill className='mr-2 w-4 h-4' />
      ) : (
        <RiSettings4Line className='mr-2 w-4 h-4' />
      )}
      {t('Model Provider') || 'Model Provider'}
    </Link>
  )
}

export default ModelProviderNav
