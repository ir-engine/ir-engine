import { AdminContentPack } from '@xrengine/common/src/interfaces/AdminContentPack'

export const ContentPackAction = {
  loadedContentPacks: (contentPacks: AdminContentPack[]) => {
    return {
      type: 'LOADED_CONTENT_PACKS' as const,
      contentPacks: contentPacks
    }
  },
  createdContentPack: () => {
    return {
      type: 'CONTENT_PACK_CREATED' as const
    }
  },
  patchedContentPack: () => {
    return {
      type: 'CONTENT_PACK_PATCHED' as const
    }
  }
}

export type ContentPackActionType = ReturnType<typeof ContentPackAction[keyof typeof ContentPackAction]>
