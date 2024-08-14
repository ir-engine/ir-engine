import { defineState, getState } from '@etherealengine/hyperflux'
import Dexie, { Table } from 'dexie'
import { Matrix4 } from 'three'
import { Bounds } from './classes/Bounds'
import { Edges } from './classes/Edges'

export type StateHash = string
export type SVGUrl = string
export type TextureHash = string

export interface StateData {
  cssTransform: Matrix4 | undefined
  bounds: Bounds
  margin: Edges
  padding: Edges
  border: Edges
  fullWidth: number
  fullHeight: number
  pixelRatio: number
  textureWidth: number
  textureHeight: number
  renderAttempts: number
  texture?: TextureData
  pseudo: {
    hover: boolean
    active: boolean
    focus: boolean
    target: boolean
  }
  data: TextureStoreData
}

export interface TextureData {
  canvas?: HTMLCanvasElement
  ktx2Url?: string
  data: TextureStoreData
}

export interface StateStoreData {
  hash: StateHash
  textureHash?: TextureHash
}
export interface TextureStoreData {
  hash: TextureHash
  timestamp: number
  texture?: Uint8Array
}

export class XRUILayerStore extends Dexie {
  states!: Table<StateStoreData>
  textures!: Table<TextureStoreData>

  _unsavedTextureData = new Map<TextureHash, TextureStoreData>()
  _stateData = new Map<StateHash | HTMLMediaElement, StateData>()
  _textureData = new Map<TextureHash, TextureData>()
  imagePool = [] as Array<HTMLImageElement>

  constructor() {
    super('xrui-layer-store')
    this.version(1).stores({
      states: '&hash',
      textures: '&hash, timestamp'
    })
  }
}

export const XRUILayerState = defineState({
  name: 'XRUILayerState',

  initial: () => {
    return {
      store: new XRUILayerStore(),
      states: {} as Record<StateHash, StateStoreData>,
      textures: {} as Record<TextureHash, TextureStoreData>
    }
  },

  reactor: () => {},

  saveStore() {
    const state = getState(XRUILayerState)
    const stateData = Array.from(Object.entries(state.states))
      .filter(([k, v]) => typeof k === 'string')
      .map(([k, v]) => {
        const texture = state.textures[v.textureHash ?? '']
        return { hash: k as string, textureHash: texture.hash }
      })
    const textureData = Array.from(this._unsavedTextureData.values())
    this._unsavedTextureData.clear()
    return XRUILayerState.loadIntoStore({
      stateData: state.states,
      textureData
    })
  },
  /**
   * Export the cache data for this
   */
  downloadStoreCache() {
    await XRUILayerState.saveIntoStore()
    const blob = await XRUILayerState.exportCache()
    const path = location.pathname.split('/').filter((x) => x)
    downloadBlob(blob, 'web.' + location.host + '.' + (path[path.length - 1] ?? '') + '.cache')
  },

  loadIntoStore(data: { stateData: StateStoreData[]; textureData: TextureStoreData[] }) {
    // load into this._textureData
    for (const t of data.textureData) {
      const texture = this._textureData.get(t.hash) || {
        hash: t.hash,
        canvas: undefined,
        ktx2Url: undefined
      }
      if (!texture.ktx2Url && t.texture)
        texture.ktx2Url = URL.createObjectURL(new Blob([t.texture], { type: 'image/ktx2' }))
    }
    // load into this._stateData
    for (const s of data.stateData) {
      const state = this.getLayerState(s.hash)
      if (!state.texture && s.textureHash) {
        const textureData = this._textureData.get(s.textureHash)
        state.texture = textureData
      }
    }
    // load into db
    return Promise.all([this.store.states.bulkPut(data.stateData), this.store.textures.bulkPut(data.textureData)])
  }
})
