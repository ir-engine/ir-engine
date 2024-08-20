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

import { defineState, getMutableState, getState, useMutableState } from '@etherealengine/hyperflux'
import Dexie, { Table } from 'dexie'
import { decompress } from 'fflate'
import { Packr, Unpackr } from 'msgpackr'
import { CanvasTexture, CompressedTexture, Matrix4 } from 'three'
import { Bounds } from './classes/Bounds'
import { Edges } from './classes/Edges'

export type StateHash = string
export type SVGUrl = string
export type TextureHash = string

export interface StateData {
  hash: StateHash
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
  pseudo: {
    hover: boolean
    active: boolean
    focus: boolean
    target: boolean
  }
  svgURL?: SVGUrl
  textureHash?: TextureHash
}

export interface TextureData {
  hash: TextureHash
  timestamp: number
  texture?: Uint8Array
  canvas?: HTMLCanvasElement
  ktx2Url?: string
  canvasTexture?: CanvasTexture
  compressedTexture?: CompressedTexture
}

export class XRUILayerStore extends Dexie {
  states!: Table<StateData>
  textures!: Table<TextureData>

  _unsavedTextureData = [] as TextureHash[]
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
      states: {} as Record<StateHash, StateData>,
      textures: {} as Record<TextureHash, TextureData>
    }
  },

  reactor: () => {},

  async saveStore() {
    const state = getState(XRUILayerState)
    const textureData = state.store._unsavedTextureData.map((v) => state.textures[v])
    state.store._unsavedTextureData.length = 0
    return XRUILayerState.loadIntoStore(state.states, Object.fromEntries(textureData.map((v) => [v.hash, v])))
  },

  async loadIntoStore(states: Record<StateHash, StateData>, textures: Record<TextureHash, TextureData>) {
    const state = getMutableState(XRUILayerState)
    // load into textureData
    state.states.merge(states)
    state.textures.merge(textures)
    const loadedTextureHashes = Object.keys(textures)
    // upload all the known state data, except for svg url
    const stateData = Object.values(state.states.value).map((v) => {
      return {
        ...v,
        svgURL: undefined
      }
    }) as StateData[]
    // only upload the non-derivative texture data
    const textureData = Object.values(state.textures.value)
      .filter((v) => {
        return loadedTextureHashes.includes(v.hash)
      })
      .map((v) => {
        return {
          hash: v.hash,
          timestamp: v.timestamp,
          texture: v.texture,
          canvas: undefined,
          ktx2Url: undefined,
          canvasTexture: undefined,
          compressedTexture: undefined
        }
      }) as TextureData[]
    // load into db
    return Promise.all([state.store.states.value.bulkPut(stateData), state.store.textures.value.bulkPut(textureData)])
  },

  getActiveStateHashes() {
    return Object.keys(getState(XRUILayerState).states)
  },

  async requestStoredData(hash: StateHash) {
    const stateData = XRUILayerState.getLayerState(hash)
    if (typeof hash !== 'string') return stateData
    if (!this._statesRequestedFromStore.has(hash)) {
      this._statesRequestedFromStore.add(hash)
      const state = await this.store.states.get(hash)
      if (state?.textureHash) {
        stateData.texture = this.getTextureState(state.textureHash)
      }
    }
    const textureData = stateData.texture
    if (
      textureData &&
      textureData.hash &&
      !textureData.canvas &&
      !textureData.ktx2Url &&
      !this._texturesRequestedFromStore.has(textureData?.hash)
    ) {
      this._texturesRequestedFromStore.add(textureData.hash)
      const storedTexture = await this.store.textures.get(textureData.hash)
      if (storedTexture?.texture && !textureData.canvas) {
        const data = await new Promise<Uint8Array>((resolve, reject) => {
          decompress(storedTexture.texture!, { consume: true }, (err, data) => {
            if (err) return reject(err)
            resolve(data)
          })
        })
        if (!textureData.canvas) {
          textureData.ktx2Url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/ktx2' }))
        }
      }
    }
    return stateData
  },

  useStateData(hash: StateHash) {
    const state = useMutableState(XRUILayerState)
    let data = state.states[hash].value
    if (!data) {
      data = {
        hash,
        cssTransform: undefined,
        bounds: new Bounds(),
        margin: new Edges(),
        padding: new Edges(),
        border: new Edges(),
        fullWidth: 0,
        fullHeight: 0,
        renderAttempts: 0,
        textureWidth: 32,
        textureHeight: 32,
        pixelRatio: 1,
        pseudo: {
          hover: false,
          active: false,
          focus: false,
          target: false
        },
        textureHash: undefined
      }
      state.states[hash].set(data)
    }
    return state.states[hash]
  },

  useTextureData(textureHash: TextureHash) {
    const state = useMutableState(XRUILayerState)
    let data = state.textures[textureHash].value
    if (!data) {
      data = {
        hash: textureHash,
        timestamp: 0,
        texture: undefined,
        canvas: undefined,
        ktx2Url: undefined,
        canvasTexture: undefined,
        compressedTexture: undefined
      }
      state.textures[textureHash].set(data)
    }
    return state.textures[textureHash]
  }

  /**
   * Export the cache data for this
   */
  // async downloadStoreCache() {
  //   await XRUILayerState.saveStore()
  //   const blob = await XRUILayerState.exportCache()
  //   const path = location.pathname.split('/').filter((x) => x)
  //   downloadBlob(blob, 'web.' + location.host + '.' + (path[path.length - 1] ?? '') + '.cache')
  // },

  /**
  //  * Export a cache file for the given state hashes
  //  * @param states by default all active states are exported
  //  * @returns
  //  */
  // async exportCache(states: StateHash[] = this.getActiveStateHashes()) {
  //   const stateData = (await this.store.states.bulkGet(states)) as StateData[]

  //   let textureData = (await this.store.textures.bulkGet(
  //     stateData.map((v) => v.textureHash).filter((v) => typeof v === 'string') as TextureHash[]
  //   )) as TextureData[]
  //   textureData = textureData.filter((v) => v && typeof v.hash === 'string' && v.texture)

  //   const data = {
  //     states: Object.fromEntries(stateData.map((v) => [v.hash, v])),
  //     textureData: Object.fromEntries(textureData.map((v) => [v.hash, v]))
  //   }
  //   const buffer = this._packr.pack(data)

  //   return new Promise<Blob>((resolve, reject) => {
  //     compress(buffer, { consume: true }, (err, data) => {
  //       if (err) return reject(err)
  //       resolve(new Blob([data.buffer]))
  //     })
  //   })
  // },

  // async importCache(url: string) {
  //   try {
  //     const response = await fetch(url)
  //     const zipped = await response.arrayBuffer()
  //     const buffer = await new Promise<Uint8Array>((resolve, reject) => {
  //       decompress(new Uint8Array(zipped), { consume: true }, (err, data) => {
  //         if (err) return reject(err)
  //         resolve(data)
  //       })
  //     })
  //     const data = this._unpackr.unpack(buffer) as {
  //       states: Record<StateHash, StateStoreData>
  //       textures: Record<TextureHash, TextureStoreData>
  //     }

  //     data.textureData = data.textureData.filter((t) => t && t.hash && t.texture)
  //     return XRUILayerState.loadIntoStore(data)
  //   } catch (err) {
  //     console.warn('Failed to import cache', err)
  //   }
  // },
})

const _packr = new Packr({ structuredClone: true })
const _unpackr = new Unpackr({ structuredClone: true })
