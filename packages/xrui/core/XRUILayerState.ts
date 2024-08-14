/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
