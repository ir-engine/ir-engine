import { defineState } from '@etherealengine/hyperflux'

export type UploadRequest = {
  file: File
  projectName: string
}

export const UploadRequestState = defineState({
  name: 'UploadRequestState',
  initial: {
    queue: [] as UploadRequest[]
  }
})

export function executionPromiseKey(request: UploadRequest) {
  return `${request.projectName}-${request.file.name}`
}
