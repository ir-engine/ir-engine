import { AssetUploadType } from '@xrengine/common/src/interfaces/UploadAssetInterface'

import { client } from '../../feathers'
import { useDispatch } from '../../store'

// const state = createState({})

// store.receptors.push((action: AssetUploadActionType): any => {
//   state.batch((s) => {
//     switch (action.type) {
//       case 'ADMIN_ASSET_UPLOADED':
//         return
//     }
//   }, action.type)
// })

// export const accessAssetUploadState = () => state

// export const useAssetUploadState = () => useState(state) as any as typeof state

//Service
export const AdminAssetUploadService = {
  uploadAssets: async (files: Blob[], args: any[]) => {
    const uploadArguments: AssetUploadType = {
      type: 'admin-file-upload',
      files,
      args
    }
    const result = await client.service('asset-upload').create(uploadArguments)
    const dispatch = useDispatch()
    dispatch(AssetUploadAction.fetchedAssets(result))
  }
}

//Action
export const AssetUploadAction = {
  fetchedAssets: (data: string[]) => {
    return {
      type: 'ADMIN_ASSET_UPLOADED' as const,
      staticResource: data
    }
  }
}

export type AssetUploadActionType = ReturnType<typeof AssetUploadAction[keyof typeof AssetUploadAction]>
