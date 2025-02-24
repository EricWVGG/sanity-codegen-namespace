import {type OperationImpl} from '../operations/types'
import {isLiveEditEnabled} from '../utils/isLiveEditEnabled'

type DisabledReason = 'LIVE_EDIT_ENABLED' | 'NOT_PUBLISHED'

export const unpublish: OperationImpl<[], DisabledReason> = {
  disabled: ({schema, snapshots, typeName}) => {
    if (isLiveEditEnabled(schema, typeName)) {
      return 'LIVE_EDIT_ENABLED'
    }
    return snapshots.published ? false : 'NOT_PUBLISHED'
  },
  execute: ({client: globalClient, idPair}) => {
    const vXClient = globalClient.withConfig({apiVersion: 'X'})
    const {dataset} = globalClient.config()

    return vXClient.observable.request({
      url: `/data/actions/${dataset}`,
      method: 'post',
      // this disables referential integrity for cross-dataset references. we
      // have this set because we warn against unpublishes in the `ConfirmDeleteDialog`
      // UI. This operation is run when "unpublish anyway" is clicked
      query: {skipCrossDatasetReferenceValidation: 'true'},
      tag: 'document.unpublish',
      body: {
        actions: [
          {
            actionType: 'sanity.action.document.unpublish',
            draftId: idPair.draftId,
            publishedId: idPair.publishedId,
          },
        ],
      },
    })
  },
}
