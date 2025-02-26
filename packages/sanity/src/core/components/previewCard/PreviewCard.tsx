import {Card, type CardProps} from '@sanity/ui'
import {type ForwardedRef, forwardRef, type HTMLProps, useContext} from 'react'
import {PreviewCardContext} from 'sanity/_singletons'
import {css, styled} from 'styled-components'

/** @internal */
const StyledCard = styled(Card)(() => {
  return css`
    /* TextWithTone uses its own logic to set color, and we therefore need */
    /* to override this logic in order to set the correct color in different states */
    &[data-selected],
    &[data-pressed],
    &:active {
      [data-ui='TextWithTone'] {
        color: inherit;
      }
    }
  `
})

/** @internal */
export interface PreviewCardContextValue {
  selected?: boolean
}

/** @internal */
export function usePreviewCard(): PreviewCardContextValue {
  const context = useContext(PreviewCardContext)

  if (!context) {
    throw new Error('PreviewCard: missing context value')
  }

  return context
}

/** @internal */
export const PreviewCard = forwardRef(function PreviewCard(
  props: CardProps & Omit<HTMLProps<HTMLDivElement>, 'height'>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  const {children, selected, as, ...restProps} = props

  return (
    <StyledCard data-ui="PreviewCard" {...restProps} forwardedAs={as} ref={ref} selected={selected}>
      <PreviewCardContext.Provider value={{selected}}>{children}</PreviewCardContext.Provider>
    </StyledCard>
  )
})
