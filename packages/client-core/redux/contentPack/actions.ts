import {
  CONTENT_PACK_CREATE,
  CONTENT_PACK_PATCHED,
  LOADED_CONTENT_PACKS,
} from '../actions';

export interface LoadedContentPacksAction {
  type: string;
  contentPacks: any;
}

export type ContentPackAction =
    LoadedContentPacksAction

export function loadedContentPacks(contentPacks: any[]): ContentPackAction {
  return {
    type: LOADED_CONTENT_PACKS,
    contentPacks
  };
}
