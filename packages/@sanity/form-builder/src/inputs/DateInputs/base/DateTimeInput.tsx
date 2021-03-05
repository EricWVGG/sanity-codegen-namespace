import React, {useCallback} from 'react'
import FocusLock from 'react-focus-lock'
import {Box, Button, LayerProvider, Popover, useClickOutside, useForwardedRef} from '@sanity/ui'
import {CalendarIcon} from '@sanity/icons'
import {DatePicker} from './DatePicker'
import {LazyTextInput} from './LazyTextInput'

type Props = {
  value?: Date
  id?: string
  readOnly?: boolean
  selectTime?: boolean
  timeStep?: number
  customValidity?: string
  placeholder?: string
  onInputChange?: (event: React.FocusEvent<HTMLInputElement>) => void
  inputValue?: string
  onChange: (date: Date | null) => void
}

export const DateTimeInput = React.forwardRef(function DateTimeInput(
  props: Props,
  forwardedRef: React.ForwardedRef<HTMLInputElement>
) {
  const {value, inputValue, onInputChange, onChange, selectTime, timeStep, ...rest} = props

  const [popoverRef, setPopoverRef] = React.useState<HTMLElement | null>(null)

  const inputRef = useForwardedRef(forwardedRef)
  const buttonRef = React.useRef(null)

  const [isPickerOpen, setPickerOpen] = React.useState(false)

  useClickOutside(() => setPickerOpen(false), [popoverRef])

  const handleDeactivation = useCallback(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [inputRef])

  const handleKeyUp = useCallback((e) => {
    if (e.key === 'Escape') {
      setPickerOpen(false)
    }
  }, [])

  const handleClick = useCallback(() => setPickerOpen(true), [])

  return (
    <LazyTextInput
      ref={inputRef}
      {...rest}
      value={inputValue}
      onChange={onInputChange}
      suffix={
        <LayerProvider zOffset={1000}>
          <Popover
            data-testid="date-input-dialog"
            portal
            content={
              <FocusLock onDeactivation={handleDeactivation}>
                <DatePicker
                  selectTime={selectTime}
                  timeStep={timeStep}
                  onKeyUp={handleKeyUp}
                  value={value}
                  onChange={onChange}
                />
              </FocusLock>
            }
            open={isPickerOpen}
            placement="bottom-end"
            ref={setPopoverRef}
            radius={2}
          >
            <Box padding={1}>
              <Button
                ref={buttonRef}
                icon={CalendarIcon}
                mode="bleed"
                padding={2}
                onClick={handleClick}
                style={{display: 'block'}}
                data-testid="select-date-button"
              />
            </Box>
          </Popover>
        </LayerProvider>
      }
    />
  )
})
