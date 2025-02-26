import {useContext} from 'react'
import {PaneRouterContext} from 'sanity/_singletons'

import {type PaneRouterContextValue} from './types'

/**
 *
 * @hidden
 * @beta
 */
export function usePaneRouter(): PaneRouterContextValue {
  return useContext(PaneRouterContext)
}
