import {Box, Card, Flex} from '@sanity/ui'
import {type ReactNode, useCallback, useEffect, useMemo, useState} from 'react'
import {css, styled} from 'styled-components'

import {TooltipDelayGroupProvider} from '../../../../ui-components'
import {type DocumentFieldActionNode} from '../../../config'
import {FieldPresence, type FormNodePresence} from '../../../presence'
import {calcAvatarStackWidth} from '../../../presence/utils'
import {FieldActionMenu} from '../../field'
import {type FieldCommentsProps} from '../../types'

const Root = styled(Flex)<{
  $floatingCardWidth: number
  $slotWidth: number
  $floatingCardVisible: boolean
}>(({theme, $floatingCardWidth, $slotWidth, $floatingCardVisible}) => {
  const {space} = theme.sanity
  return css`
    /* Prevent buttons from taking up extra vertical space */
    line-height: 1;
    width: 100%;
    /* For floating actions menu */
    position: relative;

    [data-ui='PresenceBox'] {
      position: absolute;
      bottom: 0;
      right: ${$slotWidth + $floatingCardWidth + space[1]}px;
    }
    @media (hover: hover) {
      // If hover is supported, we hide the floating card by default, so only add space for it when it's visible.
      [data-ui='PresenceBox'] {
        position: absolute;
        bottom: 0;
        right: ${$slotWidth + ($floatingCardVisible ? $floatingCardWidth : 0) + space[1]}px;
      }
    }
  `
})

const ContentBox = styled(Box)<{
  $presenceMaxWidth: number
}>(({theme, $presenceMaxWidth}) => {
  const {space} = theme.sanity
  return css`
    max-width: calc(100% - ${$presenceMaxWidth + space[1]}px);
    min-width: 75%;
  `
})

const SlotBox = styled(Box)<{
  $right: number
  $fieldActionsVisible: boolean
}>(({theme, $right, $fieldActionsVisible}) => {
  const {space} = theme.sanity
  const right = $fieldActionsVisible ? $right + space[1] : $right
  return css`
    position: absolute;
    bottom: 0;
    right: ${right}px;
  `
})

const FieldActionsFloatingCard = styled(Card)`
  align-items: center;
  bottom: 0;
  position: absolute;
  right: 0;
  transition: opacity 150ms ease;
  line-height: 1;

  @media (hover: hover) {
    // If hover is supported, we hide the floating card by default
    // and only show it when it has focus within or when the field is hovered or focused.
    opacity: 0;
    pointer-events: none;

    [data-ui='FieldActionsFlex'] {
      opacity: 0;
    }

    &[data-actions-visible='false']:not(:focus-within) {
      // Remove the shadow when the field actions are not visible
      box-shadow: none;

      // Since the field actions always will be present in the DOM (to make them focusable) –
      // they will always affect the width of the floating card, even when they are not visible.
      // Therefore, we remove the background of the floating card when the field actions are not visible.
      background: transparent;
    }

    // Remove the shadow when the field has comments but no actions
    &[data-has-comments='true']:not([data-has-actions='true']) {
      box-shadow: none;
    }

    // Show the floating card when it has focus within (ie when field actions are focused).
    &:focus-within {
      opacity: 1;
      pointer-events: auto;
      width: max-content;

      [data-ui='FieldActionsFlex'] {
        opacity: 1;
        pointer-events: auto;
        width: max-content;
      }
    }
  }

  &[data-visible='true'] {
    opacity: 1;
    pointer-events: auto;
    width: max-content;
  }

  &[data-actions-visible='true'] {
    [data-ui='FieldActionsFlex'] {
      opacity: 1;
      pointer-events: auto;
      width: max-content;
    }
  }
`

const FieldActionsFlex = styled(Flex)`
  gap: inherit;
  transition: opacity 150ms ease;
`

const MAX_AVATARS = 4

interface FormFieldBaseHeaderProps {
  __internal_comments?: FieldCommentsProps // DO NOT USE
  __internal_slot?: ReactNode // ONLY USED BY AI ASSIST PLUGIN
  actions?: DocumentFieldActionNode[]
  content: ReactNode
  fieldFocused: boolean
  fieldHovered: boolean
  presence?: FormNodePresence[]
}

export function FormFieldBaseHeader(props: FormFieldBaseHeaderProps) {
  const {
    __internal_comments: comments,
    __internal_slot: slot,
    actions,
    content,
    fieldFocused,
    fieldHovered,
    presence,
  } = props
  const [focused, setFocused] = useState<boolean>(false)
  // State for if an actions menu is open
  const [menuOpen, setMenuOpen] = useState<boolean>(false)

  // States for floating card element and its width
  const [floatingCardElement, setFloatingCardElement] = useState<HTMLDivElement | null>(null)
  const [floatingCardWidth, setFloatingCardWidth] = useState<number>(0)

  // States for slot element and its width
  const [slotElement, setSlotElement] = useState<HTMLDivElement | null>(null)
  const [slotWidth, setSlotWidth] = useState<number>(0)

  // Extract comment related data with default values
  const {
    hasComments = false,
    button: commentButton = null,
    isAddingComment = false,
  } = comments || {}
  // Determine if actions exist and if field actions should be shown
  const hasActions = actions && actions.length > 0
  const showFieldActions = fieldFocused || fieldHovered || menuOpen || isAddingComment

  // Determine if there's a comment button or actions to show.
  // We check for `comments.button` since that's the visual element that should be
  // used for comments. If no button is provided, we don't have anything to show for comments.
  const hasCommentsButtonOrActions = comments?.button || hasActions

  // Determine if floating card with actions should be shown
  const shouldShowFloatingCard = focused || showFieldActions || hasComments

  const handleSetFloatingCardElementWidth = useCallback(() => {
    if (floatingCardElement) {
      const {width} = floatingCardElement.getBoundingClientRect()
      setFloatingCardWidth(width || 0)
    }
  }, [floatingCardElement])

  // When a focus or blur event occurs on the floating card, we need to recalculate its width.
  // This is because presence should be positioned relative to the floating card.
  // We need this because we don't conditionally render the floating card and rely on CSS to
  // show/hide it, and therefore the width calculation won't be triggered when the card is shown or hidden.
  const handleFocusCapture = useCallback(() => {
    handleSetFloatingCardElementWidth()
    setFocused(true)
  }, [handleSetFloatingCardElementWidth])

  const handleBlurCapture = useCallback(() => {
    handleSetFloatingCardElementWidth()
    setFocused(false)
  }, [handleSetFloatingCardElementWidth])

  // Calculate floating card's width
  useEffect(() => {
    handleSetFloatingCardElementWidth()
  }, [handleSetFloatingCardElementWidth, showFieldActions])

  // Calculate slot element's width
  useEffect(() => {
    if (slotElement) {
      const {width} = slotElement.getBoundingClientRect()
      setSlotWidth(width || 0)
    }
  }, [slotElement])

  // Construct the slot element if slot is provided
  const slotEl = useMemo(() => {
    if (!slot) return null

    return (
      <SlotBox
        $fieldActionsVisible={Boolean(showFieldActions)}
        $right={floatingCardWidth}
        ref={setSlotElement}
      >
        {slot}
      </SlotBox>
    )
  }, [floatingCardWidth, showFieldActions, slot])

  return (
    <Root
      align="flex-end"
      justify="space-between"
      $floatingCardVisible={shouldShowFloatingCard}
      $floatingCardWidth={floatingCardWidth}
      $slotWidth={slotWidth}
    >
      <ContentBox
        data-ui="fieldHeaderContentBox"
        flex={1}
        paddingY={2}
        $presenceMaxWidth={calcAvatarStackWidth(MAX_AVATARS)}
      >
        {content}
      </ContentBox>

      {presence && presence.length > 0 && (
        <Box data-ui="PresenceBox" flex="none">
          <FieldPresence maxAvatars={MAX_AVATARS} presence={presence} />
        </Box>
      )}

      {slotEl}

      {(hasCommentsButtonOrActions || hasComments) && (
        <TooltipDelayGroupProvider>
          <FieldActionsFloatingCard
            data-actions-visible={showFieldActions ? 'true' : 'false'}
            data-has-actions={hasActions ? 'true' : 'false'}
            data-has-comments={hasComments ? 'true' : 'false'}
            data-visible={shouldShowFloatingCard ? 'true' : 'false'}
            display="flex"
            onBlurCapture={handleBlurCapture}
            onFocusCapture={handleFocusCapture}
            ref={setFloatingCardElement}
            sizing="border"
          >
            {hasActions && (
              <FieldActionsFlex align="center" data-ui="FieldActionsFlex">
                <FieldActionMenu nodes={actions} onMenuOpenChange={setMenuOpen} />
              </FieldActionsFlex>
            )}

            {commentButton}
          </FieldActionsFloatingCard>
        </TooltipDelayGroupProvider>
      )}
    </Root>
  )
}
