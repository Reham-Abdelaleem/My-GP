import { useState } from 'react'
import type { FC } from 'react'
import { ValidatingTip } from '../../key-validator/ValidateStatus'
import type {
  CredentialFormSchema,
  CredentialFormSchemaNumberInput,
  CredentialFormSchemaRadio,
  CredentialFormSchemaSecretInput,
  CredentialFormSchemaSelect,
  FormValue,
} from '../declarations'
import { FormTypeEnum } from '../declarations'
import { useLanguage } from '../hooks'
import Input from './Input'
import cn from '@/utils/classnames'
import Tooltip from '@/app/components/base/tooltip'
import Radio from '@/app/components/base/radio'

type FormProps = {
  className?: string
  itemClassName?: string
  fieldLabelClassName?: string
  value: FormValue
  onChange: (val: FormValue) => void
  formSchemas: CredentialFormSchema[]
  validating: boolean
  validatedSuccess?: boolean
  showOnVariableMap: Record<string, string[]>
  isEditMode: boolean
  readonly?: boolean
  inputClassName?: string
  isShowDefaultValue?: boolean
  fieldMoreInfo?: (payload: CredentialFormSchema) => JSX.Element | null
}

const Form: FC<FormProps> = ({
  className,
  itemClassName,
  fieldLabelClassName,
  value,
  onChange,
  formSchemas,
  validating,
  validatedSuccess,
  showOnVariableMap,
  isEditMode,
  readonly,
  inputClassName,
  isShowDefaultValue = false,
  fieldMoreInfo,
}) => {
  const language = useLanguage()
  const [changeKey, setChangeKey] = useState('')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const handleFormChange = (key: string, val: string | boolean) => {
    if (isEditMode && (key === '__model_type' || key === '__model_name'))
      return

    setChangeKey(key)
    const shouldClearVariable: Record<string, string | undefined> = {}
    if (showOnVariableMap[key]?.length) {
      showOnVariableMap[key].forEach((clearVariable) => {
        shouldClearVariable[clearVariable] = undefined
      })
    }
    onChange({ ...value, [key]: val, ...shouldClearVariable })
  }

  const toggleDropdown = (variable: string) => {
    if (openDropdown === variable) {
      setOpenDropdown(null)
    } else {
      setOpenDropdown(variable)
    }
  }

  // Custom dropdown component with visible borders and no blue effects
  const CustomDropdown = ({ 
    variable, 
    options, 
    selectedValue, 
    placeholder, 
    label,
    disabled,
    onChange 
  }) => {
    const isOpen = openDropdown === variable
    
    // Get placeholder text - use format "Select your X" based on label or variable name
    let placeholderText = 'Select an option'
    if (placeholder) {
      placeholderText = placeholder[language] || placeholder.en_US
    } else if (label) {
      const labelText = label[language] || label.en_US
      placeholderText = `Select your ${labelText.toLowerCase()}`
    } else {
      // Fallback to variable name formatted nicely
      const formattedVar = variable.replace('__', '').replace(/_/g, ' ')
      placeholderText = `Select your ${formattedVar}`
    }

    // Find the currently selected option for display
    const selectedOption = options.find(option => selectedValue === option.value)

    return (
      <div className="relative w-full">
        {/* Dropdown header with always visible borders */}
        <div 
          className={cn(
            "flex items-center justify-between px-3 py-1.5 rounded-lg border-2 border-gray-400 bg-white cursor-pointer transition-colors duration-200",
            "hover:border-gray-500",
            disabled ? "cursor-not-allowed opacity-60 hover:border-gray-400" : ""
          )}
          onClick={() => !disabled && toggleDropdown(variable)}
        >
          <div className={cn(
            "text-sm",
            selectedOption ? "text-gray-900" : "text-gray-500"
          )}>
            {selectedOption ? (selectedOption.label[language] || selectedOption.label.en_US) : placeholderText}
          </div>
          <div className={cn(
            "text-gray-500 transition-transform duration-200",
            isOpen ? "transform rotate-180" : ""
          )}>
            ▼
          </div>
        </div>
        
        {/* Dropdown options with visible borders */}
        {isOpen && !disabled && (
          <div className="absolute z-50 mt-1 w-full bg-white border-2 border-gray-400 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option, index) => (
              <div
                key={`${variable}-${option.value}`}
                className={cn(
                  "flex items-center px-3 py-2.5 cursor-pointer transition-colors duration-150",
                  "hover:bg-gray-50 hover:text-gray-900",
                  selectedValue === option.value ? "bg-gray-100 text-gray-900 font-medium" : "text-gray-900",
                  index === 0 ? "rounded-t-md" : "",
                  index === options.length - 1 ? "rounded-b-md" : "",
                  "border-b border-gray-100 last:border-b-0"
                )}
                onClick={() => {
                  onChange(option.value)
                  setOpenDropdown(null)
                }}
              >
                <div className="text-sm">
                  {option.label[language] || option.label.en_US}
                </div>
                {selectedValue === option.value && (
                  <div className="ml-auto text-gray-900">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderField = (formSchema: CredentialFormSchema) => {
    const tooltip = formSchema.tooltip
    const tooltipContent = (tooltip && (
      <Tooltip
        popupContent={
          <div className='w-[200px]'>
            {tooltip[language] || tooltip.en_US}
          </div>}
        triggerClassName='ml-1 w-4 h-4'
        asChild={false}
      />
    ))

    if (formSchema.type === FormTypeEnum.textInput || formSchema.type === FormTypeEnum.secretInput || formSchema.type === FormTypeEnum.textNumber) {
      const {
        variable,
        label,
        placeholder,
        required,
        show_on,
      } = formSchema as (CredentialFormSchemaSecretInput | CredentialFormSchemaNumberInput)

      if (show_on.length && !show_on.every(showOnItem => value[showOnItem.variable] === showOnItem.value))
        return null

      const disabled = readonly || (isEditMode && (variable === '__model_type' || variable === '__model_name'))

      return (
        <div key={variable} className={cn(itemClassName, 'py-3')}>
          <div className="relative w-full">
            <input
              className={cn(
                inputClassName, 
                "px-3 py-1.5 rounded-lg border-2 border-gray-400 bg-white w-full transition-colors duration-200 outline-none",
                "hover:border-gray-500 focus:border-gray-500",
                disabled ? 'cursor-not-allowed opacity-60 hover:border-gray-400' : ''
              )}
              value={(isShowDefaultValue && ((value[variable] as string) === '' || value[variable] === undefined || value[variable] === null)) ? formSchema.default : value[variable] || ''}
              onChange={e => handleFormChange(variable, e.target.value)}
              placeholder={placeholder?.[language] || placeholder?.en_US}
              disabled={disabled}
              type={formSchema.type === FormTypeEnum.textNumber ? 'number' : 'text'}
              {...(formSchema.type === FormTypeEnum.textNumber ? { min: (formSchema as CredentialFormSchemaNumberInput).min, max: (formSchema as CredentialFormSchemaNumberInput).max } : {})}
            />
          </div>
          {fieldMoreInfo?.(formSchema)}
          {validating && changeKey === variable && <ValidatingTip />}
        </div>
      )
    }

    if (formSchema.type === FormTypeEnum.radio) {
      const {
        options,
        variable,
        label,
        show_on,
        required,
        placeholder,
      } = formSchema as CredentialFormSchemaRadio

      if (show_on.length && !show_on.every(showOnItem => value[showOnItem.variable] === showOnItem.value))
        return null

      const disabled = readonly || (isEditMode && (variable === '__model_type' || variable === '__model_name'))
      
      // Filter options based on show_on conditions
      const filteredOptions = options.filter((option) => {
        if (option.show_on.length)
          return option.show_on.every(showOnItem => value[showOnItem.variable] === showOnItem.value)
        return true
      })
      
      return (
        <div key={variable} className={cn(itemClassName, 'py-3')}>
          <CustomDropdown 
            variable={variable}
            options={filteredOptions}
            selectedValue={value[variable]}
            placeholder={placeholder}
            label={label}
            disabled={disabled}
            onChange={(val) => handleFormChange(variable, val)}
          />
          {fieldMoreInfo?.(formSchema)}
          {validating && changeKey === variable && <ValidatingTip />}
        </div>
      )
    }

    if (formSchema.type === 'select') {
      const {
        options,
        variable,
        label,
        show_on,
        required,
        placeholder,
      } = formSchema as CredentialFormSchemaSelect

      if (show_on.length && !show_on.every(showOnItem => value[showOnItem.variable] === showOnItem.value))
        return null

      const disabled = readonly || (isEditMode && (variable === '__model_type' || variable === '__model_name'))

      // Filter options based on show_on conditions
      const filteredOptions = options.filter((option) => {
        if (option.show_on.length)
          return option.show_on.every(showOnItem => value[showOnItem.variable] === showOnItem.value)
        return true
      })

      // Use our custom dropdown for consistent styling
      return (
        <div key={variable} className={cn(itemClassName, 'py-3')}>
          <CustomDropdown 
            variable={variable}
            options={filteredOptions}
            selectedValue={(isShowDefaultValue && ((value[variable] as string) === '' || value[variable] === undefined || value[variable] === null)) ? formSchema.default : value[variable]}
            placeholder={placeholder}
            label={label}
            disabled={disabled}
            onChange={(val) => handleFormChange(variable, val)}
          />
          {fieldMoreInfo?.(formSchema)}
          {validating && changeKey === variable && <ValidatingTip />}
        </div>
      )
    }

    if (formSchema.type === 'boolean') {
      const {
        variable,
        label,
        show_on,
        required,
      } = formSchema as CredentialFormSchemaRadio

      if (show_on.length && !show_on.every(showOnItem => value[showOnItem.variable] === showOnItem.value))
        return null

      return (
        <div key={variable} className={cn(itemClassName, 'py-3')}>
          <div className='flex items-center justify-between py-1.5 px-3 text-sm text-gray-900 rounded-lg border-2 border-gray-400 bg-white transition-colors duration-200 hover:border-gray-500'>
            <Radio.Group
              className='flex items-center'
              value={value[variable] === null ? undefined : (value[variable] ? 1 : 0)}
              onChange={val => handleFormChange(variable, val === 1)}
            >
              <Radio value={1} className='!mr-1'>True</Radio>
              <Radio value={0}>False</Radio>
            </Radio.Group>
          </div>
          {fieldMoreInfo?.(formSchema)}
        </div>
      )
    }
  }

  return (
    <div className={className}>
      {
        formSchemas.map(formSchema => renderField(formSchema))
      }
    </div>
  )
}

export default Form