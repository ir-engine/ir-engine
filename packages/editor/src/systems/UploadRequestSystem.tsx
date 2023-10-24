import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { defineAction, getMutableState, useState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'

import { UploadRequestState } from '@etherealengine/engine/src/assets/state/UploadRequestState'
import { uploadProjectFiles } from '../functions/assetFunctions'

const clearUploadQueueAction = defineAction({
  type: 'ee.editor.clearUploadQueueAction'
})

export const UploadRequestSystem = defineSystem({
  uuid: 'ee.editor.UploadRequestSystem',
  reactor: () => {
    const uploadRequestState = useState(getMutableState(UploadRequestState))
    useEffect(() => {
      const uploadRequests = uploadRequestState.queue.value
      if (uploadRequests.length === 0) return
      const uploadPromises = uploadRequests.map((uploadRequest) => {
        return uploadProjectFiles(uploadRequest.projectName, [uploadRequest.file], true)
      })
      uploadRequestState.queue.set([])
    }, [uploadRequestState.queue.length])
    return null
  }
})
