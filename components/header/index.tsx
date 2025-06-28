'use client'

import { useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useBoolean } from 'ahooks'
import { useSelectedLayoutSegment } from 'next/navigation'
import { Bars3Icon } from '@heroicons/react/20/solid'
import { useContextSelector } from 'use-context-selector'

import HeaderBillingBtn from '../billing/header-billing-btn'
import AccountDropdown from './account-dropdown'
import AppNav from './app-nav'
import DatasetNav from './dataset-nav'
import EnvNav from './env-nav'
import GithubStar from './github-star'
import LicenseNav from './license-env'
import ModelProviderNav from './model-provider-nav'
import VoiceLibraryNav from './voice-library-nav'

import { WorkspaceProvider } from '@/context/workspace-context'
import AppContext, { useAppContext } from '@/context/app-context'
import LogoSite from '@/app/components/base/logo/logo-site'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import { useProviderContext } from '@/context/provider-context'
import { useModalContext } from '@/context/modal-context'
import { LicenseStatus } from '@/types/feature'

const navClassName = `
  flex items-center relative mr-0 sm:mr-3 px-3 h-8 rounded-xl
  font-medium text-sm
  cursor-pointer
`

const Header = () => {
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator } = useAppContext()
  const systemFeatures = useContextSelector(AppContext, v => v.systemFeatures)
  const selectedSegment = useSelectedLayoutSegment()
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  const [isShowNavMenu, { toggle, setFalse: hideNavMenu }] = useBoolean(false)
  const { enableBilling, plan } = useProviderContext()
  const { setShowPricingModal, setShowAccountSettingModal } = useModalContext()
  const isFreePlan = plan.type === 'sandbox'

  const handlePlanClick = useCallback(() => {
    if (isFreePlan)
      setShowPricingModal()
    else
      setShowAccountSettingModal({ payload: 'billing' })
  }, [isFreePlan, setShowAccountSettingModal, setShowPricingModal])

  useEffect(() => {
    hideNavMenu()
  }, [selectedSegment])

  return (
    <div className='flex flex-1 items-center justify-between px-4'>
      {/* Left section */}
      <div className='flex items-center'>
        {isMobile && (
          <div className='flex items-center justify-center h-8 w-8 cursor-pointer' onClick={toggle}>
            <Bars3Icon className="h-4 w-4 text-gray-500" />
          </div>
        )}
        {!isMobile && (
          <>
            <Link href="/apps" className='flex items-center mr-4'>
              <LogoSite className='object-contain' />
            </Link>
            {systemFeatures.license.status === LicenseStatus.NONE && <GithubStar />}
          </>
        )}
      </div>

      {/* Center section (nav items) */}
      {!isMobile && (
        <div className='flex items-center'>
          {!isCurrentWorkspaceDatasetOperator && <AppNav />}
          {(isCurrentWorkspaceEditor || isCurrentWorkspaceDatasetOperator) && <DatasetNav />}
          {!isCurrentWorkspaceDatasetOperator && <ModelProviderNav className={navClassName} />}
          {!isCurrentWorkspaceDatasetOperator && <VoiceLibraryNav className={navClassName} />}
        </div>
      )}

      {/* Right section */}
      <div className='flex items-center flex-shrink-0'>
        <LicenseNav />
        <EnvNav />
        {enableBilling && (
          <div className='mr-3 select-none'>
            <HeaderBillingBtn onClick={handlePlanClick} />
          </div>
        )}
        <WorkspaceProvider>
          <AccountDropdown isMobile={isMobile} />
        </WorkspaceProvider>
      </div>

      {/* Mobile menu */}
      {isMobile && isShowNavMenu && (
        <div className='w-full flex flex-col p-2 gap-y-1'>
          {!isCurrentWorkspaceDatasetOperator && <AppNav />}
          {(isCurrentWorkspaceEditor || isCurrentWorkspaceDatasetOperator) && <DatasetNav />}
          {!isCurrentWorkspaceDatasetOperator && <ModelProviderNav className={navClassName} />}
          {!isCurrentWorkspaceDatasetOperator && <VoiceLibraryNav className={navClassName} />}
        </div>
      )}
    </div>
  )
}

export default Header
