import type { FC } from 'react'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  CustomConfigurationModelFixedFields,
  ModelItem,
  ModelProvider,
} from '../declarations'
import {
  ConfigurationMethodEnum,
} from '../declarations'
import AddModelButton from './add-model-button'
import ModelGridItem from './model-grid-item'
import { ChevronDownDouble } from '@/app/components/base/icons/src/vender/line/arrows'
import { useModalContextSelector } from '@/context/modal-context'
import { useAppContext } from '@/context/app-context'

type ModelListProps = {
  provider: ModelProvider
  models: ModelItem[]
  onCollapse: () => void
  onConfig: (currentCustomConfigurationModelFixedFields?: CustomConfigurationModelFixedFields) => void
  onChange?: (provider: string) => void
}
const ModelList: FC<ModelListProps> = ({
  provider,
  models,
  onCollapse,
  onConfig,
  onChange,
}) => {
  const { t } = useTranslation()
  const configurativeMethods = provider.configurate_methods.filter(method => method !== ConfigurationMethodEnum.fetchFromRemote)
  const { isCurrentWorkspaceManager } = useAppContext()
  const isConfigurable = configurativeMethods.includes(ConfigurationMethodEnum.customizableModel)

  const setShowModelLoadBalancingModal = useModalContextSelector(state => state.setShowModelLoadBalancingModal)
  const onModifyLoadBalancing = useCallback((model: ModelItem) => {
    setShowModelLoadBalancingModal({
      provider,
      model: model!,
      open: !!model,
      onClose: () => setShowModelLoadBalancingModal(null),
      onSave: onChange,
    })
  }, [onChange, provider, setShowModelLoadBalancingModal])

  return (
    <div className='px-2 pb-2 rounded-b-xl'>
      <div className='py-2 bg-white rounded-lg'>
        <div className='flex items-center justify-between px-3 mb-2'>
          <span className='group shrink-0 flex items-center'>
            <span className='group-hover:hidden pl-1 pr-1.5 h-6 leading-6 text-xs font-medium text-gray-500'>
              {t('common.modelProvider.modelsNum', { num: models.length })}
            </span>
            <span
              className='hidden group-hover:inline-flex items-center pl-1 pr-1.5 h-6 text-xs font-medium text-gray-500 bg-gray-50 cursor-pointer rounded-lg'
              onClick={onCollapse}
            >
              <ChevronDownDouble className='mr-0.5 w-3 h-3 rotate-180' />
              {t('common.modelProvider.collapse')}
            </span>
          </span>
          {
            isConfigurable && isCurrentWorkspaceManager && (
              <div>
                <AddModelButton onClick={() => onConfig()} />
              </div>
            )
          }
        </div>
        
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 px-3'>
          {
            models.map(model => (
              <ModelGridItem
                key={model.model}
                model={model}
                provider={provider}
                isConfigurable={isConfigurable}
                onConfig={onConfig}
                onModifyLoadBalancing={onModifyLoadBalancing}
              />
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default ModelList