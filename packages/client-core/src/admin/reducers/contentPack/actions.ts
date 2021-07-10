import { CONTENT_PACK_CREATED, CONTENT_PACK_PATCHED, LOADED_CONTENT_PACKS } from '../actions'

export interface LoadedContentPacksAction {
  type: string
  contentPacks: any
}

export interface ContentPackCreatedAction {
  type: string
}

export interface ContentPackPatchedAction {
  type: string
}

export type ContentPackAction = LoadedContentPacksAction | ContentPackCreatedAction | ContentPackPatchedAction

export function loadedContentPacks(contentPacks: any[]): ContentPackAction {
  return {
    type: LOADED_CONTENT_PACKS,
    contentPacks
  }
}

export function createdContentPack(): ContentPackAction {
  return {
    type: CONTENT_PACK_CREATED
  }
}

export function patchedContentPack(): ContentPackAction {
  return {
    type: CONTENT_PACK_PATCHED
  }
}
