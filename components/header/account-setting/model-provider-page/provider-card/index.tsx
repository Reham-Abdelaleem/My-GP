import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  ModelProvider,
} from '../declarations'
import { ConfigurationMethodEnum } from '../declarations'
import { modelTypeFormat } from '../utils'
import {
  useLanguage,
} from '../hooks'
import ModelBadge from '../model-badge'
import ProviderIcon from '../provider-icon'
import Button from '@/app/components/base/button'
import { useAppContext } from '@/context/app-context'
import { LinkExternal02 } from '@/app/components/base/icons/src/vender/line/general'

type ProviderCardProps = {
  provider: ModelProvider
  onOpenModal: (configurateMethod: ConfigurationMethodEnum) => void
}

const ProviderCard: FC<ProviderCardProps> = ({
  provider,
  onOpenModal,
}) => {
  const { t } = useTranslation()
  const language = useLanguage()
  const { isCurrentWorkspaceManager } = useAppContext()
  const configurateMethods = provider.configurate_methods.filter(method => method !== ConfigurationMethodEnum.fetchFromRemote)

  // Check if provider is configured - this card is for unconfigured providers
  const isConfigured = false // Always false for ProviderCard as it's for setup

  return (
    <div
      className='group relative flex flex-col px-4 py-3 h-[240px] border-[0.5px] border-black/5 rounded-xl shadow-xs hover:shadow-lg'
      style={{ background: '#FFFFFF' }}
    >
      <div className='grow h-0'>
        <div className='flex items-center justify-between py-0.5'>
          <ProviderIcon provider={provider} />
          
          {/* Status indicator */}
          {!isConfigured && (
            <span className='px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md border border-red-200'>
              Unconfigured
            </span>
          )}
        </div>

        <div className={`mt-2 flex flex-wrap gap-0.5`}>
          {
            provider.supported_model_types.map(modelType => (
              <ModelBadge key={modelType}>
                {modelTypeFormat(modelType)}
              </ModelBadge>
            ))
          }
        </div>

        <div className='my-2 border-t border-gray-200' />

        {
          provider.description && (
            <>
              <div
                className='mb-2 leading-4 text-xs text-black/[48] line-clamp-4'
                title={provider.description[language] || provider.description.en_US}
              >
                {provider.description[language] || provider.description.en_US}
              </div>

              {
                (provider.help && (provider.help.title || provider.help.url))
                  ? (
                    <a
                      href={provider.help?.url?.[language] || provider.help?.url?.en_US}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='mt-1 inline-flex items-center text-xs text-[#5289ff] hover:underline'
                      onClick={e => !provider.help?.url && e.preventDefault()}
                    >
                      {provider.help.title?.[language] || provider.help.url?.[language] || provider.help.title?.en_US || provider.help.url?.en_US}
                      <span className="ml-1 text-base">ⓘ</span>
                    </a>
                  )
                  : null
              }
            </>
          )
        }
      </div>

      <div className='shrink-0'>
        <div className={`grid grid-cols-${configurateMethods.length} gap-1`}>
          {
            configurateMethods.map((method) => {
              if (method === ConfigurationMethodEnum.predefinedModel) {
              return (
                  <Button
                    key={method}
                    className={'h-7 text-xs shrink-0'}
                    onClick={() => onOpenModal(method)}
                    disabled={!isCurrentWorkspaceManager}
                  >
                    <span className='text-xs inline-flex items-center justify-center overflow-ellipsis shrink-0'>{t('Setup Model')}</span>
                  </Button>
                )
              }
                return (
                <Button
                  key={method}
                  variant='primary'
                  className='px-0 h-7 text-xs'
                  onClick={() => onOpenModal(method)}
                  disabled={!isCurrentWorkspaceManager}
                >
                  {t('common.modelProvider.addModel')}
                </Button>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default ProviderCard