import React, { FC, forwardRef, HTMLAttributes, useEffect, useId } from 'react'
import {
  ElSearchableDropdownCloseButton,
  ElSearchableDropdownContainer,
  ElSearchableDropdownResult,
  ElSearchableDropdownResultsContainer,
  ElSearchableDropdownSearchInput,
  ElSearchableDropdownSearchInputAddOn,
  ElSearchableDropdownSearchLabel,
  ElSearchableDropdownSearchLoader,
} from './__styles__'
import { Icon, IconNames } from '../icon'
import { handleSetNativeInput } from '../multi-select'
import { generateRandomId } from '../../storybook/random-id'
import { Label } from '../label'
import { elMb3 } from '../../styles/spacing'
import { elFlex } from '../../styles/flexbox'
import { cx } from '@linaria/core'

export interface SearchableDropdownProps<T> extends React.InputHTMLAttributes<HTMLInputElement> {
  getResults: (query: string) => Promise<T[]>
  getResultValue: (result: T) => string
  getResultLabel: (result: T) => string
  icon?: IconNames
  defaultVal?: T
  label?: string
}

export interface ControlledSearchableDropdownProps<T> extends React.InputHTMLAttributes<HTMLInputElement> {
  isResultsListVisible: boolean
  isClearVisible: boolean
  loading: boolean
  selectedValue: string
  resultsList: { label: string; result: T }[]
  onResultClick: (result: { label: string; result: T }) => void
  onClear: () => void
  icon?: IconNames
  label?: string
}

export const SearchableDropdownControlledInner = <T extends unknown>(
  {
    isResultsListVisible,
    icon = 'search',
    loading,
    resultsList,
    onResultClick,
    onClear,
    isClearVisible,
    value,
    selectedValue,
    id,
    label,
    ...inputProps
  }: ControlledSearchableDropdownProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) => {
  const listId = useId()
  return (
    <>
      {label && (
        <Label className={cx(elFlex, elMb3)} htmlFor={id}>
          {label}
        </Label>
      )}
      <ElSearchableDropdownContainer
        role="combobox"
        aria-expanded={isResultsListVisible}
        aria-controls={listId}
        aria-haspopup="listbox"
      >
        <input id={id} style={{ display: 'none' }} readOnly value={selectedValue} ref={ref} />
        <ElSearchableDropdownSearchInputAddOn>
          <Icon icon={icon} fontSize="1rem" intent="default" />
        </ElSearchableDropdownSearchInputAddOn>
        <ElSearchableDropdownSearchInput data-testid="search-input" value={value} {...inputProps} />
        {isResultsListVisible && (
          <ElSearchableDropdownResultsContainer role="listbox" id={listId}>
            {resultsList.map((result, index) => (
              <ElSearchableDropdownResult
                data-testid={`dropdown-result-${index}`}
                role="option"
                key={generateRandomId()}
                onClick={() => onResultClick(result)}
              >
                {result.label}
              </ElSearchableDropdownResult>
            ))}
            {!loading && !resultsList.length && (
              <ElSearchableDropdownResult>No results found</ElSearchableDropdownResult>
            )}
          </ElSearchableDropdownResultsContainer>
        )}
        {loading && <ElSearchableDropdownSearchLoader />}
        {isClearVisible && <ElSearchableDropdownCloseButton icon="close" onClick={onClear} />}
      </ElSearchableDropdownContainer>
    </>
  )
}

export const ControlledSearchableDropdown = forwardRef(SearchableDropdownControlledInner) as <T>(
  props: ControlledSearchableDropdownProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> },
) => ReturnType<typeof SearchableDropdownControlledInner>

export const SearchableDropdownInner = <T extends unknown>(
  {
    getResults,
    icon,
    getResultValue,
    getResultLabel,
    onChange,
    defaultVal,
    id,
    ...inputProps
  }: SearchableDropdownProps<T>,
  ref: React.ForwardedRef<HTMLInputElement>,
) => {
  const defaultValue = defaultVal ? getResultValue(defaultVal) : ''
  const dropdownId = id ?? generateRandomId()
  const [value, setValue] = React.useState(defaultVal ? getResultLabel(defaultVal) : '')
  const [loading, setLoading] = React.useState(false)
  const [resultsList, setResultsList] = React.useState<T[]>(defaultVal ? [defaultVal] : [])
  const [resultsVisible, setResultsVisible] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(defaultValue)

  useEffect(() => {
    if (value.length > 2 && !resultsList.map(getResultLabel).includes(value)) {
      setLoading(true)
      getResults(value)
        .then((results) => {
          setResultsList(results)
          setLoading(false)
          setResultsVisible(true)
        })
        .catch((error) => console.error(error))
    }
  }, [value])

  useEffect(handleSetNativeInput(dropdownId, [value]), [value])

  const handleSelectionChange = (label: string, value: string) => {
    setValue(label)
    setSelectedValue(value)
    setResultsVisible(false)
    if (onChange) {
      onChange({
        target: {
          ...inputProps,
          value,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>)
    }
  }

  let blurTimeout

  return (
    <ControlledSearchableDropdown<T>
      onChange={(e) => {
        setValue(e.target.value)
      }}
      onFocus={() => {
        if (resultsList.length > 0 && value.length > 2) {
          clearTimeout(blurTimeout)
          setResultsVisible(true)
        }
      }}
      onBlur={() => {
        blurTimeout = setTimeout(() => {
          setResultsVisible(false)
        }, 200)
      }}
      value={value}
      ref={ref}
      isResultsListVisible={resultsVisible}
      icon={icon || 'search'}
      loading={loading}
      resultsList={resultsList.map((result) => ({
        label: getResultLabel(result),
        result,
      }))}
      onResultClick={({ label, result }) => {
        handleSelectionChange(label, getResultValue(result))
      }}
      selectedValue={selectedValue}
      onClear={() => handleSelectionChange('', '')}
      isClearVisible={!!selectedValue && !loading}
      id={dropdownId}
      {...inputProps}
    />
  )
}

export const SearchableDropdown = forwardRef(SearchableDropdownInner) as <T>(
  props: SearchableDropdownProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> },
) => ReturnType<typeof SearchableDropdownInner>

export const SearchableDropdownSearchLabel: FC<HTMLAttributes<HTMLLabelElement>> = ({ children, ...rest }) => {
  return <ElSearchableDropdownSearchLabel {...rest}>{children}</ElSearchableDropdownSearchLabel>
}
