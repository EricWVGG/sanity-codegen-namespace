import styled, {css} from 'styled-components'
import {ChangeIndicator} from '../../../../_unstable/components/changeIndicators'

export const StyledChangeIndicatorWithProvidedFullPath = styled(ChangeIndicator)(() => {
  return css`
    width: 1px;
    height: 100%;

    & > div {
      height: 100%;
    }
  `
})
