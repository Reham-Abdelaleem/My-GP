import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounceFn } from 'ahooks'
import type { CustomConfigurationModelFixedFields, ModelItem, ModelProvider } from '../declarations'
import { ConfigurationMethodEnum, ModelStatusEnum } from '../declarations'
import ModelBadge from '../model-badge'
import ModelIcon from '../model-icon'
import ModelName from '../model-name'
import classNames from '@/utils/classnames'
import Button from '@/app/components/base/button'
import { Balance } from '@/app/components/base/icons/src/vender/line/financeAndECommerce'
import { Settings01 } from '@/app/components/base/icons/src/vender/line/general'
import Switch from '@/app/components/base/switch'
import Tooltip from '@/app/components/base/tooltip'
import { useProviderContext, useProviderContextSelector } from '@/context/provider-context'
import { disableModel, enableModel } from '@/service/common'
import { Plan } from '@/app/components/billing/type'
import { useAppContext } from '@/context/app-context'

export type ModelGridItemProps = {
  model: ModelItem
  provider: ModelProvider
  isConfigurable: boolean
  onConfig: (currentCustomConfigurationModelFixedFields?: CustomConfigurationModelFixedFields) => void
  onModifyLoadBalancing: (model: ModelItem) => void
}

const ModelGridItem = ({ model, provider, isConfigurable, onConfig, onModifyLoadBalancing }: ModelGridItemProps) => {
  const { t } = useTranslation()
  const { plan } = useProviderContext()
  const modelLoadBalancingEnabled = useProviderContextSelector(state => state.modelLoadBalancingEnabled)
  const { isCurrentWorkspaceManager } = useAppContext()

  const toggleModelEnablingStatus = useCallback(async (enabled: boolean) => {
    try {
      if (enabled)
        await enableModel(`/workspaces/current/model-providers/${provider.provider}/models/enable`, { model: model.model, model_type: model.model_type })
      else
        await disableModel(`/workspaces/current/model-providers/${provider.provider}/models/disable`, { model: model.model, model_type: model.model_type })
    } catch (error) {
      console.error('Error toggling model status:', error)
    }
  }, [model.model, model.model_type, provider.provider])

  const { run: debouncedToggleModelEnablingStatus } = useDebounceFn(toggleModelEnablingStatus, { wait: 500 })

  const onEnablingStateChange = useCallback(async (value: boolean) => {
    debouncedToggleModelEnablingStatus(value)
  }, [debouncedToggleModelEnablingStatus])

  const showConfigButton = model.fetch_from === ConfigurationMethodEnum.customizableModel && isCurrentWorkspaceManager;
  const showLoadBalancingButton = isCurrentWorkspaceManager && 
    (modelLoadBalancingEnabled || plan.type === Plan.sandbox) && 
    !model.deprecated && 
    [ModelStatusEnum.active, ModelStatusEnum.disabled].includes(model.status);
  
  const switchComponent = model.deprecated ? (
    <Tooltip
      popupContent={
        <span className='font-semibold'>{t('common.modelProvider.modelHasBeenDeprecated')}</span>} 
      offset={{ mainAxis: 4 }}
      needsDelay
    >
      <Switch defaultValue={false} disabled size='md' />
    </Tooltip>
  ) : (isCurrentWorkspaceManager && (
    <Switch
      defaultValue={model?.status === ModelStatusEnum.active}
      disabled={![ModelStatusEnum.active, ModelStatusEnum.disabled].includes(model.status)}
      size='md'
      onChange={onEnablingStateChange}
    />
  ));

  return (
    <div
      className={classNames(
        'group flex flex-col border border-gray-100 rounded-lg p-3 hover:shadow-md transition-all duration-200',
        isConfigurable && 'hover:bg-gray-50',
        model.deprecated && 'opacity-60',
      )}
    >
      <div className="flex items-start">
        <div className="flex items-start">
          <ModelIcon
            className='shrink-0 mr-2 mt-0.5'
            provider={provider}
            modelName={model.model}
          />
          <div className="flex flex-col">
            <ModelName
              className='text-sm font-medium text-gray-900'
              modelItem={model}
              showModelType
              showMode
              showContextSize
            >
              {modelLoadBalancingEnabled && !model.deprecated && model.load_balancing_enabled && (
                <ModelBadge className='ml-1 uppercase text-indigo-600 border-indigo-300'>
                  <Balance className='w-3 h-3 mr-0.5' />
                  {t('common.modelProvider.loadBalancingHeadline')}
                </ModelBadge>
              )}
            </ModelName>
          </div>
        </div>
      </div>      
      <div className="flex items-center justify-between mt-3">
        <div>
          {
            showConfigButton
              ? (
                <Button
                  className='h-7'
                  onClick={() => onConfig({ __model_name: model.model, __model_type: model.model_type })}
                >
                  <Settings01 className='mr-[5px] w-3.5 h-3.5' />
                  {t('common.modelProvider.config')}
                </Button>
              )
              : showLoadBalancingButton
                ? (
                  <Button
                    className='h-7'
                    onClick={() => onModifyLoadBalancing(model)}
                  >
                    <Balance className='mr-1 w-[14px] h-[14px]' />
                    {t('common.modelProvider.configLoadBalancing')}
                  </Button>
                )
                : <div className="h-7"></div> 
          }
        </div>
        
        <div>
          {switchComponent}
        </div>
      </div>
    </div>
  )
}

export default memo(ModelGridItem)