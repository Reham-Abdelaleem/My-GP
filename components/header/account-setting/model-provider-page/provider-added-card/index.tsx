import type { FC } from 'react'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RiLoader2Line, RiCloseLine } from '@remixicon/react'
import type {
  CustomConfigurationModelFixedFields,
  ModelItem,
  ModelProvider,
} from '../declarations'
import { ConfigurationMethodEnum } from '../declarations'
import {
  DEFAULT_BACKGROUND_COLOR,
  MODEL_PROVIDER_QUOTA_GET_PAID,
  modelTypeFormat,
} from '../utils'
import { Button } from '@/app/components/base/button'
import ProviderIcon from '../provider-icon'
import ModelBadge from '../model-badge'
import CredentialPanel from './credential-panel'
import QuotaPanel from './quota-panel'
import ModelList from './model-list'
import AddModelButton from './add-model-button'
import { ChevronDownDouble } from '@/app/components/base/icons/src/vender/line/arrows'
import { fetchModelProviderModelList } from '@/service/common'
import { useEventEmitterContextContext } from '@/context/event-emitter'
import { IS_CE_EDITION } from '@/config'
import { useAppContext } from '@/context/app-context'

export const UPDATE_MODEL_PROVIDER_CUSTOM_MODEL_LIST = 'UPDATE_MODEL_PROVIDER_CUSTOM_MODEL_LIST'

type ProviderAddedCardProps = {
  provider: ModelProvider
  onOpenModal: (
    configurationMethod: ConfigurationMethodEnum,
    currentCustomConfigurationModelFixedFields?: CustomConfigurationModelFixedFields
  ) => void
}

const ModelListModal: FC<{
  isOpen: boolean
  onClose: () => void
  provider: ModelProvider
  models: ModelItem[]
  onConfig: (fields?: CustomConfigurationModelFixedFields) => void
  onChange: (provider: string) => void
}> = ({ isOpen, onClose, provider, models, onConfig, onChange }) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = scrollContainerRef.current
        
        const hasScrollableContent = scrollHeight > clientHeight
        
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5
        
        setShowScrollIndicator(hasScrollableContent && !isAtBottom)
      }
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer && isOpen) {
      setTimeout(checkScrollable, 100) 
      
      scrollContainer.addEventListener('scroll', checkScrollable, { passive: true })
      window.addEventListener('resize', checkScrollable)
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollable)
        window.removeEventListener('resize', checkScrollable)
      }
    }
  }, [models, isOpen]) 

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div className="modal-container fixed top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[50vh] max-w-4xl max-h-[400px] bg-white rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 overflow-hidden no-scrollbar">
          
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <div className="flex items-center gap-3">
              <ProviderIcon provider={provider} className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {provider.provider} Models
                </h2>
                <p className="text-sm text-gray-500">
                  {models.length} model{models.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <RiCloseLine className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="h-[calc(100%-80px)] overflow-hidden relative">
            <div 
              ref={scrollContainerRef}
              className="h-full px-2 overflow-y-auto no-scrollbar"
            >
              <ModelList
                provider={provider}
                models={models}
                onCollapse={onClose}
                onConfig={onConfig}
                onChange={onChange}
              />
            </div>

            {showScrollIndicator && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                <div className="flex flex-col items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm animate-pulse">
                  <ChevronDownDouble className="w-4 h-4 mb-1 animate-bounce text-white" />
                  <span className="text-xs font-semibold whitespace-nowrap tracking-wide">Scroll for more</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar {
          scrollbar-width: none !important; /* Firefox */
          -ms-overflow-style: none !important; /* Internet Explorer 10+ */
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none !important; /* WebKit */
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
        .no-scrollbar::-webkit-scrollbar-thumb {
          display: none !important;
        }
        .no-scrollbar::-webkit-scrollbar-track {
          display: none !important;
        }
        .modal-container *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .modal-container * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        /* إضافة حماية إضافية لإخفاء أي سكرول بار محتمل */
        *::-webkit-scrollbar {
          width: 0px !important;
          background: transparent !important;
        }
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>
    </>
  )
}

const ProviderAddedCard: FC<ProviderAddedCardProps> = ({
  provider,
  onOpenModal,
}) => {
  const { t } = useTranslation()
  const { eventEmitter } = useEventEmitterContextContext()
  const [fetched, setFetched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modelList, setModelList] = useState<ModelItem[]>([])
  const [showModelModal, setShowModelModal] = useState(false) // حالة النافذة المنبثقة
  
  const configurationMethods = provider.configurate_methods.filter(method => method !== ConfigurationMethodEnum.fetchFromRemote)
  const systemConfig = provider.system_configuration
  const hasModelList = fetched && !!modelList.length
  const { isCurrentWorkspaceManager } = useAppContext()
  const showQuota = systemConfig.enabled && [...MODEL_PROVIDER_QUOTA_GET_PAID].includes(provider.provider) && !IS_CE_EDITION

  const getModelList = async (providerName: string) => {
    if (loading) return
    try {
      setLoading(true)
      const modelsData = await fetchModelProviderModelList(`/workspaces/current/model-providers/${providerName}/models`)
      setModelList(modelsData.data)
      setFetched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModelList = async () => {
    if (!fetched) {
      await getModelList(provider.provider)
    }
    setShowModelModal(true) 
  }

  eventEmitter?.useSubscription((v: any) => {
    if (v?.type === UPDATE_MODEL_PROVIDER_CUSTOM_MODEL_LIST && v.payload === provider.provider)
      getModelList(v.payload)
  })

  return (
    <>
      <div
        className="group relative flex flex-col px-4 py-3 h-[240px] border-[0.5px] border-black/5 rounded-xl shadow-xs hover:shadow-lg mb-2"
        style={{ background: '#FFFFFF' }}
      >
        <div className="grow h-0">
          <div className="flex items-center justify-between py-0.5">
            <ProviderIcon provider={provider} />
            
            {/* Status indicator */}
            {configurationMethods.includes(ConfigurationMethodEnum.predefinedModel) && (
              <span className='px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md border border-green-200'>
                Configured
              </span>
            )}
            
            {showQuota && <QuotaPanel provider={provider} />}
          </div>

          <div className="mt-2 flex flex-wrap gap-0.5">
            {provider.supported_model_types.map(modelType => (
              <ModelBadge key={modelType}>
                {modelTypeFormat(modelType)}
              </ModelBadge>
            ))}
          </div>

          <div className="my-2 border-t border-gray-200"></div>
        </div>

        <div className="shrink-0">
          <div className="grid grid-cols-2 gap-1">

            {configurationMethods.includes(ConfigurationMethodEnum.predefinedModel) && isCurrentWorkspaceManager && (
              <Button
                variant='secondary'
                className='h-7 text-xs'
                onClick={() => onOpenModal(ConfigurationMethodEnum.predefinedModel)}
              >
                Setup Model
              </Button>
            )}

            <Button
              variant='primary'
              className='h-7 text-xs'
              onClick={handleOpenModelList}
            >
              {
                hasModelList
                  ? t('common.modelProvider.showModelsNum', { num: modelList.length })
                  : t('common.modelProvider.showModels')
              }
              {
                loading && (
                  <RiLoader2Line className='ml-1 animate-spin w-3 h-3' />
                )
              }
            </Button>

            {configurationMethods.includes(ConfigurationMethodEnum.customizableModel) && isCurrentWorkspaceManager && (
              <AddModelButton
                onClick={() => onOpenModal(ConfigurationMethodEnum.customizableModel)}
                className="text-primary-600 h-7 text-xs"
              />
            )}
          </div>
        </div>
      </div>

      <ModelListModal
        isOpen={showModelModal}
        onClose={() => setShowModelModal(false)}
        provider={provider}
        models={modelList}
        onConfig={(currentCustomConfigurationModelFixedFields) =>
          onOpenModal(ConfigurationMethodEnum.customizableModel, currentCustomConfigurationModelFixedFields)
        }
        onChange={(provider: string) => getModelList(provider)}
      />
    </>
  )
}

export default ProviderAddedCard